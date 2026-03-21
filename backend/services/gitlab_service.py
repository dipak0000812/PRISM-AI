"""
PRISM GitLab Service — Robust asynchronous bridge to the GitLab API ecosystem.
"""
from typing import Any

import httpx

from config import settings
from models.schemas import DependencyAnalysisResult, ReviewerAnalysisResult, RiskAnalysisResult

GITLAB_BASE_URL = "https://gitlab.com/api/v4"


class GitLabService:
    """
    Stateful boundary client isolating PRISM from GitLab's raw HTTP layer.
    Pre-configures connection pooling and unified auth.
    """

    def __init__(self) -> None:
        self.base_url: str = GITLAB_BASE_URL
        self.headers: dict[str, str] = {
            "PRIVATE-TOKEN": settings.gitlab_pat,
            "Content-Type": "application/json",
        }

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self.base_url,
            headers=self.headers,
            timeout=30.0,
        )

    async def get_mr_diffs(self, project_id: int, mr_iid: int) -> list[dict[str, Any]]:
        """Extract line-level architectural mutations for a specific merge request."""
        async with self._client() as client:
            gitlab_response: httpx.Response = await client.get(
                f"/projects/{project_id}/merge_requests/{mr_iid}/diffs"
            )
            gitlab_response.raise_for_status()
            return gitlab_response.json()

    async def get_mr_commits(self, project_id: int, mr_iid: int) -> list[dict[str, Any]]:
        """Fetch the chronological sequence of commits establishing the behavioral payload of the MR."""
        async with self._client() as client:
            gitlab_response: httpx.Response = await client.get(
                f"/projects/{project_id}/merge_requests/{mr_iid}/commits"
            )
            gitlab_response.raise_for_status()
            return gitlab_response.json()

    async def get_user_by_id(self, user_id: int) -> dict[str, Any]:
        """Resolve numeric author IDs to global usernames for downstream `@` tagging."""
        async with self._client() as client:
            gitlab_response: httpx.Response = await client.get(f"/users/{user_id}")
            gitlab_response.raise_for_status()
            return gitlab_response.json()

    async def post_mr_comment(self, project_id: int, mr_iid: int, body: str) -> None:
        """Inject the finalized PRISM computational report directly back into the remote MR thread."""
        async with self._client() as client:
            gitlab_response: httpx.Response = await client.post(
                f"/projects/{project_id}/merge_requests/{mr_iid}/notes",
                json={"body": body},
            )
            gitlab_response.raise_for_status()

    async def assign_reviewers(self, project_id: int, mr_iid: int, reviewer_ids: list[int]) -> None:
        """Surgically override the merge request assignee blocks logically routing ownership."""
        async with self._client() as client:
            gitlab_response: httpx.Response = await client.put(
                f"/projects/{project_id}/merge_requests/{mr_iid}",
                json={"reviewer_ids": reviewer_ids},
            )
            gitlab_response.raise_for_status()

    async def add_labels(self, project_id: int, mr_iid: int, labels: list[str]) -> None:
        """Emblazon the structural MR with color-coded, queryable risk posture signals dynamically."""
        async with self._client() as client:
            gitlab_response: httpx.Response = await client.put(
                f"/projects/{project_id}/merge_requests/{mr_iid}",
                json={"labels": ",".join(labels)},
            )
            gitlab_response.raise_for_status()


def format_comment(
    risk_analysis: RiskAnalysisResult,
    dependency_analysis: DependencyAnalysisResult,
    reviewer_analysis: ReviewerAnalysisResult,
    ai_summary: str,
) -> str:
    """
    Project the mathematical PRISM structures into a human-readable Markdown telemetry report formatting.
    """
    emoji_map: dict[str, str] = {
        "critical": "🔴",
        "high": "🟠",
        "medium": "🟡",
        "low": "🟢",
    }
    emoji: str = emoji_map.get(risk_analysis.level, "⚪")

    blast_chain: str = " → ".join(dependency_analysis.blast_radius[:8]) if dependency_analysis.blast_radius else "No downstream impact detected"

    breakdown = risk_analysis.breakdown
    rows: list[str] = []

    factor_labels = {
        "pr_size": ("PR Size", lambda d: f"{d.get('lines', 0)} lines changed"),
        "file_churn": ("File Churn", lambda d: f"{d.get('max_churn', 0)} commits / 30 days"),
        "core_module": ("Core Module Touched", lambda d: "Yes" if d.get("points", 0) > 0 else "No"),
        "test_coverage": ("Test Coverage", lambda d: "Tests removed" if d.get("points", 0) == 20 else ("No tests added" if d.get("points", 0) > 0 else "OK")),
        "dep_depth": ("Dependency Depth", lambda d: f"{d.get('depth', 0)} layers"),
        "author_exp": ("Author Experience", lambda d: "New to module" if d.get("points", 0) > 0 else "Experienced"),
    }

    for key, (label, signal_fn) in factor_labels.items():
        factor_data: dict[str, int | str] = getattr(breakdown, key, {})
        points: int = int(factor_data.get("points", 0))
        signal: str = str(signal_fn(factor_data))
        rows.append(f"| {label} | {signal} | +{points} |")

    rows_str: str = "\n".join(rows)

    reviewer_mentions: str = " ".join(
        [f"@{r.username}" for r in reviewer_analysis.reviewers]
    ) if reviewer_analysis.reviewers else "No reviewers suggested"

    comment: str = f"""## 🛡️ PRISM — Risk Analysis Report

**Risk Score: {risk_analysis.score} / 100** {emoji} {risk_analysis.level.upper()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 💥 Blast Radius
`{blast_chain}`
**{dependency_analysis.total_affected} downstream modules across {dependency_analysis.max_impact_depth} dependency layers**

### 📊 Risk Score Breakdown
| Factor | Signal | Points |
|--------|--------|--------|
{rows_str}
| **Total** | | **{risk_analysis.score}** |

### 🤖 AI Risk Summary
> {ai_summary}

### 👥 Suggested Reviewers
{reviewer_mentions}

---
*Powered by PRISM · GitLab AI Hackathon 2026 · Tech_Exchangers*"""

    return comment
