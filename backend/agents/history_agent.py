"""
PRISM History Agent — Commit traversal engines profiling code stability logic.
"""
import asyncio
from datetime import datetime, timedelta

import git

from models.schemas import HistoryAnalysisResult

HOTFIX_KEYWORDS: frozenset[str] = frozenset({"hotfix", "fix:", "bugfix", "revert", "patch", "regression", "rollback"})


class HistoryAgent:
    """
    Miners analyzing chronological VCS state, extracting systemic failures and author expertise mapping.
    """

    async def analyze(
        self,
        changed_files: list[str],
        repo: git.Repo,
        author_username: str,
    ) -> HistoryAnalysisResult:
        """
        Orchestrator firing concurrent, highly intensive git-log scan jobs efficiently via thread pools.
        """
        loop: asyncio.AbstractEventLoop = asyncio.get_event_loop()

        churn_future = loop.run_in_executor(
            None, self._compute_file_churn, repo, changed_files, 30
        )
        incident_future = loop.run_in_executor(
            None, self._flag_incident_prone_files, repo, changed_files
        )
        experience_future = loop.run_in_executor(
            None, self._get_author_experience, repo, changed_files, author_username
        )

        churn_scores: dict[str, int] = await churn_future
        incident_counts: dict[str, int] = await incident_future
        author_experience: dict[str, int] = await experience_future

        return HistoryAnalysisResult(
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
        """
        Pinpoints modules actively shifting in purpose, effectively proxying instability.
        """
        since: datetime = datetime.now() - timedelta(days=days)
        churn: dict[str, int] = {file_str: 0 for file_str in changed_files}

        try:
            for commit in repo.iter_commits(
                repo.head.ref, since=since.isoformat(), max_count=1000
            ):
                for f in commit.stats.files:
                    normalized: str = f.replace("\\", "/")
                    if normalized in churn:
                        churn[normalized] += 1
        except git.exc.GitCommandError:
            pass
        except Exception:
            pass

        return churn

    @staticmethod
    def _flag_incident_prone_files(
        repo: git.Repo,
        changed_files: list[str],
    ) -> dict[str, int]:
        """
        Uncovers recurring historical traps by hunting specific production-save keywords.
        """
        incident_counts: dict[str, int] = {file_str: 0 for file_str in changed_files}

        try:
            for commit in repo.iter_commits(repo.head.ref, max_count=500):
                msg: str = commit.message.lower()
                if any(kw in msg for kw in HOTFIX_KEYWORDS):
                    for f in commit.stats.files:
                        normalized: str = f.replace("\\", "/")
                        if normalized in incident_counts:
                            incident_counts[normalized] += 1
        except git.exc.GitCommandError:
            pass
        except Exception:
            pass

        return incident_counts

    @staticmethod
    def _get_author_experience(
        repo: git.Repo,
        changed_files: list[str],
        author_username: str,
    ) -> dict[str, int]:
        """
        Cross-validates an author's commit cadence relative to specific files, isolating blind spots objectively.
        """
        experience: dict[str, int] = {file_str: 0 for file_str in changed_files}

        try:
            for commit in repo.iter_commits(repo.head.ref, max_count=500):
                author_name: str = commit.author.name or ""
                author_email: str = commit.author.email or ""

                if (
                    author_username.lower() in author_name.lower()
                    or author_username.lower() in author_email.lower()
                ):
                    for f in commit.stats.files:
                        normalized: str = f.replace("\\", "/")
                        if normalized in experience:
                            experience[normalized] += 1
        except git.exc.GitCommandError:
            pass
        except Exception:
            pass

        return experience
