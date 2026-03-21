"""
PRISM Change Agent — Granular diff parsing and structural volatility heuristics.
"""
import asyncio
import os
import re
from datetime import datetime, timedelta
from typing import Any

import git

from models.schemas import ChangeAnalysisResult, MREvent
from services.gitlab_service import GitLabService

CRITICAL_MODULES: frozenset[str] = frozenset({"auth", "payment", "security", "billing", "oauth"})
CORE_MODULES: frozenset[str] = frozenset({"core", "base", "common", "middleware", "shared"})
TEST_PATTERNS: tuple[str, ...] = (r"test_", r"_test\.", r"/tests/", r"\\tests\\", r"_test_")


class ChangeAgent:
    """
    Stateless intelligence layer deducing architectural scope purely from git diff strings.
    Extracts module context without requiring full symbolic compilation.
    """

    def __init__(self) -> None:
        self.gitlab = GitLabService()

    async def analyze(self, mr_event: MREvent, repo: git.Repo) -> ChangeAnalysisResult:
        """
        Derive high-level volatility metrics natively from GitLab unified diffs.
        """
        diffs: list[dict[str, Any]] = await self.gitlab.get_mr_diffs(mr_event.project_id, mr_event.mr_iid)

        changed_files: list[str] = []
        lines_added: int = 0
        lines_removed: int = 0

        for diff_item in diffs:
            file_path: str = diff_item.get("new_path") or diff_item.get("old_path", "")
            if file_path and file_path not in changed_files:
                changed_files.append(file_path)

            diff_text: str = diff_item.get("diff", "")
            for line in diff_text.split("\n"):
                if line.startswith("+") and not line.startswith("+++"):
                    lines_added += 1
                elif line.startswith("-") and not line.startswith("---"):
                    lines_removed += 1

        modules_touched: list[str] = []
        for file in changed_files:
            parts: list[str] = file.replace("\\", "/").split("/")
            module: str = parts[0] if len(parts) > 1 else "root"
            if module not in modules_touched:
                modules_touched.append(module)

        touches_critical: bool = any(
            any(crit in file.lower() for crit in CRITICAL_MODULES)
            for file in changed_files
        )

        touches_core: bool = any(
            any(core in file.lower() for core in CORE_MODULES)
            for file in changed_files
        )

        test_files_in_change: list[str] = [
            file for file in changed_files
            if any(re.search(pat, file, re.IGNORECASE) for pat in TEST_PATTERNS)
        ]

        tests_added: bool = False
        tests_removed: int = 0

        for diff_item in diffs:
            new_path: str = diff_item.get("new_path", "")
            old_path: str = diff_item.get("old_path", "")
            is_new_file: bool = diff_item.get("new_file", False)
            is_deleted: bool = diff_item.get("deleted_file", False)

            is_test_file: bool = any(
                re.search(pat, new_path or old_path, re.IGNORECASE)
                for pat in TEST_PATTERNS
            )

            if is_test_file:
                if is_new_file:
                    tests_added = True
                if is_deleted:
                    tests_removed += 1

        if not tests_added and test_files_in_change:
            tests_added = True

        author_module_commits: int = await self._count_author_module_commits(
            repo, mr_event.author_username, modules_touched
        )

        return ChangeAnalysisResult(
            changed_files=changed_files,
            lines_added=lines_added,
            lines_removed=lines_removed,
            modules_touched=modules_touched,
            touches_critical=touches_critical,
            touches_core=touches_core,
            tests_added=tests_added,
            tests_removed=tests_removed,
            author_module_commits=author_module_commits,
        )

    async def _count_author_module_commits(
        self,
        repo: git.Repo,
        author_username: str,
        modules: list[str],
    ) -> int:
        """
        Thread-pool bound execution resolving the engineer's historical footprint in touched modules.
        """
        loop: asyncio.AbstractEventLoop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._count_author_module_commits_sync,
            repo,
            author_username,
            modules,
        )

    @staticmethod
    def _count_author_module_commits_sync(
        repo: git.Repo,
        author_username: str,
        modules: list[str],
    ) -> int:
        """
        Synchronous loop parsing localized git metadata for experience correlation.
        Fails safely on corrupted local repositories to prevent total pipeline blockage.
        """
        count: int = 0
        since: datetime = datetime.now() - timedelta(days=180)

        try:
            for commit in repo.iter_commits(
                repo.head.ref, since=since.isoformat(), max_count=500
            ):
                author_name: str = commit.author.name or ""
                author_email: str = commit.author.email or ""

                if (
                    author_username.lower() in author_name.lower()
                    or author_username.lower() in author_email.lower()
                ):
                    for stat_file in commit.stats.files:
                        parts: list[str] = stat_file.replace("\\", "/").split("/")
                        file_module: str = parts[0] if len(parts) > 1 else "root"
                        if file_module in modules:
                            count += 1
                            break
        except git.exc.GitCommandError:
            pass
        except Exception:
            pass

        return count
