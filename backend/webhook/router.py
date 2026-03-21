"""
PRISM Webhook Router — GitLab MR event receiver.
"""
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks

from config import settings
from models.schemas import MREvent
from webhook.validator import validate_gitlab_signature
from agents.orchestrator import AgentOrchestrator
from services.gitlab_service import GitLabService

router = APIRouter(prefix="/webhook", tags=["webhook"])


@router.post("/gitlab")
async def gitlab_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive and process GitLab MR webhook events.
    
    1. Validate X-Gitlab-Token header
    2. Parse JSON body
    3. Filter for merge_request open events only
    4. Extract MREvent
    5. Fire-and-forget pipeline in background
    6. Return 200 immediately
    """
    # Step 1: Get raw body
    body = await request.body()

    # Step 2: Validate webhook token
    token = request.headers.get("X-Gitlab-Token", "")
    if not validate_gitlab_signature(body, token, settings.webhook_secret):
        raise HTTPException(status_code=401, detail="Invalid webhook token")

    # Step 3: Parse JSON
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    # Step 4: Only process merge_request open events
    object_kind = payload.get("object_kind", "")
    if object_kind != "merge_request":
        return {"status": "ignored", "reason": f"object_kind={object_kind}"}

    object_attributes = payload.get("object_attributes", {})
    action = object_attributes.get("action", "")
    if action not in ("open", "reopen"):
        return {"status": "ignored", "reason": f"action={action}"}

    # Step 5: Extract MREvent from payload
    project = payload.get("project", {})
    user = payload.get("user", {})

    # Resolve author username — try user block first, then fetch via API
    author_username = user.get("username", "")
    author_id = object_attributes.get("author_id", 0)

    if not author_username and author_id:
        try:
            gitlab = GitLabService()
            user_data = await gitlab.get_user_by_id(author_id)
            author_username = user_data.get("username", "unknown")
        except Exception:
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

    # Step 6: Fire-and-forget — run pipeline in background
    orchestrator = AgentOrchestrator()
    background_tasks.add_task(orchestrator.run_pipeline, mr_event)

    # Step 7: Return immediately so GitLab doesn't timeout
    return {"status": "accepted", "mr_iid": mr_event.mr_iid}
