"""
PRISM Structured JSON Logging — Pipeline observability.
"""
import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Optional

from models.schemas import MREvent


def setup_logging() -> logging.Logger:
    """Configure structured JSON logging for the application."""
    logger = logging.getLogger("prism")
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter("%(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logging()


def _emit(level: str, event: str, data: dict[str, Any]) -> None:
    """Emit a structured JSON log line."""
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "level": level,
        "event": event,
        **data,
    }
    log_line = json.dumps(log_entry, default=str)
    if level == "ERROR":
        logger.error(log_line)
    elif level == "WARNING":
        logger.warning(log_line)
    else:
        logger.info(log_line)


def log_pipeline_start(mr_event: MREvent) -> None:
    """Log the start of an analysis pipeline run."""
    _emit("INFO", "pipeline_started", {
        "project_id": mr_event.project_id,
        "project_namespace": mr_event.project_namespace,
        "mr_iid": mr_event.mr_iid,
        "mr_title": mr_event.mr_title,
        "source_branch": mr_event.source_branch,
        "target_branch": mr_event.target_branch,
        "author": mr_event.author_username,
    })


def log_pipeline_complete(
    mr_event: MREvent,
    risk_score: int,
    duration_ms: float,
    blast_radius_size: int,
) -> None:
    """Log the successful completion of an analysis pipeline run."""
    _emit("INFO", "pipeline_completed", {
        "project_id": mr_event.project_id,
        "mr_iid": mr_event.mr_iid,
        "risk_score": risk_score,
        "duration_ms": round(duration_ms, 2),
        "blast_radius_size": blast_radius_size,
    })


def log_error(
    mr_event: Optional[MREvent],
    stage: str,
    error: Exception,
) -> None:
    """Log an error that occurred during pipeline execution."""
    data: dict[str, Any] = {
        "stage": stage,
        "error_type": type(error).__name__,
        "error_message": str(error),
    }
    if mr_event:
        data["project_id"] = mr_event.project_id
        data["mr_iid"] = mr_event.mr_iid
    _emit("ERROR", "pipeline_error", data)
