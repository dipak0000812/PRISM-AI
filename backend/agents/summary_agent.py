"""
PRISM Summary Agent — LLM-driven synthesis mapping structural risk vectors into natural language profiles via Groq.
"""
import logging

import groq
from groq import AsyncGroq

from config import settings
from models.schemas import (
    DependencyAnalysisResult,
    HistoryAnalysisResult,
    ReviewerAnalysisResult,
    RiskAnalysisResult,
)

GROQ_MODEL_ID: str = "llama-3.3-70b-versatile"
MAX_TOKENS_SUMMARY: int = 300
TEMPERATURE_STRICT: float = 0.3


class SummaryAgent:
    """
    Communicates with external foundational models (Llama 3.3) securely through Groq
    to compress analytical risk integers into developer-centric contextual explanations.
    """

    def __init__(self) -> None:
        pass

    async def generate(
        self,
        risk_analysis: RiskAnalysisResult,
        dependency_analysis: DependencyAnalysisResult,
        reviewer_analysis: ReviewerAnalysisResult,
        history_analysis: HistoryAnalysisResult,
        mr_title: str,
    ) -> str:
        """
        Executes an asynchronous non-blocking text completion via HTTP against the Groq API.
        Fails safely offline or on 429 timeouts substituting a graceful fallback.
        """
        if not settings.groq_api_key:
            return "AI summary unavailable — Groq API key missing in environment."

        try:
            client = AsyncGroq(api_key=settings.groq_api_key)
            prompt: str = self._build_prompt(
                risk_analysis, dependency_analysis, reviewer_analysis, history_analysis, mr_title
            )

            groq_response = await client.chat.completions.create(
                model=GROQ_MODEL_ID,
                max_tokens=MAX_TOKENS_SUMMARY,
                temperature=TEMPERATURE_STRICT,
                messages=[{"role": "user", "content": prompt}],
            )

            return groq_response.choices[0].message.content.strip()

        except groq.APIStatusError as api_error:
            # Trap native HTTP bounds (Rate limits, Unauthorized, etc.)
            logging.error(f"Groq API Reject: {str(api_error)}")
            return "AI summary unavailable — LLM API service degraded."
        except groq.APIError as conn_error:
            # Trap systemic network timeouts
            logging.error(f"Groq External Network Timeout: {str(conn_error)}")
            return "AI summary unavailable — LLM Service unreachable."
        except Exception as unknown_error:
            logging.error(f"Groq Unknown Exception: {str(unknown_error)}")
            return "AI summary unavailable — see risk breakdown above for analytics."

    @staticmethod
    def _build_prompt(
        risk_analysis: RiskAnalysisResult,
        dependency_analysis: DependencyAnalysisResult,
        reviewer_analysis: ReviewerAnalysisResult,
        history_analysis: HistoryAnalysisResult,
        mr_title: str,
    ) -> str:
        """
        Preconstructs the zero-shot inference prompt explicitly forcing concrete metrics directly into the context window.
        """
        reviewer_names: str = ", ".join(
            [r.username for r in reviewer_analysis.reviewers]
        ) if reviewer_analysis.reviewers else "None identified"

        max_churn: int = max(list(history_analysis.churn_scores.values()), default=0)
        incident_total: int = sum(list(history_analysis.incident_counts.values()))
        
        pr_test_coverage = risk_analysis.breakdown.test_coverage
        tests_issue: bool = int(pr_test_coverage.get("points", 0)) > 0

        changed_files_str: str = ", ".join(dependency_analysis.changed_files[:5]) if dependency_analysis.changed_files else "None"
        blast_str: str = ", ".join(dependency_analysis.blast_radius[:8]) if dependency_analysis.blast_radius else "None"

        return f"""You are a senior software engineer reviewing a merge request risk report.
Write a concise, actionable 3-4 sentence risk summary for a busy maintainer.

MR Title: {mr_title}
Risk Score: {risk_analysis.score}/100 ({risk_analysis.level.upper()})
Changed files: {changed_files_str}
Affected downstream modules: {blast_str}
Impact depth: {dependency_analysis.max_impact_depth} layers
Highest file churn: {max_churn} commits/30d
Tests removed: {tests_issue}
Suggested reviewers: {reviewer_names}
Past incident count: {incident_total}

Rules:
- Name specific modules that could break
- Explain WHY the risk is high or low based on the data
- End with a concrete review recommendation
- Never use vague phrases like 'this PR modifies code'
- Maximum 4 sentences"""
