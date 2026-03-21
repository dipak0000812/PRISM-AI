# PRISM Technical Architecture

This document outlines the design decisions, component boundaries, and internal mechanics driving the PRISM analysis pipeline. It is written to provide engineering maintainers and security auditors immediate clarity into the system's runtime execution.

## 1. System Overview: Event-Driven & Async-First

PRISM operates inherently on an asynchronous, event-driven architecture designed to intercept GitLab webhooks immediately. GitLab enforces strict timeouts on webhook deliveries; if the receiving server blocks or halts execution, GitLab eventually severs the webhook integration.

To counter this, PRISM uses **FastAPI Background Tasks**. The edge receiver (`POST /webhook/gitlab`) strictly authenticates the payload, validates the basic `mr_event` envelope, and then instantly returns a `200 OK`. The intensive AST compilations, graph traversals, and network LLM prompts execute purely decoupled asynchronously across non-blocking executor thread pools.

## 2. Webhook Security Layer

Data purity starts at the ingress. The edge-layer validates webhooks using a secure constant-time comparator (`hmac.compare_digest`). GitLab uniquely broadcasts an explicit token header (`X-Gitlab-Token`) rather than mathematically signing the JSON payload payload. 

By comparing the configured `.env` webhook secret identically against the ingress header in constant-time, we isolate the application against sophisticated timing-attack vector penetrations. Malformed payloads or unverified requests raise immediate standard 401 HTTP Exceptions and drop the connection.

## 3. Agent Pipeline Strategy

Instead of building a monolithic AI system attempting to ingest the entire diff blindly, PRISM fragments domain intelligence into discrete "Agents" operating under the Single Responsibility Principle. This fundamentally prevents hallucination and maximizes computational speed. 

Each agent functions securely within its isolated domain schema (e.g., `HistoryAnalysisResult`):
- **Change Agent**: Mines line-level mutations and maps them to structural modules.
- **Dependency Agent**: Builds relational graphs.
- **History Agent**: Resolves past failures structurally.
- **Risk Agent**: Computes the final aggregate weights.
- **Reviewer Agent**: Calculates reviewer matrices by blame intersections.
- **Summary Agent**: Operates strictly as the final natural language formatter.

## 4. AST Graph Engine & BFS Target Computation

A simple text-search cannot evaluate a blast radius cleanly due to relative scopes and polymorphic inheritance. Instead, PRISM utilizes `tree-sitter`—a C-based parsing engine—to reconstruct exact Abstract Syntax Trees dynamically. 

`DependencyAgent` intercepts Python logic natively. It walks the `tree_sitter` AST recursively, trapping `import X` and `from X import Y` boundaries mathematically to construct a structural `NetworkX.DiGraph`. 

Upon receiving a "Changed File" list from the Change Agent, this graph is natively reversed (`G.reverse()`). PRISM engages a target **Breadth-First Search (BFS)**, branching hierarchically outward capped at `max_graph_depth=5`. This precisely traces dependencies, locating exactly which downstream APIs break when an upstream module is violently modified.

## 5. Risk Scoring Heuristics

ML Black-Box decision modeling is inappropriate for code infrastructure since reviewers cannot natively trust an opaque "High Risk" label intuitively. PRISM relies tightly on a **deterministic matrix spanning 6 components mapping perfectly to strict integers summing to 100**.

- `PR Size`: Massive PRs are intrinsically impossible to review cleanly safely. (15 Points)
- `File Churn`: Code modified constantly is historically violently unstable. (20 Points)
- `Core Modules`: Touchpoints hitting explicit `auth`, `billing` directories spike risk heavily. (20 Points)
- `Test Coverage`: Adding code without generating identical test components flags critical drops in structural safety. (20 Points)
- `Dependency Depth`: Triggers aggressively when downstream impact radii span more than 4 layers via `NetworkX`. (15 Points)
- `Author Experience`: Weighs the author's previous Git-Log history localized specifically to the mutated modules. (10 Points)

## 6. AI Integration philosophy

Unlike basic conversational models bridging LLMs into execution cycles (e.g. LangChain), PRISM deliberately limits AI models strictly to the absolute end of the pipeline. In PRISM, **Groq Llama-3.3-70B acts solely as a text synthesizer, not an analytical decision engine.**

All critical decisions—the blast chain, the exact lines of risk, and the reviewer targets—are fully derived natively using Python algorithms. The LLM is supplied highly compressed metadata to generate a short 4-sentence overview mapping to human context logic cleanly, isolating the pipeline from unexpected hallucination breaks and saving heavy compute context window costs.

## 7. PostgreSQL Persistence 

Analytical results are synchronized forcefully into an asynchronous PostgreSQL backend leveraging SQLAlchemy 2.0. To sidestep massive relational joins breaking dashboard scaling dynamics dynamically, we map complex object datasets (such as `NetworkX` graph exports) neatly into isolated JSONB attributes stored cleanly against the single overarching `MRAnalysis` row block. Upsert strategies (`ON CONFLICT DO UPDATE`) ensure repeat webhook executions (e.g., updating branches or pushing new commits) reliably supersede outdated analysis states cleanly across the DB.

## 8. Scalability & Event Limits

- By mapping thread-pool isolations across expensive Git object unnestings correctly over `asyncio.AbstractEventLoop`, FastAPI is shielded cleanly from standard Python thread-blocking faults natively.
- PRISM currently defaults clone bounds to `depth=100` via Github/Gitlab sparse checkouts dynamically, bypassing exhaustive Gb-level disk bandwidth fetches natively per webhook.

## 9. Security & Boundary Fencing

By strictly enforcing parameterized SQL routines natively via SQLAlchemy ORM mappings, the platform blocks external String payload injections completely. Pydantic 2.0 schemas aggressively sanitize all inward-facing user variables dynamically, discarding nested or trailing garbage requests violently before they trigger processing events internally.
