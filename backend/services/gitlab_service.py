"""
PRISM GitLab Service — Async GitLab REST API client.
"""
import httpx
from typing import Any

from config import settings
from models.schemas import RiskResult, DependencyResult, ReviewerResult


GITLAB_BASE_URL = "https://gitlab.com/api/v4"


class GitLabService:
    """Async client for the GitLab REST API."""

    def __init__(self) -> None:
        self.base_url = GITLAB_BASE_URL
        self.headers = {
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
        """GET /projects/{id}/merge_requests/{iid}/diffs — fetch MR file diffs."""
        async with self._client() as client:
            response = await client.get(
                f"/projects/{project_id}/merge_requests/{mr_iid}/diffs"
            )
            response.raise_for_status()
            return response.json()

    async def get_mr_commits(self, project_id: int, mr_iid: int) -> list[dict[str, Any]]:
        """GET /projects/{id}/merge_requests/{iid}/commits — fetch MR commits."""
        async with self._client() as client:
            response = await client.get(
                f"/projects/{project_id}/merge_requests/{mr_iid}/commits"
            )
            response.raise_for_status()
            return response.json()

    async def get_user_by_id(self, user_id: int) -> dict[str, Any]:
        """GET /users/{id} — fetch user details (username, etc.)."""
        async with self._client() as client:
            response = await client.get(f"/users/{user_id}")
            response.raise_for_status()
            return response.json()

    async def post_mr_comment(self, project_id: int, mr_iid: int, body: str) -> None:
        """POST /projects/{id}/merge_requests/{iid}/notes — post a comment on an MR."""
        async with self._client() as client:
            response = await client.post(
                f"/projects/{project_id}/merge_requests/{mr_iid}/notes",
                json={"body": body},
            )
            response.raise_for_status()

    async def assign_reviewers(self, project_id: int, mr_iid: int, reviewer_ids: list[int]) -> None:
        """PUT /projects/{id}/merge_requests/{iid} — assign reviewers to an MR."""
        async with self._client() as client:
            response = await client.put(
                f"/projects/{project_id}/merge_requests/{mr_iid}",
                json={"reviewer_ids": reviewer_ids},
            )
            response.raise_for_status()

    async def add_labels(self, project_id: int, mr_iid: int, labels: list[str]) -> None:
        """PUT /projects/{id}/merge_requests/{iid} — add labels to an MR."""
        async with self._client() as client:
            response = await client.put(
                f"/projects/{project_id}/merge_requests/{mr_iid}",
                json={"labels": ",".join(labels)},
            )
            response.raise_for_status()


def format_comment(
    risk: RiskResult,
    dep: DependencyResult,
    reviewers: ReviewerResult,
    summary: str,
) -> str:
    """Format the complete PRISM risk analysis report as a GitLab Markdown comment."""

    # Emoji mapping by risk level
    emoji_map = {
        "critical": "🔴",
        "high": "🟠",
        "medium": "🟡",
        "low": "🟢",
    }
    emoji = emoji_map.get(risk.level, "⚪")

    # Blast radius chain
    blast_chain = " → ".join(dep.blast_radius[:8]) if dep.blast_radius else "No downstream impact detected"

    # Risk breakdown table rows
    breakdown = risk.breakdown
    rows = []

    factor_labels = {
        "pr_size": ("PR Size", lambda d: f"{d.get('lines', 0)} lines changed"),
        "file_churn": ("File Churn", lambda d: f"{d.get('max_churn', 0)} commits / 30 days"),
        "core_module": ("Core Module Touched", lambda d: "Yes" if d.get("points", 0) > 0 else "No"),
        "test_coverage": ("Test Coverage", lambda d: "Tests removed" if d.get("points", 0) == 20 else ("No tests added" if d.get("points", 0) > 0 else "OK")),
        "dep_depth": ("Dependency Depth", lambda d: f"{d.get('depth', 0)} layers"),
        "author_exp": ("Author Experience", lambda d: "New to module" if d.get("points", 0) > 0 else "Experienced"),
    }

    for key, (label, signal_fn) in factor_labels.items():
        factor_data = getattr(breakdown, key, {})
        points = factor_data.get("points", 0)
        signal = signal_fn(factor_data)
        rows.append(f"| {label} | {signal} | +{points} |")

    rows_str = "\n".join(rows)

    # Reviewer mentions
    reviewer_mentions = " ".join(
        [f"@{r.username}" for r in reviewers.reviewers]
    ) if reviewers.reviewers else "No reviewers suggested"

    comment = f"""## 🛡️ PRISM — Risk Analysis Report

**Risk Score: {risk.score} / 100** {emoji} {risk.level.upper()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 💥 Blast Radius
`{blast_chain}`
**{dep.total_affected} downstream modules across {dep.max_impact_depth} dependency layers**

### 📊 Risk Score Breakdown
| Factor | Signal | Points |
|--------|--------|--------|
{rows_str}
| **Total** | | **{risk.score}** |

### 🤖 AI Risk Summary
> {summary}

### 👥 Suggested Reviewers
{reviewer_mentions}

---
*Powered by PRISM · GitLab AI Hackathon 2026 · Tech_Exchangers*"""

    return comment
