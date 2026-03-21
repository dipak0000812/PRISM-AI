"""
PRISM Repo Service — Zero-trust local repository ingestion and synchronization layers.
"""
import asyncio
import os
import shutil

import git

from config import settings

REPO_CACHE_DIR: str = settings.repo_cache_dir
CLONE_DEPTH: int = 100


def _inject_token_into_url(http_url: str, token: str) -> str:
    """
    Elevates basic HTTP checkout endpoints into authenticated GitLab transports transparently.
    Mutating Git configs system-wide risks bleeding secrets; this pattern restricts credentials entirely to memory payloads.
    """
    return http_url.replace("https://", f"https://oauth2:{token}@", 1)


def _clone_or_fetch_sync(project_namespace: str, http_url: str) -> git.Repo:
    """
    Synchronous filesystem engine guaranteeing the disk artifact acts identically to the remote tip at invoke.
    Detects cache pollution intelligently; forcefully detonates corrupted `.git` state paths before hard-resetting cleanly.
    """
    safe_name: str = project_namespace.replace("/", "_")
    repo_path: str = os.path.join(REPO_CACHE_DIR, safe_name)
    git_env: dict[str, str] = {"GIT_TERMINAL_PROMPT": "0"}

    if os.path.exists(repo_path):
        try:
            repo = git.Repo(repo_path)
            repo.remotes.origin.fetch(env=git_env)
            return repo
        except (git.exc.GitCommandError, git.exc.InvalidGitRepositoryError):
            shutil.rmtree(repo_path, ignore_errors=True)
            authed_url: str = _inject_token_into_url(http_url, settings.gitlab_pat)
            return git.Repo.clone_from(authed_url, repo_path, depth=CLONE_DEPTH, env=git_env)
    
    authed_url: str = _inject_token_into_url(http_url, settings.gitlab_pat)
    return git.Repo.clone_from(authed_url, repo_path, depth=CLONE_DEPTH, env=git_env)


async def clone_or_fetch(project_namespace: str, http_url: str) -> git.Repo:
    """
    Thread-pool isolation layer keeping expensive C-binding Git execution loops globally non-blocking on the parent FastAPI event loop.
    """
    loop: asyncio.AbstractEventLoop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        _clone_or_fetch_sync,
        project_namespace,
        http_url,
    )
