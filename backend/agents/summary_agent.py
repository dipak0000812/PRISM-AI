"""
PRISM Summary Agent — Anthropic Claude AI risk summary generation.
"""
import anthropic

from config import settings
from models.schemas import (
    RiskResult, DependencyResult, ReviewerResult, HistoryResult,
)


class SummaryAgent:
    """Generates natural language risk summaries using Anthropic Claude."""

    def __init__(self) -> None:
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    async def generate(
        self,
        risk: RiskResult,
        dep: DependencyResult,
        reviewers: ReviewerResult,
        history: HistoryResult,
        mr_title: str,
    ) -> str:
        """Build a prompt from analysis data and call Claude for a concise summary."""
        try:
            prompt = self._build_prompt(risk, dep, reviewers, history, mr_title)

            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}],
            )

            return message.content[0].text

        except Exception:
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
