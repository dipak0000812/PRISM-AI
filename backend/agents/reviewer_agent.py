"""
PRISM Reviewer Agent — Git blame-based reviewer suggestion engine.
"""
import asyncio
from datetime import datetime, timedelta
from collections import defaultdict

import git

from models.schemas import ReviewerSuggestion, ReviewerResult


class ReviewerAgent:
    """Suggests reviewers based on git blame, commit frequency, and module ownership."""

    async def suggest(
        self,
        changed_files: list[str],
        blast_radius: list[str],
        repo: git.Repo,
        exclude_username: str,
    ) -> ReviewerResult:
        """Identify the top reviewers by analyzing git history for changed + affected files."""
        loop = asyncio.get_event_loop()
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
    ) -> ReviewerResult:
        """Synchronous reviewer analysis using git log and blame."""

        # Combine changed files with top blast radius files
        files_to_analyze = list(changed_files) + blast_radius[:5]
        # Deduplicate while preserving order
        seen: set[str] = set()
        unique_files: list[str] = []
        for f in files_to_analyze:
            if f not in seen:
                seen.add(f)
                unique_files.append(f)

        # Track commit counts and module ownership per author
        author_commits: dict[str, int] = defaultdict(int)
        author_modules: dict[str, set[str]] = defaultdict(set)
        since = datetime.now() - timedelta(days=180)

        for file_path in unique_files:
            # Extract module from file path
            parts = file_path.replace("\\", "/").split("/")
            module = parts[0] if len(parts) > 1 else "root"

            # Analyze git log commits for this file
            try:
                for commit in repo.iter_commits(
                    repo.head.ref,
                    paths=file_path,
                    since=since.isoformat(),
                    max_count=100,
                ):
                    author_name = commit.author.name or ""
                    author_email = commit.author.email or ""

                    # Skip the MR author
                    if (
                        exclude_username.lower() in author_name.lower()
                        or exclude_username.lower() in author_email.lower()
                    ):
                        continue

                    # Use a normalized author identifier
                    author_key = author_name if author_name else author_email
                    if not author_key:
                        continue

                    author_commits[author_key] += 1
                    author_modules[author_key].add(module)
            except Exception:
                continue

            # Also try git blame for more granular ownership
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

                    author_key = author_name if author_name else author_email
                    if not author_key:
                        continue

                    # Count blame lines as weighted commits (fewer weight than full commits)
                    lines_count = len(blame_entry[1])
                    author_commits[author_key] += max(1, lines_count // 10)
                    author_modules[author_key].add(module)
            except Exception:
                continue

        # Sort by commit count and take top 3
        sorted_authors = sorted(
            author_commits.items(), key=lambda x: x[1], reverse=True
        )[:3]

        reviewers: list[ReviewerSuggestion] = []
        rationale: dict[str, str] = {}

        for author_name, commit_count in sorted_authors:
            modules = sorted(author_modules.get(author_name, set()))
            reviewer = ReviewerSuggestion(
                username=author_name,
                commit_count=commit_count,
                modules=modules,
            )
            reviewers.append(reviewer)
            rationale[author_name] = (
                f"{commit_count} commits across modules: {', '.join(modules)}"
            )

        return ReviewerResult(reviewers=reviewers, rationale=rationale)
