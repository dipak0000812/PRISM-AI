import httpx
import hmac
import json
import asyncio
from config import settings

async def main():
    payload = {
        "object_kind": "merge_request",
        "project": {
            "id": 12345,
            "path_with_namespace": "Dipak_09/prism-demo-app",
            "git_http_url": "https://gitlab.com/Dipak_09/prism-demo-app.git"
        },
        "object_attributes": {
            "iid": 2,
            "title": "Mock MR Event",
            "action": "open",
            "source_branch": "mock-branch",
            "target_branch": "main",
            "author_id": 1,
            "url": "https://gitlab.com/Dipak_09/prism-demo-app/-/merge_requests/2"
        },
        "user": {
            "name": "Dipak",
            "username": "Dipak_09",
            "avatar_url": "https://secure.gravatar.com/avatar"
        }
    }
    
    payload_bytes = json.dumps(payload).encode('utf-8')
    token = settings.webhook_secret
    
    # We must start the docker compose backend for this if not running, or call the endpoint
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "http://localhost:8000/webhook/gitlab",
                content=payload_bytes,
                headers={"X-Gitlab-Token": token}
            )
            print("Response:", resp.status_code, resp.text)
    except Exception as e:
        print("Error calling local API:", e)

if __name__ == "__main__":
    asyncio.run(main())
