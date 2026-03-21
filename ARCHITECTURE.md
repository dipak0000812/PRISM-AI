# PRISM-AI — Technical Architecture

**Version:** 1.0  
**Team:** ZerothLayer  
**Hackathon:** GitLab AI Hackathon 2026

---

## Design Philosophy

PRISM-AI is built on three architectural convictions:

**1. Determinism over magic.** Every point in the risk score is traceable to a specific, measurable signal. No black-box ML models guessing at risk. A developer reading the output can verify every claim independently. This makes the system trustworthy — which is the only thing that matters in a tool that influences merge decisions.

**2. AI at the edge, not the core.** The intelligence in PRISM-AI comes from code analysis algorithms and graph computation. The LLM sees structured data that has already been fully analyzed and translates it into plain English. It is a communication layer. If the LLM API goes down, the risk score, blast radius, and breakdown table still post. The system degrades gracefully.

**3. Event-driven, fire-and-forget.** GitLab sends a webhook and gets a `200 OK` in under 50ms. The entire analysis pipeline runs asynchronously in a background task. This is non-negotiable — GitLab will retry webhooks that time out, creating duplicate analysis runs.

---

## System Layers

### Layer 1 — Event Layer

**Components:** GitLab Webhooks, `webhook/router.py`, `webhook/validator.py`

GitLab emits a `merge_request` event to `POST /webhook/gitlab` whenever an MR is opened or reopened. The router performs two operations before touching any application logic:

**HMAC Validation:** GitLab sends the raw secret token in the `X-Gitlab-Token` header. The validator compares this against the configured `WEBHOOK_SECRET` using `hmac.compare_digest` — a constant-time comparison that prevents timing attacks. Any request failing validation returns `401` immediately.

**Action Filtering:** The router only processes `action: open` and `action: reopen` events. All other MR actions (update, merge, close) return `{"status": "ignored"}`. This prevents redundant analysis on every MR edit.

**Background dispatch:** After validation and filtering, the router extracts an `MREvent` Pydantic model from the payload and dispatches it to `AgentOrchestrator.run_pipeline()` via FastAPI's `BackgroundTasks`. The HTTP response returns immediately.

The critical payload extraction detail: GitLab's `project` block uses `http_url` (not `http_url_to_repo` as documented) for the clone URL. PRISM-AI handles both keys with a fallback chain.

---

### Layer 2 — Orchestration Layer

**Component:** `agents/orchestrator.py` — `AgentOrchestrator`

The orchestrator sequences the agent pipeline and manages the analysis lifecycle. It is the only component with knowledge of the full pipeline — individual agents know nothing about each other.

**Pipeline stages (in order):**

```
Stage 1:  clone_or_fetch(repo)              — repository access
Stage 2:  change_agent.analyze()            — what changed?
Stage 3:  dependency_agent.build_graph()    — what does it affect?
Stage 4:  history_agent.analyze()           — has this broken things before?
Stage 5:  risk_agent.calculate()            — how bad is it? (synchronous)
Stage 6:  reviewer_agent.suggest()          — who should review this?
Stage 7:  summary_agent.generate()          — explain it in plain English
Stage 8:  _save_analysis()                  — persist to PostgreSQL
Stage 9:  gitlab_service.post_comment()     — post risk report to MR
Stage 10: gitlab_service.assign_reviewers() — auto-assign reviewers
```

Stage ordering is intentional and cannot be reordered. Stage 3 requires Stage 2's `changed_files` output. Stage 5 requires all of Stages 2, 3, and 4. Stage 7 is last because it depends on all prior analysis being complete before calling the AI.

The entire pipeline is wrapped in a top-level `try/except` — if any stage fails unexpectedly, the error is logged and the pipeline exits cleanly without crashing the background task. GitLab never receives an error signal.

Stage 8 uses a PostgreSQL `ON CONFLICT DO UPDATE` (upsert) rather than a simple INSERT. This handles the case where GitLab sends duplicate webhook events for the same MR — a common occurrence with unstable network connections.

---

### Layer 3 — Intelligence Layer

#### Change Agent (`agents/change_agent.py`)

The change agent is the pipeline entry point for analysis. It fetches the MR diff from `GET /projects/{id}/merge_requests/{iid}/diffs` and extracts:

- `changed_files`: list of file paths modified in this MR
- `lines_added / lines_removed`: raw line counts from diff stats
- `modules_touched`: first directory component of each changed file
- `touches_critical`: True if any file path contains `auth`, `payment`, `security`, `billing`, `oauth`
- `touches_core`: True if any file path contains `core`, `base`, `common`, `middleware`, `shared`
- `tests_added / tests_removed`: count of test files added or removed (paths containing `test_`, `_test`, or `/tests/`)
- `author_module_commits`: number of commits by the MR author to the changed modules

The criticality classification is intentionally simple. A path containing `auth` is treated as critical regardless of context. False positives (an `auth_utils.md` doc file) are acceptable — false negatives (missing a real auth change) are not.

#### Dependency Agent (`agents/dependency_agent.py`)

The dependency agent is the most technically significant component of PRISM-AI. It performs static program analysis on the entire repository to construct a directed dependency graph, then computes blast radius through graph traversal.

**AST Parsing — Python:**

tree-sitter v0.21.3 parses Python source files into Abstract Syntax Trees. The parser walks the AST looking for `import_statement` and `import_from_statement` nodes. This extracts the actual module names without fragile regex patterns — it handles aliased imports (`import auth as a`), star imports, and nested import structures correctly.

```python
# Example: from auth.middleware import AuthMiddleware
# Extracted as: "auth.middleware"
# Resolved to: "auth/middleware.py"
```

**AST Parsing — JavaScript/TypeScript:**

For `.js`, `.ts`, `.jsx`, `.tsx` files, relative imports are extracted via regex matching `import ... from './path'` and `require('./path')` patterns. Only relative imports (starting with `./` or `../`) are tracked — third-party package imports are excluded because they don't represent internal dependency relationships.

**Graph Construction:**

Every source file in the repository becomes a node in a `nx.DiGraph`. An edge from file A to file B means "A imports B" — A depends on B. The graph is built by walking all supported files and resolving their imports to file paths within the repository.

Directories excluded from analysis: `node_modules/`, `.git/`, `__pycache__/`, `dist/`, `build/`, `.next/`, `venv/`, `.venv/`. Including these would pollute the graph with thousands of irrelevant nodes.

**Blast Radius Computation — BFS:**

For each changed file, PRISM-AI runs BFS on the **reversed** graph. Reversing the direction means "find all files that depend on this changed file" — the downstream impact — rather than "find all files this changed file depends on" — the upstream dependencies.

```python
# G.reverse() transforms: A→B (A imports B) 
# into: B→A (B is imported by A)
# BFS from changed_file finds all files that will be affected
```

`nx.single_source_shortest_path_length(G.reverse(), changed_file, cutoff=5)` returns every affected node and its depth (number of dependency layers from the change). The cutoff prevents infinite traversal on circular dependency graphs.

The result is serialized to NetworkX's node-link JSON format, which D3.js consumes directly — no transformation layer needed.

#### History Agent (`agents/history_agent.py`)

The history agent uses GitPython to mine the repository's commit log for two signals:

**File Churn:** Count of commits touching each changed file in the last 30 days. High churn indicates an actively modified, potentially unstable file. The `since=` parameter on `iter_commits` filters to the time window. Running on a shallow clone (`depth=100`) means churn data only covers the most recent 100 commits — an acceptable limitation noted in the risk output.

**Incident Correlation:** Scan the last 500 commits for hotfix keywords in the commit message (`hotfix`, `fix:`, `bugfix`, `revert`, `patch`, `regression`, `rollback`). For each hotfix commit, check if it touched any of the changed files. A file with high incident count is demonstrably bug-prone.

Both operations run via `loop.run_in_executor(None, ...)` — GitPython's blocking I/O runs in a thread pool to avoid blocking the async event loop.

#### Risk Agent (`agents/risk_agent.py`)

The risk agent is the only synchronous agent in the pipeline — pure computation, no I/O. It takes the outputs of all three preceding agents and computes a deterministic 0–100 score.

Each factor is evaluated independently and contributes additively to the total:

```
Factor 1 — PR Size:
  lines = change.lines_added + change.lines_removed
  >500 → 15pts | >200 → 10pts | >50 → 5pts | else → 0

Factor 2 — File Churn (30-day commit frequency):
  max_churn = max(history.churn_scores.values(), default=0)
  >10 → 20pts | >5 → 12pts | >2 → 5pts | else → 0

Factor 3 — Core Module Touched:
  touches_critical → 20pts | touches_core → 10pts | else → 0

Factor 4 — Test Coverage:
  tests_removed > 0 → 20pts | not tests_added → 8pts | else → 0

Factor 5 — Dependency Depth:
  min(dep.max_impact_depth * 5, 15)

Factor 6 — Author Experience:
  author_module_commits < 3 → 10pts | else → 0
```

The total is capped at 100. Level classification: `score ≥ 81 → critical`, `≥ 61 → high`, `≥ 31 → medium`, `else → low`.

The breakdown dict is stored per-factor with both the points and the signal that triggered them — enabling the explainable breakdown table in both the MR comment and the dashboard.

#### Reviewer Agent (`agents/reviewer_agent.py`)

The reviewer agent identifies the engineers with the deepest historical context on the affected code. It runs `git log` per changed file filtered to the last 6 months, counting commits per author. The MR author is excluded from suggestions — they already know the code they just changed.

The top 3 authors by commit count are returned with their module ownership context. These are then assigned directly to the MR via `PUT /projects/{id}/merge_requests/{iid}` — not just mentioned in the comment.

#### Summary Agent (`agents/summary_agent.py`)

The summary agent is the final stage. By this point, the full analysis is complete — blast radius, risk score, breakdown, reviewers. The agent constructs a structured prompt containing all of this data and sends it to Groq's API.

The prompt is engineered to prevent vague output. Explicit instructions: name specific modules, explain why the risk level is what it is based on the actual data, end with a concrete recommendation. The phrase "this PR modifies code" is explicitly prohibited in the prompt.

`max_tokens=300` constrains the output to 3–4 sentences. Any exception from the Groq API returns the fallback string `"AI summary unavailable — see risk breakdown above."` — the pipeline continues regardless.

---

### Layer 4 — Action Layer

**Components:** `services/gitlab_service.py`

The GitLab service is an async HTTP client wrapping the GitLab REST API v4. All requests use the PAT from `settings.gitlab_pat` in the `PRIVATE-TOKEN` header.

**Comment formatting:** The risk report is rendered as GitLab-flavored Markdown. The format was designed to be immediately scannable — risk score and level in the first line, blast radius chain as arrows, breakdown as a table, AI summary in a blockquote, reviewers as @mentions.

**Reviewer assignment:** Usernames are resolved to user IDs via `GET /users?username=...` before calling `PUT /projects/{id}/merge_requests/{iid}` with `reviewer_ids`. This is best-effort — failure does not halt the pipeline.

**Label assignment:** MRs scoring above `settings.risk_block_threshold` (default 80) automatically receive a `high-risk` label via the MR update endpoint.

---

### Layer 5 — Storage Layer

**Components:** `db/database.py`, `models/db_models.py`

PostgreSQL 16 with SQLAlchemy 2.0 async engine using asyncpg. Two tables:

**`mr_analyses`** — one row per analyzed MR. The unique constraint on `(project_gitlab_id, mr_iid)` enforces exactly-once semantics. Re-analysis of the same MR uses `ON CONFLICT DO UPDATE` to overwrite with fresh results. JSONB columns store `risk_breakdown` and `blast_radius_data` — structured data that benefits from PostgreSQL's JSON operators for future dashboard queries.

**`file_risk_history`** — one row per changed file per analysis. Enables historical trend queries: "which files have been consistently high-churn over the past 90 days?"

The async session factory uses `async_sessionmaker` with `expire_on_commit=False` — essential for async contexts where attributes may be accessed after the session has closed.

---

### Layer 6 — Presentation Layer

**Components:** `frontend/` — Next.js 15 App Router

**Dashboard architecture:** React Query polls `GET /api/analyses` every 10 seconds. New analyses appear in the MR list automatically — no manual refresh needed during the demo. This creates the live feeling of a real-time system.

**D3.js Blast Radius Graph:** The force-directed graph accepts NetworkX's node-link JSON format directly — the same format the backend serializes. No transformation layer. D3's `forceSimulation` with `forceManyBody`, `forceLink`, and `forceCenter` positions nodes. Node color is determined by `risk_level` attribute: `changed` → red, `high` → orange, `medium` → amber, `low` → green, `safe` → muted gray.

Hovering a node highlights it and all first-degree connections, dims everything else to 15% opacity, and shows a tooltip with the filename and impact depth. Zoom and pan via `d3.zoom()` with `scaleExtent([0.4, 3])`.

**Authentication:** NextAuth.js v5 with Google, GitHub, and GitLab OAuth providers plus email/password credentials. All dashboard routes (`/dashboard`, `/mr`, `/graph`, `/settings`) are protected by `proxy.ts` middleware. Unauthenticated requests redirect to `/login`. Sessions are stored as httpOnly JWT cookies — no localStorage, no XSS risk.

---

## Performance Budget

| Stage | Target | Actual (observed) |
|-------|--------|-------------------|
| Webhook receipt + validation | < 50ms | ~15ms |
| Repository clone (cache miss) | < 30s | ~20s (first time) |
| Repository fetch (cache hit) | < 2s | ~500ms |
| Change agent (diff fetch) | < 500ms | ~200ms |
| Dependency graph build | < 5s | ~2-3s |
| History analysis | < 1s | ~800ms |
| Risk scoring | < 10ms | <5ms |
| Groq AI summary | < 3s | ~1.5s |
| GitLab comment post | < 500ms | ~300ms |
| **Total pipeline (cache hit)** | **< 10s** | **~4-6s** |

---

## Security Design

**Webhook authentication:** HMAC comparison using `hmac.compare_digest` prevents timing attacks. Requests without the correct `X-Gitlab-Token` header return 401 before any payload parsing occurs.

**Credential handling:** All secrets via environment variables. The `.env` file is gitignored. `.env.example` contains only placeholder values. The GitLab PAT is injected into clone URLs at runtime using string replacement — never logged, never stored in the database.

**Path traversal prevention:** All file paths from the dependency agent are resolved and validated to remain within the cloned repository's working directory. Symlinks are not followed.

**Prompt injection:** MR title and description are never included in the Groq prompt. Only structured metadata (file paths, numeric counts, computed scores) is passed. A malicious commit message cannot manipulate the AI output.

**Repository analysis safety:** tree-sitter and GitPython perform read-only static analysis. No code from analyzed repositories is executed at any point.

---

## GitLab Duo Integration

PRISM-AI registers as a native GitLab Duo custom agent under `.gitlab/agents/prism-risk-agent/`. The agent is configured with HTTP tool calls to the PRISM-AI backend API, enabling developers to query risk analysis directly from GitLab Duo Chat.

The automated flow under `.gitlab/flows/prism-mr-analysis/` triggers on MR open and reopen events, running analysis through GitLab's Duo Agent Platform — which provides Anthropic Claude access by default through GitLab's infrastructure.

This dual integration (webhook-based backend + Duo Agent Platform) means PRISM-AI operates at two levels simultaneously: automated silent analysis via webhooks, and on-demand conversational analysis via Duo Chat.

---

## Deployment

Single command to start the full three-service stack:

```bash
docker-compose up -d
```

Services:
- `backend` — FastAPI on port 8000
- `frontend` — Next.js on port 3000  
- `postgres` — PostgreSQL 16 on port 5432

The backend container waits for PostgreSQL's health check before starting. Database tables are created on first startup via SQLAlchemy's `create_all`. The repository cache volume persists across container restarts — subsequent analyses of the same repository skip the clone step entirely.

---

*PRISM-AI · ZerothLayer · GitLab AI Hackathon 2026*