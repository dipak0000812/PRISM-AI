"""
PRISM API — FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import init_db, get_db
from models.db_models import MRAnalysis
from webhook.router import router as webhook_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — create tables on startup."""
    await init_db()
    print("PRISM API started — database tables created.")
    yield
    print("PRISM API shutting down.")


app = FastAPI(
    title="PRISM API",
    description="Autonomous Risk Intelligence for GitLab Merge Requests",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — allow all origins for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include webhook router
app.include_router(webhook_router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "PRISM"}


@app.get("/api/analyses")
async def get_analyses(db: AsyncSession = Depends(get_db)):
    """Get the last 50 MR analyses, ordered by creation date descending."""
    result = await db.execute(
        select(MRAnalysis)
        .order_by(desc(MRAnalysis.created_at))
        .limit(50)
    )
    analyses = result.scalars().all()

    return [
        {
            "id": a.id,
            "project_gitlab_id": a.project_gitlab_id,
            "project_namespace": a.project_namespace,
            "mr_iid": a.mr_iid,
            "mr_title": a.mr_title,
            "author_username": a.author_username,
            "source_branch": a.source_branch,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "lines_changed": a.lines_changed,
            "files_changed": a.files_changed,
            "blast_radius_size": a.blast_radius_size,
            "impact_depth": a.impact_depth,
            "risk_breakdown": a.risk_breakdown,
            "blast_radius_data": a.blast_radius_data,
            "ai_summary": a.ai_summary,
            "suggested_reviewers": a.suggested_reviewers,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in analyses
    ]


@app.get("/api/analyses/{analysis_id}")
async def get_analysis(analysis_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single analysis by ID."""
    result = await db.execute(
        select(MRAnalysis).where(MRAnalysis.id == analysis_id)
    )
    a = result.scalar_one_or_none()

    if not a:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": a.id,
        "project_gitlab_id": a.project_gitlab_id,
        "project_namespace": a.project_namespace,
        "mr_iid": a.mr_iid,
        "mr_title": a.mr_title,
        "author_username": a.author_username,
        "source_branch": a.source_branch,
        "risk_score": a.risk_score,
        "risk_level": a.risk_level,
        "lines_changed": a.lines_changed,
        "files_changed": a.files_changed,
        "blast_radius_size": a.blast_radius_size,
        "impact_depth": a.impact_depth,
        "risk_breakdown": a.risk_breakdown,
        "blast_radius_data": a.blast_radius_data,
        "ai_summary": a.ai_summary,
        "suggested_reviewers": a.suggested_reviewers,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }