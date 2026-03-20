"""
PRISM Pydantic v2 Schemas — All data models for agent I/O.
"""
from pydantic import BaseModel, Field
from typing import Optional


class MREvent(BaseModel):
    """Parsed GitLab Merge Request webhook event."""
    project_id: int
    project_namespace: str
    project_http_url: str
    mr_iid: int
    mr_title: str
    source_branch: str
    target_branch: str
    author_username: str
    author_id: int


class ChangeResult(BaseModel):
    """Output from the Change Agent — diff analysis results."""
    changed_files: list[str] = Field(default_factory=list)
    lines_added: int = 0
    lines_removed: int = 0
    modules_touched: list[str] = Field(default_factory=list)
    touches_critical: bool = False
    touches_core: bool = False
    tests_added: bool = False
    tests_removed: int = 0
    author_module_commits: int = 0


class DependencyResult(BaseModel):
    """Output from the Dependency Agent — graph analysis results."""
    dependency_graph: dict = Field(default_factory=dict, description="NetworkX node-link JSON")
    blast_radius: list[str] = Field(default_factory=list)
    impact_depth: dict[str, int] = Field(default_factory=dict)
    max_impact_depth: int = 0
    total_affected: int = 0
    changed_files: list[str] = Field(default_factory=list)


class HistoryResult(BaseModel):
    """Output from the History Agent — git history analysis."""
    churn_scores: dict[str, int] = Field(default_factory=dict)
    incident_counts: dict[str, int] = Field(default_factory=dict)
    author_experience: dict[str, int] = Field(default_factory=dict)


class RiskBreakdown(BaseModel):
    """Per-factor breakdown of the risk score."""
    pr_size: dict = Field(default_factory=dict)
    file_churn: dict = Field(default_factory=dict)
    core_module: dict = Field(default_factory=dict)
    test_coverage: dict = Field(default_factory=dict)
    dep_depth: dict = Field(default_factory=dict)
    author_exp: dict = Field(default_factory=dict)


class RiskResult(BaseModel):
    """Output from the Risk Agent — composite risk score."""
    score: int = 0
    level: str = "low"  # low / medium / high / critical
    breakdown: RiskBreakdown = Field(default_factory=RiskBreakdown)


class ReviewerSuggestion(BaseModel):
    """A single suggested reviewer."""
    username: str
    commit_count: int = 0
    modules: list[str] = Field(default_factory=list)


class ReviewerResult(BaseModel):
    """Output from the Reviewer Agent — suggested reviewers."""
    reviewers: list[ReviewerSuggestion] = Field(default_factory=list)
    rationale: dict[str, str] = Field(default_factory=dict)


class AnalysisResult(BaseModel):
    """Complete pipeline output combining all agent results."""
    mr_event: MREvent
    change: ChangeResult
    dependency: DependencyResult
    history: HistoryResult
    risk: RiskResult
    reviewers: ReviewerResult
    ai_summary: str = ""
