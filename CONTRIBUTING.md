# Contributing to PRISM-AI

Thank you for your interest in PRISM-AI. This guide covers everything you need to get the development environment running, understand the codebase, and contribute changes.

---

## Development Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker Desktop
- A GitLab account with a project you can configure webhooks on
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- ngrok (for exposing localhost to GitLab webhooks)

### Clone and configure

```bash
git clone https://gitlab.com/Dipak_09/prism-ai.git
cd prism-ai
cp .env.example .env
```

Edit `.env` with your real values. The minimum required for local development:

```bash
GITLAB_PAT=glpat-xxxx          # api + ai_features scope
GROQ_API_KEY=gsk_xxxx
WEBHOOK_SECRET=any-string-you-choose
DATABASE_URL=postgresql+asyncpg://prism:prism@localhost:5432/prism
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Full stack via Docker (recommended)

```bash
docker-compose up -d
docker-compose logs backend -f   # watch pipeline logs
```

### Expose to GitLab webhooks

```bash
ngrok http 8000
# Copy the https URL
# GitLab project → Settings → Webhooks → Add
# URL: https://xxxx.ngrok-free.app/webhook/gitlab
# Trigger: Merge request events
# Secret: same value as WEBHOOK_SECRET in .env
```

---

## Project Structure

```
backend/
├── agents/          Core analysis pipeline — one agent per concern
├── services/        External API clients (GitLab, repo cache)
├── webhook/         Event receiver and validation
├── models/          Pydantic schemas and SQLAlchemy models
├── db/              Async database engine and session management
├── utils/           Structured logging
├── config.py        All settings via pydantic-settings
└── main.py          FastAPI app, route registration, startup

frontend/
├── app/             Next.js App Router pages
├── components/      Reusable React components
├── lib/             API client (axios), React Query hooks, utilities
├── auth.ts          NextAuth.js provider configuration
└── proxy.ts         Route protection middleware
```

---

## Running Tests

```bash
cd backend
pip install pytest pytest-asyncio
pytest tests/ -v
```

The test suite covers the risk scoring engine with deterministic assertions — same input always produces same score, scores are bounded 0–100, factor contributions are correct.

To run a quick syntax check across all backend modules:

```bash
python -m compileall . -q
```

---

## Code Style

**Python:**
- PEP-8 formatting
- Type hints on every function — both parameters and return type
- Imports grouped: stdlib → third-party → local, one blank line between groups
- Docstrings explain *why* the code exists, not *what* it does
- Named constants for all threshold values — no magic numbers in logic
- Specific exception types, never bare `except Exception` without a comment

**TypeScript/React:**
- Strict mode enabled
- No `any` types
- Component props fully typed
- All async operations wrapped in React Query — no raw `useEffect` for data fetching

**Git commits:**
Follow conventional commits format:
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, dependency updates
- `docs:` — documentation only
- `refactor:` — code change with no behavior change
- `test:` — test additions or fixes

---

## Architecture Decisions

Before making changes, read [ARCHITECTURE.md](ARCHITECTURE.md). Key decisions that should not change without discussion:

**Synchronous risk agent:** `risk_agent.py` is intentionally synchronous — pure computation with no I/O. Do not add async or network calls to it.

**AI at the final stage only:** The summary agent is called last, after all analysis is complete. Do not add LLM calls to other agents. Intelligence comes from algorithms, not prompts.

**Background task isolation:** The orchestrator runs in a FastAPI `BackgroundTask`. It must never throw an uncaught exception — wrap everything. GitLab retries webhooks on non-200 responses, which would cause duplicate analyses.

**Upsert over insert:** The database layer uses `ON CONFLICT DO UPDATE`. Do not change this to a plain INSERT — duplicate webhook delivery is normal and must be handled idempotently.

---

## Adding a New Risk Factor

The risk scoring model is defined in `backend/agents/risk_agent.py`. To add a new factor:

1. Add the input signal to the appropriate agent's output schema in `models/schemas.py`
2. Compute the signal in the relevant agent
3. Add the factor computation in `risk_agent.py` following the existing pattern
4. Update the `RiskBreakdown` schema to include the new factor
5. Update the comment template in `gitlab_service.py` to show the new factor in the breakdown table
6. Update `docs/risk-scoring.md` with the new factor's rationale
7. Add test cases in `tests/test_risk_agent.py`

Keep the total maximum score at 100. Adjust existing factor weights if adding a new one.

---

## Submitting Changes

1. Create a branch: `git checkout -b feat/your-feature-name`
2. Make changes and ensure tests pass: `pytest tests/ -v`
3. Ensure backend compiles clean: `python -m compileall . -q`
4. Commit with a conventional commit message
5. Push and open a merge request on `gitlab.com/Dipak_09/prism-ai`
6. The MR will be automatically analyzed by PRISM-AI itself

---

## Questions

Open an issue on the GitLab repository. Describe the problem or question clearly — include relevant log output if it's a bug.

---

*PRISM-AI · ZerothLayer · GitLab AI Hackathon 2026*