"""
PRISM Agent Orchestrator — Synchronous mapping and execution sequence for the decoupled AI pipelines.
"""
import time
from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.engine import ScalarResult
from sqlalchemy.ext.asyncio import AsyncSession

from agents.change_agent import ChangeAgent
from agents.dependency_agent import DependencyAgent
from agents.history_agent import HistoryAgent
from agents.reviewer_agent import ReviewerAgent
from agents.risk_agent import RiskAgent
from agents.summary_agent import SummaryAgent
from config import settings
from db.database import async_session_factory
from models.db_models import FileRiskHistory, MRAnalysis
from models.schemas import (
    ChangeAnalysisResult,
    DependencyAnalysisResult,
    HistoryAnalysisResult,
    MREvent,
    ReviewerAnalysisResult,
    RiskAnalysisResult,
)
from services.gitlab_service import GitLabService, format_comment
from services.repo_service import clone_or_fetch
from utils.logging import log_error, log_pipeline_complete, log_pipeline_start


class AgentOrchestrator:
    """
    Spawns and sequences the strict 7-stage analytical pipeline.
    Maintains stateless failure isolation; the orchestrator will never crash the webhook ingress event.
    """

    def __init__(self) -> None:
        self.change_agent = ChangeAgent()
        self.dependency_agent = DependencyAgent()
        self.history_agent = HistoryAgent()
        self.risk_agent = RiskAgent()
        self.reviewer_agent = ReviewerAgent()
        self.summary_agent = SummaryAgent()
        self.gitlab = GitLabService()

    async def run_pipeline(self, mr_event: MREvent) -> None:
        """
        Executes the async graph traversal and LLM generation loop organically.
        Stage order matters strictly: Dependency trees require Change inputs; Risk requires all three prior states.
        """
        start_time: float = time.time()
        log_pipeline_start(mr_event)

        try:
            repo = await clone_or_fetch(
                mr_event.project_namespace,
                mr_event.project_http_url,
            )

            change_analysis: ChangeAnalysisResult = await self.change_agent.analyze(mr_event, repo)

            dependency_analysis: DependencyAnalysisResult = await self.dependency_agent.build_graph(
                change_analysis.changed_files, repo.working_dir
            )

            history_analysis: HistoryAnalysisResult = await self.history_agent.analyze(
                change_analysis.changed_files, repo, mr_event.author_username
            )

            risk_analysis: RiskAnalysisResult = self.risk_agent.calculate(
                change_analysis, dependency_analysis, history_analysis
            )

            reviewer_analysis: ReviewerAnalysisResult = await self.reviewer_agent.suggest(
                change_analysis.changed_files,
                dependency_analysis.blast_radius,
                repo,
                mr_event.author_username,
            )

            ai_summary: str = await self.summary_agent.generate(
                risk_analysis,
                dependency_analysis,
                reviewer_analysis,
                history_analysis,
                mr_event.mr_title,
            )

            await self._save_analysis(
                mr_event,
                change_analysis,
                dependency_analysis,
                history_analysis,
                risk_analysis,
                reviewer_analysis,
                ai_summary,
            )

            comment: str = format_comment(
                risk_analysis, dependency_analysis, reviewer_analysis, ai_summary
            )
            
            await self.gitlab.post_mr_comment(
                mr_event.project_id, mr_event.mr_iid, comment
            )

            if risk_analysis.score >= settings.risk_block_threshold:
                await self.gitlab.add_labels(
                    mr_event.project_id,
                    mr_event.mr_iid,
                    ["high-risk"],
                )

            duration_ms: float = (time.time() - start_time) * 1000
            log_pipeline_complete(
                mr_event,
                risk_analysis.score,
                duration_ms,
                dependency_analysis.total_affected,
            )

        except Exception as generic_pipeline_error:
            # Catch-all strictly for the top-level executor; prevents async starvation
            log_error(mr_event, "pipeline_fatal", generic_pipeline_error)

    async def _save_analysis(
        self,
        mr_event: MREvent,
        change_analysis: ChangeAnalysisResult,
        dependency_analysis: DependencyAnalysisResult,
        history_analysis: HistoryAnalysisResult,
        risk_analysis: RiskAnalysisResult,
        reviewer_analysis: ReviewerAnalysisResult,
        ai_summary: str,
    ) -> None:
        """
        Atomic upsert transaction locking analytic results directly into the PostgreSQL persistent layer.
        """
        try:
            async with async_session_factory() as session:
                stmt = insert(MRAnalysis).values(
                    project_gitlab_id=mr_event.project_id,
                    project_namespace=mr_event.project_namespace,
                    mr_iid=mr_event.mr_iid,
                    mr_title=mr_event.mr_title,
                    author_username=mr_event.author_username,
                    source_branch=mr_event.source_branch,
                    risk_score=risk_analysis.score,
                    risk_level=risk_analysis.level,
                    lines_changed=change_analysis.lines_added + change_analysis.lines_removed,
                    files_changed=len(change_analysis.changed_files),
                    blast_radius_size=dependency_analysis.total_affected,
                    impact_depth=dependency_analysis.max_impact_depth,
                    risk_breakdown=risk_analysis.breakdown.model_dump(),
                    blast_radius_data=dependency_analysis.dependency_graph,
                    ai_summary=ai_summary,
                    suggested_reviewers=[r.model_dump() for r in reviewer_analysis.reviewers],
                )

                stmt = stmt.on_conflict_do_update(
                    index_elements=['project_gitlab_id', 'mr_iid'],
                    set_={
                        'mr_title': stmt.excluded.mr_title,
                        'source_branch': stmt.excluded.source_branch,
                        'risk_score': stmt.excluded.risk_score,
                        'risk_level': stmt.excluded.risk_level,
                        'lines_changed': stmt.excluded.lines_changed,
                        'files_changed': stmt.excluded.files_changed,
                        'blast_radius_size': stmt.excluded.blast_radius_size,
                        'impact_depth': stmt.excluded.impact_depth,
                        'risk_breakdown': stmt.excluded.risk_breakdown,
                        'blast_radius_data': stmt.excluded.blast_radius_data,
                        'ai_summary': stmt.excluded.ai_summary,
                        'suggested_reviewers': stmt.excluded.suggested_reviewers,
                        'created_at': datetime.now(timezone.utc)
                    }
                ).returning(MRAnalysis.id)

                db_result = await session.execute(stmt)
                analysis_id: int = db_result.scalar_one()

                await session.execute(
                    delete(FileRiskHistory).where(FileRiskHistory.analysis_id == analysis_id)
                )

                for file_path in change_analysis.changed_files:
                    file_history = FileRiskHistory(
                        project_gitlab_id=mr_event.project_id,
                        file_path=file_path,
                        analysis_id=analysis_id,
                        churn_score=history_analysis.churn_scores.get(file_path, 0),
                        incident_count=history_analysis.incident_counts.get(file_path, 0),
                    )
                    session.add(file_history)

                await session.commit()

        except Exception as db_error:
            log_error(mr_event, "database_upsert_failure", db_error)
