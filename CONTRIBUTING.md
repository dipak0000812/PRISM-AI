# Contributing to PRISM

First, thank you for considering contributing to PRISM! 
We welcome PRs scaling our `tree_sitter` language-parsers, optimizing the Agent threads, or expanding frontend visualizer aesthetics. 

This document serves as the guide for cloning, modifying, building, and deploying PRISM natively for local development.

---

## 🔧 Local Development Setup

We highly recommend utilizing Docker Compose for streamlined execution.

### Prerequisites
- Node.js 20.x
- Python 3.12 (For bare-metal backend testing)
- Docker & Docker Compose
- A GitLab Account + GitLab Personal Access Token (PAT)
- A Groq API Key

### Installation

1. **Clone the repository**
```bash
git clone https://gitlab.com/Dipak_09/prism-ai.git
cd prism-ai
```

2. **Environment Configuration**
Create the master `.env` file at the root tracking the `.env.example` schema.
```bash
cp .env.example .env
```
Ensure you correctly populate `GITLAB_PAT`, `GROQ_API_KEY`, and `NEXTAUTH_SECRET`. 

3. **Spin Up Containers**
```bash
docker-compose up --build
```
This deploys the PostgreSQL persistence layer, the FastAPI backend worker, and the Next.js visualizer node synchronously. 

* The Dashboard will boot at `http://localhost:3000`
* The API / Swagger UI will boot at `http://localhost:8000/docs`

---

## 🧪 Running Tests

Maintaining our 0-crash deterministic boundaries requires strict CI verifications. Run the test harness prior to pushing code.

### Backend Testing (Pytest)
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
```

### Type Checking & Formatting
```bash
# Backend 
flake8 .
mypy .

# Frontend
cd frontend
npm run lint
npm run type-check
```

---

## 📬 Submitting Changes

1. **Fork exactly against `main`**.
2. Create a targeted, concise branch `feat/add-java-ast-parser` or `fix/graph-memory-leak`.
3. Commit cleanly using Semantic Commits natively (`feat:`, `fix:`, `chore:`). 
4. Check that your PR triggers tests on GitHub Actions / GitLab CI pipelines successfully.
5. In your Merge Request, detail exactly *what* you changed and run a quick PRISM evaluation passively on it!

---

## 🎨 Code Style Quotas

We hold a senior-level architectural standard. Please conform to the pipeline exactly:

- **Backend (Python)**:
  - No bare `except Exception:` blocks unless absolutely guarding async outer-threads.
  - Required full variable native typings via modern Python 3.10 boundaries (e.g., `dict[str, list[int]]`).
  - Strict PEP-8 Import Sorting (Stdlib -> Third Party -> Local Models).
  - Explicit, why-oriented docstrings.
- **Frontend (TypeScript/Next.js)**:
  - Strict Server/Client component isolation boundaries (`'use client'`).
  - Clerk.com style highly-responsive aesthetic mandates. No ugly unpadded divs.
  - TailWind CSS v4 strictly conforming to defined variable root tokens.
