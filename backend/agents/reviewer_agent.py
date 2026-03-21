"""
PRISM Reviewer Agent — Structural blame mapping isolating optimal reviewer topologies.
"""
import asyncio
from collections import defaultdict
from datetime import datetime, timedelta

import git

from models.schemas import ReviewerAnalysisResult, ReviewerSuggestion

MAX_COMMITS_HISTORY: int = 100
MAX_REVIEWERS_RETURNED: int = 3
DAYS_LOOKBACK: int = 180


class ReviewerAgent:
    """
    Synthesizes git-log author trajectories to heuristically bind Code Reviewers to files safely decoupled from the MR author.
    """

    async def suggest(
        self,
        changed_files: list[str],
        blast_radius: list[str],
        repo: git.Repo,
        exclude_username: str,
    ) -> ReviewerAnalysisResult:
        """Asynchronously dispatch deep iterative git-blame scans into non-blocking thread pools."""
        loop: asyncio.AbstractEventLoop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._suggest_sync,
            changed_files,
            blast_radius,
            repo,
            exclude_username,
        )

    def _suggest_sync(
        self,
        changed_files: list[str],
        blast_radius: list[str],
        repo: git.Repo,
        exclude_username: str,
    ) -> ReviewerAnalysisResult:
        """
        Calculates optimal reviewers based squarely on commit footprints and direct file line-level ownership (blame).
        Guards gracefully against malformed commit structures natively.
        """
        files_to_analyze: list[str] = list(changed_files) + blast_radius[:5]
        
        seen: set[str] = set()
        unique_files: list[str] = []
        for file in files_to_analyze:
            if file not in seen:
                seen.add(file)
                unique_files.append(file)

        author_commits: dict[str, int] = defaultdict(int)
        author_modules: dict[str, set[str]] = defaultdict(set)
        since: datetime = datetime.now() - timedelta(days=DAYS_LOOKBACK)

        for file_path in unique_files:
            parts: list[str] = file_path.replace("\\", "/").split("/")
            module: str = parts[0] if len(parts) > 1 else "root"

            try:
                for commit in repo.iter_commits(
                    repo.head.ref,
                    paths=file_path,
                    since=since.isoformat(),
                    max_count=MAX_COMMITS_HISTORY,
                ):
                    author_name: str = commit.author.name or ""
                    author_email: str = commit.author.email or ""

                    if (
                        exclude_username.lower() in author_name.lower()
                        or exclude_username.lower() in author_email.lower()
                    ):
                        continue

                    author_key: str = author_name if author_name else author_email
                    if not author_key:
                        continue

                    author_commits[author_key] += 1
                    author_modules[author_key].add(module)
            except git.exc.GitCommandError:
                continue
            except Exception:
                continue

            try:
                for blame_entry in repo.blame(repo.head.ref, file_path):
                    commit_obj = blame_entry[0]
                    author_name = commit_obj.author.name or ""
                    author_email = commit_obj.author.email or ""

                    if (
                        exclude_username.lower() in author_name.lower()
                        or exclude_username.lower() in author_email.lower()
                    ):
                        continue

                    author_key: str = author_name if author_name else author_email
                    if not author_key:
                        continue

                    lines_count: int = len(blame_entry[1])
                    author_commits[author_key] += max(1, lines_count // 10)
                    author_modules[author_key].add(module)
            except git.exc.GitCommandError:
                continue
            except Exception:
                continue

        sorted_authors: list[tuple[str, int]] = sorted(
            author_commits.items(), key=lambda x: x[1], reverse=True
        )[:MAX_REVIEWERS_RETURNED]

        reviewers: list[ReviewerSuggestion] = []
        rationale: dict[str, str] = {}

        for author_name, commit_count in sorted_authors:
            modules: list[str] = sorted(list(author_modules.get(author_name, set())))
            reviewer = ReviewerSuggestion(
                username=author_name,
                commit_count=commit_count,
                modules=modules,
            )
            reviewers.append(reviewer)
            rationale[author_name] = f"{commit_count} commits across modules: {', '.join(modules)}"

        return ReviewerAnalysisResult(reviewers=reviewers, rationale=rationale)
