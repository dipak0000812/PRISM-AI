"""
PRISM History Agent — Git log churn analysis and incident correlation.
"""
import asyncio
from datetime import datetime, timedelta

import git

from models.schemas import HistoryResult


HOTFIX_KEYWORDS = [
    "hotfix", "fix:", "bugfix", "revert", "patch", "regression", "rollback"
]


class HistoryAgent:
    """Analyzes repository commit history for file churn, incidents, and author experience."""

    async def analyze(
        self,
        changed_files: list[str],
        repo: git.Repo,
        author_username: str,
    ) -> HistoryResult:
        """Run all history analysis methods asynchronously via thread pool."""
        loop = asyncio.get_event_loop()

        # Run all three analyses concurrently in executor threads
        churn_future = loop.run_in_executor(
            None, self._compute_file_churn, repo, changed_files, 30
        )
        incident_future = loop.run_in_executor(
            None, self._flag_incident_prone_files, repo, changed_files
        )
        experience_future = loop.run_in_executor(
            None, self._get_author_experience, repo, changed_files, author_username
        )

        churn_scores = await churn_future
        incident_counts = await incident_future
        author_experience = await experience_future

        return HistoryResult(
            churn_scores=churn_scores,
            incident_counts=incident_counts,
            author_experience=author_experience,
        )

    @staticmethod
    def _compute_file_churn(
        repo: git.Repo,
        changed_files: list[str],
        days: int = 30,
    ) -> dict[str, int]:
        """Count how many commits touched each changed file in the last N days.
        
        High churn = instability indicator.
        """
        since = datetime.now() - timedelta(days=days)
        churn: dict[str, int] = {f: 0 for f in changed_files}

        try:
            for commit in repo.iter_commits(
                repo.head.ref, since=since.isoformat(), max_count=1000
            ):
                for f in commit.stats.files:
                    normalized = f.replace("\\", "/")
                    if normalized in churn:
                        churn[normalized] += 1
        except Exception:
            pass

        return churn

    @staticmethod
    def _flag_incident_prone_files(
        repo: git.Repo,
        changed_files: list[str],
    ) -> dict[str, int]:
        """Scan recent commits for hotfix/incident keywords and count per file.
        
        Files frequently involved in hotfixes are higher risk.
        """
        incident_counts: dict[str, int] = {f: 0 for f in changed_files}

        try:
            for commit in repo.iter_commits(repo.head.ref, max_count=500):
                msg = commit.message.lower()
                if any(kw in msg for kw in HOTFIX_KEYWORDS):
                    for f in commit.stats.files:
                        normalized = f.replace("\\", "/")
                        if normalized in incident_counts:
                            incident_counts[normalized] += 1
        except Exception:
            pass

        return incident_counts

    @staticmethod
    def _get_author_experience(
        repo: git.Repo,
        changed_files: list[str],
        author_username: str,
    ) -> dict[str, int]:
        """Count how many commits the MR author has made to each changed file.
        
        Low experience = higher risk (author unfamiliar with the code).
        """
        experience: dict[str, int] = {f: 0 for f in changed_files}

        try:
            for commit in repo.iter_commits(repo.head.ref, max_count=500):
                author_name = commit.author.name or ""
                author_email = commit.author.email or ""

                if (
                    author_username.lower() in author_name.lower()
                    or author_username.lower() in author_email.lower()
                ):
                    for f in commit.stats.files:
                        normalized = f.replace("\\", "/")
                        if normalized in experience:
                            experience[normalized] += 1
        except Exception:
            pass

        return experience
