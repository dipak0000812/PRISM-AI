# PRISM-AI — Risk Scoring Algorithm

**Location:** `backend/agents/risk_agent.py`  
**Output range:** 0–100 (integer)  
**Execution time:** < 10ms (pure computation, no I/O)

---

## Philosophy

PRISM-AI uses a deterministic, additive scoring model. Every point is traceable to a specific, measurable signal from the repository. There are no weights trained on historical data, no confidence intervals, and no black-box outputs.

This is a deliberate choice.

A tool that influences merge decisions needs to be trustworthy. Trustworthy means a developer can read the breakdown table, look at the signal column, and independently verify whether the assessment is correct. If PRISM-AI says a file has a churn score of 12 commits in 30 days, you can run `git log --since="30 days ago" -- path/to/file` yourself and confirm it.

The LLM (Groq llama-3.3-70b) is used only at the final stage to translate these computed numbers into readable English. It does not make risk decisions. It describes them.

---

## How the Score Is Computed

Six factors are evaluated independently. Their point values are added together to produce the final score, capped at 100.

```
score = factor_1 + factor_2 + factor_3 + factor_4 + factor_5 + factor_6
score = min(score, 100)
```

The score is deterministic. The same MR, the same repository state, the same commit history will always produce the same score. This matters for debugging, for trust, and for consistency across teams.

---

## The Six Factors

### Factor 1 — PR Size (max 15 points)

**Signal:** Total lines added plus lines removed in the MR diff.

| Threshold | Points |
|-----------|--------|
| > 500 lines | 15 |
| > 200 lines | 10 |
| > 50 lines | 5 |
| ≤ 50 lines | 0 |

**Rationale:** Cognitive load scales with diff size. A reviewer can meaningfully evaluate a 40-line change. A 700-line change across 15 files is impossible to review with the same care. PR size is a proxy for review quality, not code quality — a large PR from a careful engineer still carries higher risk than a small one simply because the reviewer has less capacity to catch every edge case.

This factor has a low ceiling (15 points) because size alone is not a reliable danger signal. A large refactor touching no critical modules and removing no tests may be low risk despite its size.

---

### Factor 2 — File Churn (max 20 points)

**Signal:** Number of commits touching any changed file in the last 30 days, from git log.

| Threshold | Points |
|-----------|--------|
| > 10 commits / 30 days | 20 |
| > 5 commits / 30 days | 12 |
| > 2 commits / 30 days | 5 |
| ≤ 2 commits / 30 days | 0 |

**Rationale:** High commit frequency on a file indicates it is actively contested — multiple engineers modifying it, frequent bug fixes, or ongoing architectural churn. Files in this state are statistically more likely to have conflicting assumptions about their behavior. A new change landing on top of an actively churning file has a higher probability of introducing a regression than the same change to a stable file.

The 30-day window balances recency with enough history to detect patterns. A file with 11 commits in the past month is genuinely unstable. A file with 11 commits spread over 3 years is not.

**Implementation note:** PRISM-AI uses a shallow clone with `depth=100`. If the churn window extends beyond the 100 most recent commits, older data is unavailable. The breakdown table shows the actual count used, so reviewers understand the data coverage.

---

### Factor 3 — Core Module Touched (max 20 points)

**Signal:** Whether any changed file path contains keywords associated with critical or core functionality.

| Classification | Keywords | Points |
|---------------|----------|--------|
| Critical | `auth`, `payment`, `security`, `billing`, `oauth` | 20 |
| Core | `core`, `base`, `common`, `middleware`, `shared` | 10 |
| Other | none of the above | 0 |

**Rationale:** Not all files carry equal blast potential. A change to `auth/middleware.py` has fundamentally different risk characteristics than a change to `scripts/generate_report.py`, even if both are the same size with the same churn history. Authentication, payment processing, and security modules have outsized downstream impact — bugs in these areas affect every user and often have security implications.

The keyword match is intentionally simple. A path containing `auth` is treated as critical regardless of context. This produces occasional false positives (a documentation file at `docs/auth-guide.md`) but ensures no false negatives on genuine critical code changes. For a risk tool, missing a real critical change is worse than flagging a non-critical one.

---

### Factor 4 — Test Coverage (max 20 points)

**Signal:** Whether test files were removed or absent from the MR.

| Condition | Points |
|-----------|--------|
| Test files removed (count > 0) | 20 |
| No test files added to MR | 8 |
| Test files added | 0 |

**Rationale:** Removing tests is the most direct signal of reduced safety coverage — the previous behavior is no longer verified. It scores the maximum for this factor.

Adding production code without adding tests does not score as high (8 points rather than 20) because some legitimate changes are difficult to unit test, and some codebases have separate test suites not included in the MR. It is a yellow flag, not a red one.

Test file detection uses path heuristics: files containing `test_`, `_test`, or living under a `/tests/` directory. This is not perfect — a codebase using a non-standard test structure may produce false negatives. Future versions will support configurable test path patterns.

---

### Factor 5 — Dependency Depth (max 15 points)

**Signal:** Maximum BFS traversal depth from changed files in the dependency graph.

```
points = min(max_impact_depth × 5, 15)
```

| Depth | Points |
|-------|--------|
| 3+ layers | 15 |
| 2 layers | 10 |
| 1 layer | 5 |
| 0 layers | 0 |

**Rationale:** A change that only affects the file it touches is contained. A change that propagates through 3 layers of imports — file A is changed, B imports A, C imports B, D imports C — can break D even though D was never touched by the author. The deeper the blast radius, the harder it is to reason about all consequences at review time.

The depth measurement comes from BFS traversal on the reversed dependency graph (see ARCHITECTURE.md for details). The reversal is important: we want "who depends on this changed file" not "what does this changed file depend on."

The 15-point ceiling reflects that blast radius depth is a meaningful signal but not the dominant one. A deep but well-tested dependency chain may be lower actual risk than a shallow change to an auth module.

---

### Factor 6 — Author Experience (max 10 points)

**Signal:** Number of prior commits by the MR author to the modules being changed.

| Threshold | Points |
|-----------|--------|
| < 3 prior commits to this module | 10 |
| ≥ 3 prior commits | 0 |

**Rationale:** This factor is not about developer skill — it is about contextual familiarity with a specific module. A senior engineer making their first change to the billing service carries more risk than a junior engineer who has committed to that same service 20 times, because the senior engineer lacks the implicit knowledge of that module's quirks, edge cases, and known fragile areas.

The threshold of 3 commits is low by design. Three commits is enough to have encountered the module in a real debugging session, to have read the surrounding code with context, to have some muscle memory about what is safe to change.

The module granularity is the first directory component of each changed file — `auth/middleware.py` belongs to the `auth` module. Commit counts are computed across all files in that directory from git log.

---

## Severity Levels

| Score | Level | What it means |
|-------|-------|---------------|
| 0–30 | LOW | Standard review process is appropriate |
| 31–60 | MEDIUM | Review with attention to the flagged factors |
| 61–80 | HIGH | Requires careful review; consider requesting additional reviewers |
| 81–100 | CRITICAL | High-risk label applied; senior reviewer mandatory before merge |

PRISM-AI applies the `high-risk` GitLab label automatically on scores above 80.

---

## What This Model Does Not Capture

Being explicit about limitations is part of being trustworthy.

**Code quality:** The model says nothing about whether the code is well-written, follows conventions, or introduces performance problems. A small, focused change to a stable, non-critical file will score near zero regardless of code quality.

**Business logic correctness:** PRISM-AI does not understand what the code is supposed to do. It only analyzes structural properties of the change.

**Test quality:** The model detects presence or absence of test files, not whether they actually test the right things. Adding a test file with one trivially passing assertion satisfies Factor 4.

**External dependencies:** Changes to `package.json`, `requirements.txt`, or other dependency manifests are not currently analyzed for the transitive impact of version upgrades.

---

## Future Directions

The deterministic model is the correct foundation for PRISM-AI's current stage. Once a system like this has been running on real repositories for months, it accumulates incident correlation data — which MRs that scored high actually caused production issues, and which scored low but caused problems anyway.

That data enables a calibration layer: adjusting factor weights based on actual outcomes within a specific organization's codebase. The base signals remain deterministic and auditable. The weights become organization-specific without losing explainability — you can still trace every point to a signal, you just know that *this organization* has found file churn to be a stronger predictor than author experience for their particular codebase.

This is the correct trajectory: deterministic foundation, empirically calibrated weights, never opaque ML that obscures the reasoning.

---

*PRISM-AI · ZerothLayer · GitLab AI Hackathon 2026*