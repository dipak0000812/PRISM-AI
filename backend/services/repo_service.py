"""
PRISM Repo Service — Local git repository cache management.
"""
import os
import asyncio


import git

from config import settings


REPO_CACHE = settings.repo_cache_dir


def _inject_token_into_url(http_url: str, token: str) -> str:
    """Inject GitLab PAT into the clone URL for authenticated access.
    
    Converts: https://gitlab.com/org/repo.git
    To:       https://oauth2:{token}@gitlab.com/org/repo.git
    """
    return http_url.replace("https://", f"https://oauth2:{token}@", 1)


def _clone_or_fetch_sync(project_namespace: str, http_url: str) -> git.Repo:
    """Synchronous git clone or fetch operation (runs in thread pool)."""
    safe_name = project_namespace.replace("/", "_")
    repo_path = os.path.join(REPO_CACHE, safe_name)

    git_env = {"GIT_TERMINAL_PROMPT": "0"}
    if os.path.exists(repo_path):
        # Repo exists — just fetch latest
        try:
            repo = git.Repo(repo_path)
            repo.remotes.origin.fetch(env=git_env)
        except (git.exc.GitCommandError, git.exc.InvalidGitRepositoryError):
            # If fetch fails or repo is invalid, wipe it and try a fresh clone
            import shutil
            shutil.rmtree(repo_path, ignore_errors=True)
            authed_url = _inject_token_into_url(http_url, settings.gitlab_pat)
            repo = git.Repo.clone_from(authed_url, repo_path, depth=100, env=git_env)
        return repo
    else:
        # Fresh clone with shallow depth for performance
        authed_url = _inject_token_into_url(http_url, settings.gitlab_pat)
        repo = git.Repo.clone_from(authed_url, repo_path, depth=100, env=git_env)
        return repo


async def clone_or_fetch(project_namespace: str, http_url: str) -> git.Repo:
    """Async wrapper — runs blocking git operations in a thread pool executor."""
    loop = asyncio.get_event_loop()
    repo = await loop.run_in_executor(
        None,
        _clone_or_fetch_sync,
        project_namespace,
        http_url,
    )
    return repo
