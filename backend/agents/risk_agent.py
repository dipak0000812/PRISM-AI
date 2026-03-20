"""
PRISM Risk Agent — Deterministic multi-factor risk scoring engine.

All scoring is pure computation with no I/O — synchronous and fast.
"""
from models.schemas import ChangeResult, DependencyResult, HistoryResult, RiskResult, RiskBreakdown


CRITICAL_MODULES = ["auth", "payment", "security", "billing", "oauth"]
CORE_MODULES = ["core", "base", "common", "middleware", "shared"]


class RiskAgent:
    """Calculates a composite risk score (0-100) across six weighted factors."""

    def calculate(
        self,
        change: ChangeResult,
        dep: DependencyResult,
        history: HistoryResult,
    ) -> RiskResult:
        """Compute the risk score with full per-factor breakdown.
        
        Factor 1 — PR Size (max 15pts)
        Factor 2 — File Churn (max 20pts)
        Factor 3 — Core Module Touched (max 20pts)
        Factor 4 — Test Coverage (max 20pts)
        Factor 5 — Dependency Depth (max 15pts)
        Factor 6 — Author Experience (max 10pts)
        
        Total max = 100
        """
        score = 0

        # ── Factor 1: PR Size (max 15pts) ──
        lines = change.lines_added + change.lines_removed
        if lines > 500:
            pr_pts = 15
        elif lines > 200:
            pr_pts = 10
        elif lines > 50:
            pr_pts = 5
        else:
            pr_pts = 0
        score += pr_pts
        pr_size = {"points": pr_pts, "lines": lines, "signal": f"{lines} lines changed"}

        # ── Factor 2: File Churn (max 20pts) ──
        max_churn = max(history.churn_scores.values(), default=0)
        if max_churn > 10:
            churn_pts = 20
        elif max_churn > 5:
            churn_pts = 12
        elif max_churn > 2:
            churn_pts = 5
        else:
            churn_pts = 0
        score += churn_pts
        file_churn = {"points": churn_pts, "max_churn": max_churn, "signal": f"{max_churn} commits / 30 days"}

        # ── Factor 3: Core Module Touched (max 20pts) ──
        if change.touches_critical:
            core_pts = 20
            core_signal = "Critical module (auth/payment/security)"
        elif change.touches_core:
            core_pts = 10
            core_signal = "Core module (base/common/middleware)"
        else:
            core_pts = 0
            core_signal = "No critical modules"
        score += core_pts
        core_module = {"points": core_pts, "signal": core_signal}

        # ── Factor 4: Test Coverage (max 20pts) ──
        if change.tests_removed > 0:
            test_pts = 20
            test_signal = f"{change.tests_removed} test file(s) removed"
        elif not change.tests_added:
            test_pts = 8
            test_signal = "No tests added"
        else:
            test_pts = 0
            test_signal = "Tests present"
        score += test_pts
        test_coverage = {"points": test_pts, "signal": test_signal}

        # ── Factor 5: Dependency Depth (max 15pts) ──
        dep_pts = min(dep.max_impact_depth * 5, 15)
        score += dep_pts
        dep_depth = {
            "points": dep_pts,
            "depth": dep.max_impact_depth,
            "signal": f"{dep.max_impact_depth} dependency layers",
        }

        # ── Factor 6: Author Experience (max 10pts) ──
        if change.author_module_commits < 3:
            exp_pts = 10
            exp_signal = f"New to module ({change.author_module_commits} prior commits)"
        else:
            exp_pts = 0
            exp_signal = f"Experienced ({change.author_module_commits} prior commits)"
        score += exp_pts
        author_exp = {"points": exp_pts, "signal": exp_signal}

        # ── Total ──
        score = min(score, 100)  # Cap at 100

        # Risk level classification
        if score >= 81:
            level = "critical"
        elif score >= 61:
            level = "high"
        elif score >= 31:
            level = "medium"
        else:
            level = "low"

        breakdown = RiskBreakdown(
            pr_size=pr_size,
            file_churn=file_churn,
            core_module=core_module,
            test_coverage=test_coverage,
            dep_depth=dep_depth,
            author_exp=author_exp,
        )

        return RiskResult(score=score, level=level, breakdown=breakdown)
