"""
PRISM Summary Agent — Anthropic Claude AI risk summary generation.
"""
import logging
from groq import AsyncGroq

from config import settings
from models.schemas import (
    RiskResult, DependencyResult, ReviewerResult, HistoryResult,
)


class SummaryAgent:
    """Generates natural language risk summaries using Groq (Llama-3.3-70b-versatile)."""

    def __init__(self) -> None:
        pass

    async def generate(
        self,
        risk: RiskResult,
        dep: DependencyResult,
        reviewers: ReviewerResult,
        history: HistoryResult,
        mr_title: str,
    ) -> str:
        """Build a prompt from analysis data and call Groq for a concise summary."""
        if not settings.groq_api_key:
            return "AI summary unavailable — Groq API key missing in environment."

        try:
            client = AsyncGroq(api_key=settings.groq_api_key)
            prompt = self._build_prompt(risk, dep, reviewers, history, mr_title)

            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                max_tokens=300,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}],
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logging.error(f"Groq API Error: {str(e)}")
            return "AI summary unavailable — see risk breakdown above."

    @staticmethod
    def _build_prompt(
        risk: RiskResult,
        dep: DependencyResult,
        reviewers: ReviewerResult,
        history: HistoryResult,
        mr_title: str,
    ) -> str:
        """Construct the Claude prompt with structured analysis data."""

        reviewer_names = ", ".join(
            [r.username for r in reviewers.reviewers]
        ) if reviewers.reviewers else "None identified"

        max_churn = max(history.churn_scores.values(), default=0)
        incident_total = sum(history.incident_counts.values())
        tests_issue = risk.breakdown.test_coverage.get("points", 0) > 0

        changed_files_str = ", ".join(dep.changed_files[:5]) if dep.changed_files else "None"
        blast_str = ", ".join(dep.blast_radius[:8]) if dep.blast_radius else "None"

        return f"""You are a senior software engineer reviewing a merge request risk report.
Write a concise, actionable 3-4 sentence risk summary for a busy maintainer.

MR Title: {mr_title}
Risk Score: {risk.score}/100 ({risk.level.upper()})
Changed files: {changed_files_str}
Affected downstream modules: {blast_str}
Impact depth: {dep.max_impact_depth} layers
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
