"""
PRISM GitLab Service — Robust asynchronous external networking and webhook coordination wrapper.
"""
import httpx

from config import settings
from models.schemas import (
    DependencyAnalysisResult,
    ReviewerAnalysisResult,
    RiskAnalysisResult,
)


class GitLabService:
    """
    Encapsulates all RESTful communications with the GitLab V4 APIs targeting MRs structurally.
    Fully asynchronous via Httpx enforcing single transport-layer connections efficiently.
    """

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url="https://gitlab.com/api/v4",
            headers={"PRIVATE-TOKEN": settings.gitlab_pat},
            timeout=10.0,
        )

    async def get_mr_diff(self, project_id: int, mr_iid: int) -> dict | None:
        """Retrieves exact file boundary diff streams directly from GitLab storage APIs."""
        try:
            gitlab_response = await self._client.get(
                f"/projects/{project_id}/merge_requests/{mr_iid}/diffs"
            )
            gitlab_response.raise_for_status()
            return gitlab_response.json()
        except httpx.HTTPError:
            return None

    async def get_mr_commits(self, project_id: int, mr_iid: int) -> list[dict]:
        """Maps specific commit histories explicitly bound against an active tracking MR."""
        try:
            gitlab_response = await self._client.get(
                f"/projects/{project_id}/merge_requests/{mr_iid}/commits"
            )
            gitlab_response.raise_for_status()
            return gitlab_response.json()
        except httpx.HTTPError:
            return []

    async def post_mr_comment(self, project_id: int, mr_iid: int, body: str) -> None:
        """Publishes the overarching PRISM metrics markdown payload instantly directly into developer focus."""
        try:
            await self._client.post(
                f"/projects/{project_id}/merge_requests/{mr_iid}/notes",
                json={"body": body},
            )
        except httpx.HTTPError:
            pass

    async def add_labels(self, project_id: int, mr_iid: int, labels: list[str]) -> None:
        """Pushes architectural hazard warnings explicitly as Merge Request Tags structurally."""
        if not labels:
            return
        labels_str: str = ",".join(labels)
        try:
            await self._client.put(
                f"/projects/{project_id}/merge_requests/{mr_iid}",
                json={"add_labels": labels_str},
            )
        except httpx.HTTPError:
            pass

    async def assign_reviewers(
        self, 
        project_id: int, 
        mr_iid: int, 
        reviewer_usernames: list[str]
    ) -> None:
        """
        Auto-assign suggested reviewers to the MR via GitLab API.
        Resolves usernames to user IDs first, then assigns.
        Fails silently — reviewer assignment is best-effort.
        """
        if not reviewer_usernames:
            return
            
        try:
            # Resolve usernames to GitLab user IDs
            reviewer_ids = []
            for username in reviewer_usernames[:3]:  # Max 3 reviewers
                try:
                    response = await self._client.get(
                        f"/users",
                        params={"username": username}
                    )
                    response.raise_for_status()
                    users = response.json()
                    if users:
                        reviewer_ids.append(users[0]["id"])
                except Exception:
                    continue
            
            if not reviewer_ids:
                return
                
            # Assign reviewers to MR
            await self._client.put(
                f"/projects/{project_id}/merge_requests/{mr_iid}",
                json={"reviewer_ids": reviewer_ids}
            )
        except Exception:
            # Reviewer assignment is non-critical — never crash pipeline
            pass


def format_comment(
    risk_analysis: RiskAnalysisResult,
    dependency_analysis: DependencyAnalysisResult,
    reviewer_analysis: ReviewerAnalysisResult,
    ai_summary: str,
) -> str:
    """Preconstructs the Markdown visualization template injected into GitLab."""
    
    score_icons: dict[str, str] = {
        "critical": "💥 CRITICAL RISK",
        "high": "🔴 HIGH RISK",
        "medium": "🟠 MEDIUM RISK",
        "low": "🟢 LOW RISK",
    }
    icon: str = score_icons.get(risk_analysis.level, "❓ UNKNOWN RISK")

    blast_radius_str: str = " → ".join(dependency_analysis.blast_radius[:5])
    if len(dependency_analysis.blast_radius) > 5:
        blast_radius_str += f" → (+{len(dependency_analysis.blast_radius) - 5} more)"
    if not blast_radius_str:
        blast_radius_str = "No downstream modules detected."

    breakdown_rows: str = ""
    factor_labels: dict[str, str] = {
        "pr_size": "PR Size",
        "file_churn": "File Churn",
        "core_module": "Core Module Touched",
        "test_coverage": "Tests Removed/Missing",
        "dep_depth": "Dependency Depth",
        "author_exp": "Author Experience in Module",
    }

    raw_breakdown = risk_analysis.breakdown.model_dump()
    for key, label in factor_labels.items():
        data = raw_breakdown.get(key, {})
        points: int = data.get("points", 0)
        signal: str = data.get("signal", "N/A")
        if points > 0:
            breakdown_rows += f"| {label} | {signal} | +{points} |\n"

    total_score: str = f"**{risk_analysis.score}**"

    reviewer_str: str = " ".join([f"@{r.username}" for r in reviewer_analysis.reviewers])
    if not reviewer_str:
        reviewer_str = "No specific reviewers identified based on git history."

    markdown: str = f"""## 🛡️ PRISM-AI — Risk Analysis Report

**Risk Score: {risk_analysis.score} / 100** {icon}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 💥 Blast Radius
`{blast_radius_str}`
**{dependency_analysis.total_affected} downstream modules affected across {dependency_analysis.max_impact_depth} dependency layers**

### 📊 Risk Score Breakdown
| Factor              | Signal                | Points |
|---------------------|-----------------------|--------|
{breakdown_rows}
| **Total**           |                       | {total_score}  |

### 🤖 AI Risk Summary
> {ai_summary.replace(chr(10), chr(10) + "> ")}

### 👥 Suggested Reviewers
{reviewer_str}

---
*Powered by PRISM-AI · GitLab AI Hackathon 2026 · ZerothLayer*"""
    return markdown
