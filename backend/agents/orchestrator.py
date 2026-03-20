"""
PRISM Agent Orchestrator — Pipeline coordinator that sequences all agents.
"""
import time
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from models.schemas import MREvent, AnalysisResult
from models.db_models import MRAnalysis, FileRiskHistory
from db.database import async_session_factory
from agents.change_agent import ChangeAgent
from agents.dependency_agent import DependencyAgent
from agents.history_agent import HistoryAgent
from agents.risk_agent import RiskAgent
from agents.reviewer_agent import ReviewerAgent
from agents.summary_agent import SummaryAgent
from services.gitlab_service import GitLabService, format_comment
from services.repo_service import clone_or_fetch
from utils.logging import log_pipeline_start, log_pipeline_complete, log_error


class AgentOrchestrator:
    """Coordinates the full PRISM analysis pipeline from webhook to GitLab comment."""

    def __init__(self) -> None:
        self.change_agent = ChangeAgent()
        self.dependency_agent = DependencyAgent()
        self.history_agent = HistoryAgent()
        self.risk_agent = RiskAgent()
        self.reviewer_agent = ReviewerAgent()
        self.summary_agent = SummaryAgent()
        self.gitlab = GitLabService()

    async def run_pipeline(self, mr_event: MREvent) -> None:
        """Execute the complete analysis pipeline.
        
        Steps:
        1. Clone/fetch the repository
        2. Run Change Agent (diff analysis)
        3. Run Dependency Agent (AST + graph)
        4. Run History Agent (git log churn)
        5. Run Risk Agent (weighted scoring - sync)
        6. Run Reviewer Agent (git blame)
        7. Run Summary Agent (Claude AI)
        8. Save to database
        9. Post GitLab comment
        10. Add labels if high-risk
        
        Never crashes the webhook handler — all errors are caught and logged.
        """
        start_time = time.time()
        log_pipeline_start(mr_event)

        try:
            # ── Stage 1: Clone or fetch repository ──
            repo = await clone_or_fetch(
                mr_event.project_namespace,
                mr_event.project_http_url,
            )

            # ── Stage 2: Change analysis (what files changed?) ──
            change = await self.change_agent.analyze(mr_event, repo)

            # ── Stage 3: Dependency graph (blast radius) ──
            dep = await self.dependency_agent.build_graph(
                change.changed_files, repo.working_dir
            )

            # ── Stage 4: History analysis (churn + incidents) ──
            history = await self.history_agent.analyze(
                change.changed_files, repo, mr_event.author_username
            )

            # ── Stage 5: Risk scoring (pure computation, synchronous) ──
            risk = self.risk_agent.calculate(change, dep, history)

            # ── Stage 6: Reviewer suggestions ──
            reviewers = await self.reviewer_agent.suggest(
                change.changed_files,
                dep.blast_radius,
                repo,
                mr_event.author_username,
            )

            # ── Stage 7: AI summary (Claude) ──
            ai_summary = await self.summary_agent.generate(
                risk, dep, reviewers, history, mr_event.mr_title
            )

            # ── Stage 8: Save to database ──
            await self._save_analysis(mr_event, change, dep, history, risk, reviewers, ai_summary)

            # ── Stage 9: Post GitLab comment ──
            comment = format_comment(risk, dep, reviewers, ai_summary)
            await self.gitlab.post_mr_comment(
                mr_event.project_id, mr_event.mr_iid, comment
            )

            # ── Stage 10: Add high-risk label if threshold exceeded ──
            if risk.score >= settings.risk_block_threshold:
                await self.gitlab.add_labels(
                    mr_event.project_id,
                    mr_event.mr_iid,
                    ["high-risk"],
                )

            # Log completion
            duration_ms = (time.time() - start_time) * 1000
            log_pipeline_complete(
                mr_event,
                risk.score,
                duration_ms,
                dep.total_affected,
            )

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            log_error(mr_event, "pipeline", e)

    async def _save_analysis(
        self, mr_event, change, dep, history, risk, reviewers, ai_summary
    ) -> None:
        """Persist the analysis results to PostgreSQL. Updates if existing."""
        try:
            from sqlalchemy import select, delete
            async with async_session_factory() as session:
                # Check if analysis exists
                result = await session.execute(
                    select(MRAnalysis).where(
                        MRAnalysis.project_gitlab_id == mr_event.project_id,
                        MRAnalysis.mr_iid == mr_event.mr_iid
                    )
                )
                existing_analysis = result.scalar_one_or_none()

                if existing_analysis:
                    # Update existing record
                    existing_analysis.mr_title = mr_event.mr_title
                    existing_analysis.source_branch = mr_event.source_branch
                    existing_analysis.risk_score = risk.score
                    existing_analysis.risk_level = risk.level
                    existing_analysis.lines_changed = change.lines_added + change.lines_removed
                    existing_analysis.files_changed = len(change.changed_files)
                    existing_analysis.blast_radius_size = dep.total_affected
                    existing_analysis.impact_depth = dep.max_impact_depth
                    existing_analysis.risk_breakdown = risk.breakdown.model_dump()
                    existing_analysis.blast_radius_data = dep.dependency_graph
                    existing_analysis.ai_summary = ai_summary
                    existing_analysis.suggested_reviewers = [r.model_dump() for r in reviewers.reviewers]
                    existing_analysis.created_at = datetime.now(timezone.utc)
                    analysis = existing_analysis
                else:
                    analysis = MRAnalysis(
                        project_gitlab_id=mr_event.project_id,
                        project_namespace=mr_event.project_namespace,
                        mr_iid=mr_event.mr_iid,
                        mr_title=mr_event.mr_title,
                        author_username=mr_event.author_username,
                        source_branch=mr_event.source_branch,
                        risk_score=risk.score,
                        risk_level=risk.level,
                        lines_changed=change.lines_added + change.lines_removed,
                        files_changed=len(change.changed_files),
                        blast_radius_size=dep.total_affected,
                        impact_depth=dep.max_impact_depth,
                        risk_breakdown=risk.breakdown.model_dump(),
                        blast_radius_data=dep.dependency_graph,
                        ai_summary=ai_summary,
                        suggested_reviewers=[
                            r.model_dump() for r in reviewers.reviewers
                        ],
                    )
                    session.add(analysis)
                
                await session.flush()

                # Delete old file history for this analysis if updating
                await session.execute(
                    delete(FileRiskHistory).where(FileRiskHistory.analysis_id == analysis.id)
                )

                # Save file-level risk history
                for file_path in change.changed_files:
                    file_history = FileRiskHistory(
                        project_gitlab_id=mr_event.project_id,
                        file_path=file_path,
                        analysis_id=analysis.id,
                        churn_score=history.churn_scores.get(file_path, 0),
                        incident_count=history.incident_counts.get(file_path, 0),
                    )
                    session.add(file_history)

                await session.commit()

        except Exception as e:
            log_error(mr_event, "database_save", e)
