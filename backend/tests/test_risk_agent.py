import pytest
from agents.risk_agent import RiskAgent
from models.schemas import ChangeAnalysisResult, DependencyAnalysisResult, HistoryAnalysisResult

@pytest.fixture
def risk_agent():
    return RiskAgent()

@pytest.fixture  
def minimal_change():
    return ChangeAnalysisResult(
        changed_files=["auth/middleware.py"],
        lines_added=10,
        lines_removed=5,
        modules_touched=["auth"],
        touches_critical=True,
        touches_core=False,
        tests_added=False,
        tests_removed=0,
        author_module_commits=1
    )

@pytest.fixture
def minimal_dep():
    return DependencyAnalysisResult(
        dependency_graph={},
        blast_radius=["user_service", "payment_service"],
        impact_depth={"user_service": 1, "payment_service": 2},
        max_impact_depth=2,
        total_affected=2,
        changed_files=["auth/middleware.py"]
    )

@pytest.fixture
def minimal_history():
    return HistoryAnalysisResult(
        churn_scores={"auth/middleware.py": 8},
        incident_counts={"auth/middleware.py": 2},
        author_experience={"auth/middleware.py": 1}
    )

class TestRiskScoring:
    def test_critical_module_adds_points(
        self, risk_agent, minimal_change, minimal_dep, minimal_history
    ):
        result = risk_agent.calculate(minimal_change, minimal_dep, minimal_history)
        assert result.breakdown.core_module.get("points") == 20

    def test_score_is_bounded_0_to_100(
        self, risk_agent, minimal_change, minimal_dep, minimal_history
    ):
        result = risk_agent.calculate(minimal_change, minimal_dep, minimal_history)
        assert 0 <= result.score <= 100

    def test_risk_level_classification(self, risk_agent, minimal_change, minimal_dep, minimal_history):
        result = risk_agent.calculate(minimal_change, minimal_dep, minimal_history)
        valid_levels = {"low", "medium", "high", "critical"}
        assert result.level in valid_levels

    def test_new_author_adds_points(
        self, risk_agent, minimal_change, minimal_dep, minimal_history
    ):
        minimal_change.author_module_commits = 1
        result = risk_agent.calculate(minimal_change, minimal_dep, minimal_history)
        assert result.breakdown.author_exp.get("points") == 10

    def test_high_churn_file_scores_maximum(
        self, risk_agent, minimal_change, minimal_dep, minimal_history
    ):
        minimal_history.churn_scores = {"auth/middleware.py": 15}
        result = risk_agent.calculate(minimal_change, minimal_dep, minimal_history)
        assert result.breakdown.file_churn.get("points") == 20

    def test_deterministic_scoring(
        self, risk_agent, minimal_change, minimal_dep, minimal_history
    ):
        result1 = risk_agent.calculate(minimal_change, minimal_dep, minimal_history)
        result2 = risk_agent.calculate(minimal_change, minimal_dep, minimal_history)
        assert result1.score == result2.score
