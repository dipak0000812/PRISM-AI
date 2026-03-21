"""
PRISM API — Main ASGI runtime boundary and configuration bootstrap.
"""
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db, init_db
from models.db_models import MRAnalysis
from webhook.router import router as webhook_router

LATEST_ANALYSIS_LIMIT: int = 50


@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    """
    Lifecycle manager triggering preemptive database migrations and environment verifications before accepting ingress.
    """
    await init_db()
    print("PRISM API started — PostgreSQL tables safely initialized.")
    yield
    print("PRISM API shutting down — terminating event loops.")


app = FastAPI(
    title="PRISM API",
    description="Autonomous Risk Intelligence for GitLab Merge Requests",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Lightweight Kubernetes heartbeat check."""
    return {"status": "ok", "service": "PRISM"}


@app.get("/api/analyses")
async def get_analyses(db_session: AsyncSession = Depends(get_db)) -> list[dict[str, Any]]:
    """
    Fetch the historical sequence of risk-scored MRs. 
    Returns the tail metric explicitly constrained to prevent memory exhaustion on giant databases.
    """
    db_result = await db_session.execute(
        select(MRAnalysis)
        .order_by(desc(MRAnalysis.created_at))
        .limit(LATEST_ANALYSIS_LIMIT)
    )
    analyses_records = db_result.scalars().all()

    return [
        {
            "id": record.id,
            "project_gitlab_id": record.project_gitlab_id,
            "project_namespace": record.project_namespace,
            "mr_iid": record.mr_iid,
            "mr_title": record.mr_title,
            "author_username": record.author_username,
            "source_branch": record.source_branch,
            "risk_score": record.risk_score,
            "risk_level": record.risk_level,
            "lines_changed": record.lines_changed,
            "files_changed": record.files_changed,
            "blast_radius_size": record.blast_radius_size,
            "impact_depth": record.impact_depth,
            "risk_breakdown": record.risk_breakdown,
            "blast_radius_data": record.blast_radius_data,
            "ai_summary": record.ai_summary,
            "suggested_reviewers": record.suggested_reviewers,
            "created_at": record.created_at.isoformat() if record.created_at else None,
        }
        for record in analyses_records
    ]


@app.get("/api/analyses/{analysis_id}")
async def get_analysis(analysis_id: int, db_session: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Retrieve full algorithmic trajectory metrics for a single specific MR iteration."""
    db_result = await db_session.execute(
        select(MRAnalysis).where(MRAnalysis.id == analysis_id)
    )
    analysis_record = db_result.scalar_one_or_none()

    if not analysis_record:
        raise HTTPException(status_code=404, detail="Requested MR analysis hash not found on disk.")

    return {
        "id": analysis_record.id,
        "project_gitlab_id": analysis_record.project_gitlab_id,
        "project_namespace": analysis_record.project_namespace,
        "mr_iid": analysis_record.mr_iid,
        "mr_title": analysis_record.mr_title,
        "author_username": analysis_record.author_username,
        "source_branch": analysis_record.source_branch,
        "risk_score": analysis_record.risk_score,
        "risk_level": analysis_record.risk_level,
        "lines_changed": analysis_record.lines_changed,
        "files_changed": analysis_record.files_changed,
        "blast_radius_size": analysis_record.blast_radius_size,
        "impact_depth": analysis_record.impact_depth,
        "risk_breakdown": analysis_record.risk_breakdown,
        "blast_radius_data": analysis_record.blast_radius_data,
        "ai_summary": analysis_record.ai_summary,
        "suggested_reviewers": analysis_record.suggested_reviewers,
        "created_at": analysis_record.created_at.isoformat() if analysis_record.created_at else None,
    }