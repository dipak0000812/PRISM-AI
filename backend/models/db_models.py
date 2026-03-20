"""
PRISM SQLAlchemy 2.0 ORM Models — Async-compatible database tables.
"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, JSON, ForeignKey,
    CheckConstraint, UniqueConstraint, Index
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


class MRAnalysis(Base):
    """Core analysis results table — one row per analyzed merge request."""
    __tablename__ = "mr_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_gitlab_id = Column(Integer, nullable=False)
    project_namespace = Column(String(255), nullable=False)
    mr_iid = Column(Integer, nullable=False)
    mr_title = Column(Text, nullable=True)
    author_username = Column(String(255), nullable=True)
    source_branch = Column(String(255), nullable=True)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)
    lines_changed = Column(Integer, nullable=True)
    files_changed = Column(Integer, nullable=True)
    blast_radius_size = Column(Integer, nullable=True)
    impact_depth = Column(Integer, nullable=True)
    risk_breakdown = Column(JSON, nullable=True)
    blast_radius_data = Column(JSON, nullable=True)
    ai_summary = Column(Text, nullable=True)
    suggested_reviewers = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    file_histories = relationship("FileRiskHistory", back_populates="analysis")

    __table_args__ = (
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="ck_risk_score_range"),
        UniqueConstraint("project_gitlab_id", "mr_iid", name="uq_project_mr"),
        Index("idx_analyses_project", "project_gitlab_id"),
        Index("idx_analyses_risk_score", risk_score.desc()),
    )


class FileRiskHistory(Base):
    """File-level risk history for trend queries."""
    __tablename__ = "file_risk_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_gitlab_id = Column(Integer, nullable=False)
    file_path = Column(String(1024), nullable=False)
    analysis_id = Column(Integer, ForeignKey("mr_analyses.id"), nullable=True)
    churn_score = Column(Integer, nullable=True)
    incident_count = Column(Integer, nullable=True)
    recorded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    analysis = relationship("MRAnalysis", back_populates="file_histories")

    __table_args__ = (
        Index("idx_file_history_path", "file_path"),
    )
