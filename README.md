# PRISM 
**Autonomous blast radius intelligence for every merge request.**

[![GitLab AI Hackathon](https://img.shields.io/badge/GitLab_AI_Hackathon-2026-fc6d26?logo=gitlab)](https://about.gitlab.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js)](https://nextjs.org)
[![Groq Llama 3](https://img.shields.io/badge/Powered_by-Groq_Llama--3-f55036)](https://groq.com)

---

## 🛑 The Problem

Large engineering teams merge hundreds of pull requests weekly. 
Each one is a potential blast event — a change that propagates 
through dependency layers in ways no single reviewer can manually trace.

The questions that go unanswered before every merge:
- Which downstream services depend on this file?
- Has this module caused incidents before?  
- How deep does the dependency chain run?
- Who has the most context to catch edge cases?

The result is production incidents, security regressions, and 
maintainer burnout from manual code archaeology on every review.

PRISM answers all four questions automatically, in under 4 seconds,
before any human opens the diff.

---

## ⚙️ How PRISM Works

PRISM is an event-driven, multi-agent AI pipeline. It ingests GitLab webhook payloads, mathematically traverses the repository syntax tree, analyzes the git blame footprint, and coordinates deterministic heuristics to block dangerous merges.

```text
┌─────────────────────────────────────────────────────────┐
│                    GITLAB PLATFORM                      │
│              Developer opens Merge Request              │
└──────────────────────┬──────────────────────────────────┘
                       │ webhook event
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  PRISM BACKEND (FastAPI)                 │
│                                                         │
│  Webhook Receiver → HMAC validation → Background task  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Change  │  │   Dep.   │  │ History  │             │
│  │  Agent   │  │  Agent   │  │  Agent   │             │
│  │diff+AST  │  │NetworkX  │  │GitPython │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       └─────────────┼─────────────┘                    │
│                     ▼                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Risk    │  │Reviewer  │  │  Groq    │             │
│  │  Agent   │  │  Agent   │  │   AI     │             │
│  │ 0-100    │  │git blame │  │ Summary  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       └─────────────┼─────────────┘                    │
│                     ▼                                   │
│            GitLab Comment Bot                           │
│         PostgreSQL (Analysis Store)                     │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              PRISM DASHBOARD (Next.js)                  │
│     D3.js Blast Radius Graph · Risk Analytics           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Key Features

### Deterministic Risk Triangulation
Rather than relying on opaque LLMs to "guess" risk, PRISM anchors on six deterministic metrics extracted directly from AST dependencies and Git history.

| Factor | Signal | Max Points |
|--------|--------|-----------|
| PR Size | Lines changed | 15 |
| File Churn | Commits per file (30d) | 20 |
| Core Module | auth/payment/security touched | 20 |
| Test Coverage | Tests removed or missing | 20 |
| Dependency Depth | BFS traversal layers | 15 |
| Author Experience | Prior commits to module | 10 |

### Abstract Syntax Tree (AST) Blast Engine
Using `tree-sitter`, PRISM reconstructs the entire Python/JS project as a `NetworkX` Directed Graph in memory. It executes a Breadth-First-Search (BFS) reversal to calculate the exact structural blast radius of any mutated module.

### Precision Reviewer Targeting
We bypass primitive codeowners files. Utilizing `git blame` layered against specific modified code blocks, PRISM resolves the most highly-correlated active maintainers who authentically hold the domain context natively.

### Groq Fast-Path LLM Generation
Only after deterministic data structures are extracted does PRISM hit the `Llama-3.3-70b` foundational model via Groq's LPUs. Inferencing happens precisely on a narrow window of factual metadata to project human-readable developer summaries instantly.

---

## 📽️ Demo

![PRISM Analysis in Action](/placeholder-demo.gif)
*(The PRISM bot intercepts the webhook, analyzes the risk trajectory locally, and fires a targeted PR review comment within 4 seconds containing the blast graph, risk scoring breakdown, and reviewer tags.)*

---

## 🖥️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.12 + FastAPI | Async webhook processing |
| Code Analysis | tree-sitter 0.21 | Language-aware AST parsing |
| Graph Engine | NetworkX + BFS | Blast radius computation |
| AI Summary | Groq (llama-3.3-70b) | Risk explanation generation |
| Database | PostgreSQL + SQLAlchemy | Analysis persistence |
| Frontend | Next.js 15 + TypeScript | Real-time dashboard |
| Visualization | D3.js force-directed | Interactive blast radius graph |
| Auth | NextAuth.js v5 | OAuth (Google/GitHub/GitLab) |
| Infrastructure | Docker Compose | One-command deployment |

---

## 🚀 Quick Start

Spin up the entire intelligence platform locally via Docker.

```bash
git clone https://gitlab.com/Dipak_09/prism-ai
cd prism-ai
cp .env.example .env   # Add your GITLAB_PAT, GROQ_API_KEY
docker-compose up -d
# Configure GitLab webhook → https://your-ngrok-url/webhook/gitlab
# Open a merge request → watch PRISM analyze it automatically
```

---

## 🌐 API Reference

PRISM exposes a strictly structured RESTful pipeline over FastAPI.

- `POST /webhook/gitlab`: Edge ingestion layer for Merge Requests. Validates the `X-Gitlab-Token` cryptographically and spawns the decoupled background pipeline.
- `GET /api/analyses`: Fetches the aggregated, JSONB-serialized risk trajectories to bootstrap the frontend visualizer.
- `GET /api/analyses/{id}`: Detailed metric payload traversing the blast radius and factor weights.

*Full OpenAPI Swagger specification available routinely at `http://localhost:8000/docs`.*

---

## 🏅 Team & Hackathon Context
**Team:** ZerothLayer
**Submission:** GitLab AI Hackathon 2026 
**Goals:** To introduce enterprise-grade code intelligence seamlessly into the merge workflow, eliminating speculative review assignments and fundamentally ending blind production failures. 
