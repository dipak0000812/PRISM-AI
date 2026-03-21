"""
PRISM Webhook Router — Edge-layer handler mapping external GitLab events strictly to internal pipeline states.
"""
import json
import httpx
from typing import Any

from fastapi import APIRouter, Request, HTTPException, BackgroundTasks

from config import settings
from models.schemas import MREvent
from webhook.validator import validate_gitlab_signature
from agents.orchestrator import AgentOrchestrator
from services.gitlab_service import GitLabService

router = APIRouter(prefix="/webhook", tags=["webhook"])


@router.post("/gitlab")
async def gitlab_webhook(request: Request, background_tasks: BackgroundTasks) -> dict[str, Any]:
    """
    Edge entrypoint for all GitLab MR webhooks.
    This route mandates an immediate 200 OK return to prevent GitLab from severing the webhook integration.
    All intensive graph and LLM operations are decoupled into the BackgroundTasks loop.
    """
    raw_body: bytes = await request.body()
    gitlab_token: str = request.headers.get("X-Gitlab-Token", "")

    if not validate_gitlab_signature(raw_body, gitlab_token, settings.webhook_secret):
        raise HTTPException(status_code=401, detail="Invalid computing signature; refusing webhook ingestion.")

    try:
        mr_payload: dict[str, Any] = await request.json()
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="Malformed JSON in webhook request body.") from e
    
    object_kind: str = mr_payload.get("object_kind", "")
    if object_kind != "merge_request":
        return {"status": "ignored", "reason": f"Expected merge_request format but received {object_kind}"}

    object_attributes: dict[str, Any] = mr_payload.get("object_attributes", {})
    action: str = object_attributes.get("action", "")
    if action not in ("open", "reopen"):
        return {"status": "ignored", "reason": f"MREvent action {action} does not trigger analysis cycles"}

    project: dict[str, Any] = mr_payload.get("project", {})
    user: dict[str, Any] = mr_payload.get("user", {})

    author_username: str = user.get("username", "")
    author_id: int = object_attributes.get("author_id", 0)

    if not author_username and author_id:
        try:
            gitlab_client = GitLabService()
            user_data: dict[str, Any] = await gitlab_client.get_user_by_id(author_id)
            author_username = user_data.get("username", "unknown")
        except httpx.HTTPError:
            author_username = "unknown"

    mr_event = MREvent(
        project_id=project.get("id", 0),
        project_namespace=project.get("path_with_namespace", ""),
        project_http_url=project.get("http_url", "") or project.get("git_http_url", ""),
        mr_iid=object_attributes.get("iid", 0),
        mr_title=object_attributes.get("title", ""),
        source_branch=object_attributes.get("source_branch", ""),
        target_branch=object_attributes.get("target_branch", ""),
        author_username=author_username,
        author_id=author_id,
    )

    orchestrator = AgentOrchestrator()
    background_tasks.add_task(orchestrator.run_pipeline, mr_event)

    return {"status": "accepted", "mr_iid": mr_event.mr_iid}
