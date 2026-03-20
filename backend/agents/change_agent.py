"""
PRISM Change Agent — Diff extraction, file categorization, and module analysis.
"""
import asyncio
import os
import re
from datetime import datetime, timedelta
from typing import Any

import git

from models.schemas import MREvent, ChangeResult
from services.gitlab_service import GitLabService


# Module classification patterns
CRITICAL_MODULES = ["auth", "payment", "security", "billing", "oauth"]
CORE_MODULES = ["core", "base", "common", "middleware", "shared"]
TEST_PATTERNS = [r"test_", r"_test\.", r"/tests/", r"\\tests\\", r"_test_"]


class ChangeAgent:
    """Analyzes MR diffs to extract changed files, module classification, and author stats."""

    def __init__(self) -> None:
        self.gitlab = GitLabService()

    async def analyze(self, mr_event: MREvent, repo: git.Repo) -> ChangeResult:
        """Full change analysis: fetch diffs, classify files, compute stats."""

        # Step 1: Fetch MR diffs from GitLab API
        diffs = await self.gitlab.get_mr_diffs(mr_event.project_id, mr_event.mr_iid)

        # Step 2: Extract changed file paths
        changed_files: list[str] = []
        lines_added = 0
        lines_removed = 0

        for diff_item in diffs:
            file_path = diff_item.get("new_path") or diff_item.get("old_path", "")
            if file_path and file_path not in changed_files:
                changed_files.append(file_path)

            # Count line changes from the diff content
            diff_text = diff_item.get("diff", "")
            for line in diff_text.split("\n"):
                if line.startswith("+") and not line.startswith("+++"):
                    lines_added += 1
                elif line.startswith("-") and not line.startswith("---"):
                    lines_removed += 1

        # Step 3: Map files to modules (first directory component)
        modules_touched: list[str] = []
        for f in changed_files:
            parts = f.replace("\\", "/").split("/")
            if len(parts) > 1:
                module = parts[0]
            else:
                module = "root"
            if module not in modules_touched:
                modules_touched.append(module)

        # Step 4: Detect critical modules
        touches_critical = any(
            any(crit in f.lower() for crit in CRITICAL_MODULES)
            for f in changed_files
        )

        # Step 5: Detect core modules
        touches_core = any(
            any(core in f.lower() for core in CORE_MODULES)
            for f in changed_files
        )

        # Step 6: Detect test files
        test_files_in_change = [
            f for f in changed_files
            if any(re.search(pat, f, re.IGNORECASE) for pat in TEST_PATTERNS)
        ]

        # Step 7: Tests added / removed
        tests_added = False
        tests_removed = 0

        for diff_item in diffs:
            new_path = diff_item.get("new_path", "")
            old_path = diff_item.get("old_path", "")
            is_new_file = diff_item.get("new_file", False)
            is_deleted = diff_item.get("deleted_file", False)

            is_test_file = any(
                re.search(pat, new_path or old_path, re.IGNORECASE)
                for pat in TEST_PATTERNS
            )

            if is_test_file:
                if is_new_file:
                    tests_added = True
                if is_deleted:
                    tests_removed += 1

        # If no test files were explicitly added as new, check if test content was added
        if not tests_added and test_files_in_change:
            tests_added = True

        # Step 8: Author module commit count (run in executor — blocking git op)
        author_module_commits = await self._count_author_module_commits(
            repo, mr_event.author_username, modules_touched
        )

        return ChangeResult(
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
        """Count how many commits the MR author has made to the touched modules."""
        loop = asyncio.get_event_loop()
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
        """Synchronous git log scan for author commits to modules."""
        count = 0
        since = datetime.now() - timedelta(days=180)

        try:
            for commit in repo.iter_commits(
                repo.head.ref, since=since.isoformat(), max_count=500
            ):
                author_name = commit.author.name or ""
                author_email = commit.author.email or ""

                if (
                    author_username.lower() in author_name.lower()
                    or author_username.lower() in author_email.lower()
                ):
                    for f in commit.stats.files:
                        parts = f.replace("\\", "/").split("/")
                        file_module = parts[0] if len(parts) > 1 else "root"
                        if file_module in modules:
                            count += 1
                            break
        except Exception:
            pass

        return count
