# 🛡️ PRISM-AI — Pull Request Impact & Safety Monitor

> Autonomous Risk Intelligence for GitLab Merge Requests

[![GitLab AI Hackathon](https://img.shields.io/badge/GitLab%20AI%20Hackathon-2026-FC6D26?style=flat&logo=gitlab)](https://gitlab.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org)


---

## What is PRISM-AI?

PRISM-AI is an autonomous AI agent system that activates the moment a Merge Request is created on GitLab. It automatically analyzes the change, predicts its blast radius across the codebase, calculates a risk score, and posts a full risk intelligence report directly back to the MR — before any human reviewer opens the diff.

**The core question PRISM-AI answers:**
> *"If we merge this PR right now, what breaks?"*

---

## The Problem

Large software projects receive hundreds of Merge Requests daily. Maintainers are forced to make merge decisions without knowing:

- Which downstream services depend on the changed files
- Whether the file has historically caused bugs or hotfixes
- How deep the dependency chain runs across the codebase
- Who has the most context to review the change

The result: production incidents, broken integrations, and security regressions that should have been caught at review time.

---

## The Solution

PRISM-AI plugs directly into the GitLab event pipeline via webhooks. When a Merge Request is opened or updated:
```
MR Created on GitLab
        ↓
PRISM-AI Webhook Receives Event
        ↓
Agent Pipeline Activates Automatically
        ↓
┌─────────────────────────────────────┐
│  Change Agent    → What changed?    │
│  Dependency Agent→ What's affected? │
│  History Agent   → Any past bugs?   │
│  Risk Engine     → Score 0-100      │
│  Reviewer Agent  → Who should look? │
│  Claude AI       → Plain English    │
└─────────────────────────────────────┘
        ↓
Risk Report Posted to GitLab MR
        ↓
Reviewers Auto-Assigned
```

---

## Core Features

### 1. Blast Radius Map
AST-based dependency graph showing every module, service, and file affected by the change — color coded by impact level (direct, transitive, distant).

### 2. Risk Score Engine
Deterministic 0–100 risk score calculated from 6 signals:

| Signal | Weight |
|--------|--------|
| PR size (lines changed) | Up to +20 |
| File churn rate (last 30 days) | Up to +20 |
| Core module touched | +20 |
| Tests removed or reduced | +20 |
| Blast radius depth | Up to +15 |
| Author experience with module | +10 |

### 3. AI Risk Explanation
Anthropic Claude generates a 3-sentence plain-English risk summary with a concrete merge recommendation — specific module names, specific risks, specific actions.

### 4. Reviewer Recommendation
Git blame + commit history analysis automatically identifies who has the deepest context on the affected code and tags them directly in the MR.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| Code Analysis | tree-sitter + GitPython |
| Graph Engine | NetworkX |
| AI Layer | Anthropic Claude API |
| Database | PostgreSQL + SQLAlchemy |
| Frontend | Next.js 16 + TypeScript |
| Styling | Tailwind CSS |
| Visualization | D3.js (force-directed graph) |
| Infrastructure | Docker + GitLab Webhooks |

---

## Architecture
```
GitLab Webhook (MR Event)
          │
          ▼
  Webhook Receiver (FastAPI)
          │
          ▼
  Agent Orchestrator
          │
  ┌───────┼────────────┐
  ▼       ▼            ▼
Change  Dependency   History
Agent   Agent        Agent
          │
          ▼
  Risk Scoring Engine
          │
     ┌────┴────┐
     ▼         ▼
Reviewer    Claude AI
 Agent      Summary
     └────┬────┘
          ▼
  GitLab Comment Bot
  (Posts report to MR)
          │
          ▼
  PostgreSQL (Persists results)
          │
          ▼
  Next.js Dashboard
  (D3.js Blast Radius Graph)
```

---

## Project Structure
```
prism-ai/
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py      # Pipeline coordinator
│   │   ├── change_agent.py      # Diff extraction
│   │   ├── dependency_agent.py  # AST + graph analysis
│   │   ├── history_agent.py     # Git log mining
│   │   ├── risk_engine.py       # Risk scoring (0-100)
│   │   ├── reviewer_agent.py    # Reviewer recommendation
│   │   └── summary_agent.py     # Claude integration
│   ├── webhook/
│   │   ├── router.py            # POST /webhook/gitlab
│   │   └── handler.py           # Event dispatcher
│   ├── services/
│   │   ├── gitlab_service.py    # GitLab API client
│   │   ├── repo_service.py      # Repo clone + cache
│   │   └── anthropic_service.py # Claude API wrapper
│   ├── graph/
│   │   ├── parser.py            # tree-sitter AST parsing
│   │   ├── builder.py           # NetworkX graph build
│   │   └── analyzer.py          # BFS blast radius
│   ├── models/
│   │   └── domain.py            # Pydantic data models
│   ├── db/
│   │   └── database.py          # SQLAlchemy + Alembic
│   ├── main.py                  # FastAPI entry point
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Dashboard
│   │   └── mr/[id]/page.tsx     # MR detail view
│   └── components/
│       ├── BlastRadiusGraph.tsx # D3.js force graph
│       ├── RiskGauge.tsx        # Score arc gauge
│       └── AISummaryCard.tsx    # Claude output card
├── docs/
│   └── architecture.png
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Docker)
- GitLab account with a project
- Anthropic API key

### Backend Setup
```powershell
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

```env
GITLAB_PAT=your_gitlab_personal_access_token
ANTHROPIC_API_KEY=your_anthropic_api_key
WEBHOOK_SECRET=your_webhook_secret
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/prismai
```

Run the backend:
```powershell
python -m uvicorn main:app --reload --port 8000
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

### GitLab Webhook Configuration

In your GitLab project → Settings → Webhooks:
- URL: `https://your-domain.com/webhook/gitlab`
- Trigger: Merge Request Events
- Secret Token: value from your `.env`

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/webhook/gitlab` | POST | GitLab MR event receiver |
| `/api/mr` | GET | List all analyzed MRs |
| `/api/mr/{id}` | GET | Full MR analysis detail |
| `/api/stats` | GET | Dashboard statistics |

Full interactive API docs at `http://localhost:8000/docs`

---

## Team

**ZerothLayer**

---

## Built For

GitLab AI Hackathon 2026 — *"You Orchestrate. AI Accelerates."*

Target prizes: Grand Prize · Most Technically Impressive · Most Impactful · GitLab + Anthropic Prize

---

## License

MIT License — see [LICENSE](LICENSE) for details.
