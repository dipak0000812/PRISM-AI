"""
PRISM Risk Agent — Heuristic risk triangulation scoring algorithm.
"""
from models.schemas import (
    ChangeAnalysisResult,
    DependencyAnalysisResult,
    HistoryAnalysisResult,
    RiskAnalysisResult,
    RiskBreakdown,
)


PR_SIZE_LARGE: int = 500
PR_SIZE_MEDIUM: int = 200
PR_SIZE_SMALL: int = 50

CHURN_HIGH: int = 10
CHURN_MEDIUM: int = 5
CHURN_LOW: int = 2

CRITICAL_MODULES: frozenset[str] = frozenset({"auth", "payment", "security", "billing", "oauth"})
CORE_MODULES: frozenset[str] = frozenset({"core", "base", "common", "middleware", "shared"})


class RiskAgent:
    """
    Deterministic aggregator compiling multi-agent outputs into a single numerical risk footprint.
    Does not execute external I/O, guaranteeing purely functional testing profiles for grading MR safety.
    """

    def calculate(
        self,
        change_analysis: ChangeAnalysisResult,
        dependency_analysis: DependencyAnalysisResult,
        history_analysis: HistoryAnalysisResult,
    ) -> RiskAnalysisResult:
        """
        Calculates and maps numeric risk weights based on structural invariants provided by upstream agents.
        """
        score: int = 0

        lines: int = change_analysis.lines_added + change_analysis.lines_removed
        if lines > PR_SIZE_LARGE:
            pr_pts = 15
        elif lines > PR_SIZE_MEDIUM:
            pr_pts = 10
        elif lines > PR_SIZE_SMALL:
            pr_pts = 5
        else:
            pr_pts = 0
        score += pr_pts
        pr_size_dict: dict[str, int | str] = {"points": pr_pts, "lines": lines, "signal": f"{lines} lines changed"}

        max_churn: int = max(history_analysis.churn_scores.values(), default=0)
        if max_churn > CHURN_HIGH:
            churn_pts = 20
        elif max_churn > CHURN_MEDIUM:
            churn_pts = 12
        elif max_churn > CHURN_LOW:
            churn_pts = 5
        else:
            churn_pts = 0
        score += churn_pts
        file_churn_dict: dict[str, int | str] = {"points": churn_pts, "max_churn": max_churn, "signal": f"{max_churn} commits / 30 days"}

        if change_analysis.touches_critical:
            core_pts = 20
            core_signal = "Critical module (auth/payment/security)"
        elif change_analysis.touches_core:
            core_pts = 10
            core_signal = "Core module (base/common/middleware)"
        else:
            core_pts = 0
            core_signal = "No critical modules"
        score += core_pts
        core_module_dict: dict[str, int | str] = {"points": core_pts, "signal": core_signal}

        if change_analysis.tests_removed > 0:
            test_pts = 20
            test_signal = f"{change_analysis.tests_removed} test file(s) removed"
        elif not change_analysis.tests_added:
            test_pts = 8
            test_signal = "No tests added"
        else:
            test_pts = 0
            test_signal = "Tests present"
        score += test_pts
        test_coverage_dict: dict[str, int | str] = {"points": test_pts, "signal": test_signal}

        dep_pts: int = min(dependency_analysis.max_impact_depth * 5, 15)
        score += dep_pts
        dep_depth_dict: dict[str, int | str] = {
            "points": dep_pts,
            "depth": dependency_analysis.max_impact_depth,
            "signal": f"{dependency_analysis.max_impact_depth} dependency layers",
        }

        if change_analysis.author_module_commits < 3:
            exp_pts = 10
            exp_signal = f"New to module ({change_analysis.author_module_commits} prior commits)"
        else:
            exp_pts = 0
            exp_signal = f"Experienced ({change_analysis.author_module_commits} prior commits)"
        score += exp_pts
        author_exp_dict: dict[str, int | str] = {"points": exp_pts, "signal": exp_signal}

        score = min(score, 100)

        level: str
        if score >= 81:
            level = "critical"
        elif score >= 61:
            level = "high"
        elif score >= 31:
            level = "medium"
        else:
            level = "low"

        breakdown = RiskBreakdown(
            pr_size=pr_size_dict,
            file_churn=file_churn_dict,
            core_module=core_module_dict,
            test_coverage=test_coverage_dict,
            dep_depth=dep_depth_dict,
            author_exp=author_exp_dict,
        )

        return RiskAnalysisResult(score=score, level=level, breakdown=breakdown)
