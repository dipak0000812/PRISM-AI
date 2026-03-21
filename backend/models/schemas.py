"""
PRISM Data Transfer Objects (DTOs) — Strict Pydantic v2 domain schemas.
"""
from pydantic import BaseModel, Field


class MREvent(BaseModel):
    """
    Normalized GitLab Merge Request webhook payload.
    Abstracts away the raw GitLab payload structure to guarantee a consistent internal API contract.
    """
    project_id: int
    project_namespace: str
    project_http_url: str
    mr_iid: int
    mr_title: str
    source_branch: str
    target_branch: str
    author_username: str
    author_id: int


class ChangeAnalysisResult(BaseModel):
    """Architectural change impact derived entirely from git diff output."""
    changed_files: list[str] = Field(default_factory=list)
    lines_added: int = 0
    lines_removed: int = 0
    modules_touched: list[str] = Field(default_factory=list)
    touches_critical: bool = False
    touches_core: bool = False
    tests_added: bool = False
    tests_removed: int = 0
    author_module_commits: int = 0


class DependencyAnalysisResult(BaseModel):
    """NetworkX graph traversal output plotting the blast radius of touched components."""
    dependency_graph: dict[str, list[str]] = Field(default_factory=dict, description="NetworkX node-link JSON")
    blast_radius: list[str] = Field(default_factory=list)
    impact_depth: dict[str, int] = Field(default_factory=dict)
    max_impact_depth: int = 0
    total_affected: int = 0
    changed_files: list[str] = Field(default_factory=list)


class HistoryAnalysisResult(BaseModel):
    """Statistical git history mining for systemic risk metrics."""
    churn_scores: dict[str, int] = Field(default_factory=dict)
    incident_counts: dict[str, int] = Field(default_factory=dict)
    author_experience: dict[str, int] = Field(default_factory=dict)


class RiskBreakdown(BaseModel):
    """Granular algorithmic risk scoring weights."""
    pr_size: dict[str, int | str] = Field(default_factory=dict)
    file_churn: dict[str, int | str] = Field(default_factory=dict)
    core_module: dict[str, int | str] = Field(default_factory=dict)
    test_coverage: dict[str, int | str] = Field(default_factory=dict)
    dep_depth: dict[str, int | str] = Field(default_factory=dict)
    author_exp: dict[str, int | str] = Field(default_factory=dict)


class RiskAnalysisResult(BaseModel):
    """Final calculated risk posture. Drives GitLab auto-labeling actions downstream."""
    score: int = 0
    level: str = "low"
    breakdown: RiskBreakdown = Field(default_factory=RiskBreakdown)


class ReviewerSuggestion(BaseModel):
    """A heuristically targeted engineer specifically recommended for this review."""
    username: str
    commit_count: int = 0
    modules: list[str] = Field(default_factory=list)


class ReviewerAnalysisResult(BaseModel):
    """The aggregate of historical reviewers mapped back to the touched modules."""
    reviewers: list[ReviewerSuggestion] = Field(default_factory=list)
    rationale: dict[str, str] = Field(default_factory=dict)


class PipelineAnalysisResult(BaseModel):
    """
    The monolithic result of the 7-stage asynchronous agent pipeline.
    This schema represents the final DB insertion payload and the payload broadcast to the frontend.
    """
    mr_event: MREvent
    change: ChangeAnalysisResult
    dependency: DependencyAnalysisResult
    history: HistoryAnalysisResult
    risk: RiskAnalysisResult
    reviewers: ReviewerAnalysisResult
    ai_summary: str = ""
