# Phase Scorecard

**Purpose:** Score phase quality across engineering dimensions at Phase Gate.  
**Audience:** Reviewers preparing [00-PHASE-GATE.md](00-PHASE-GATE.md) evidence.  
**Normative keywords:** RFC 2119.

---

## Scoring scale

| Score | Label | Meaning |
|-------|-------|---------|
| **PASS** | Meets standard | No action required |
| **WARN** | Acceptable with debt | Log in retrospective; does not block PASS WITH OBSERVATIONS |
| **FAIL** | Below standard | **REWORK REQUIRED** — cannot PASS gate |

Any dimension **FAIL** blocks Phase Gate **PASS** unless owner explicitly overrides with documented rationale.

---

## Scorecard

**Phase:** <!-- e.g. Phase 5 Embedding -->  
**Date:**  
**Reviewer:**

| # | Dimension | Score | Evidence / notes |
|---|-----------|-------|------------------|
| 1 | **Design alignment** | PASS / WARN / FAIL | ADR, design doc, TASK_PROMPT deliverables |
| 2 | **Architecture compliance** | PASS / WARN / FAIL | Layers, ports, dependency direction |
| 3 | **Backward compatibility** | PASS / WARN / FAIL | API, MCP, schema additive |
| 4 | **Security & isolation** | PASS / WARN / FAIL | Owner scope, auth, fail-closed |
| 5 | **Test adequacy** | PASS / WARN / FAIL | Coverage of changed behavior, regression |
| 6 | **Performance budgets** | PASS / WARN / FAIL | Caps, N+1, inference rules |
| 7 | **Documentation sync** | PASS / WARN / FAIL | ARCHITECTURE, roadmap, ADR, PANDUAN |
| 8 | **Future phase readiness** | PASS / WARN / FAIL | Extension points open for next 3 phases |
| 9 | **Technical debt control** | PASS / WARN / FAIL | No unbounded new debt without logging |
| 10 | **Operational readiness** | PASS / WARN / FAIL | Scripts, env, migration, rollback |

---

## Dimension criteria

### 1 — Design alignment

- **PASS:** Implementation matches approved ADR and phase scope
- **WARN:** Minor drift documented in retrospective
- **FAIL:** Scope creep, missing ADR, or violates TASK_PROMPT constraints

### 2 — Architecture compliance

- **PASS:** [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) preserved; extension not rewrite
- **WARN:** Known debt (e.g. god-class size) documented with mitigation path
- **FAIL:** Layer violation, duplicate canonical owner, or `*V2` module

### 3 — Backward compatibility

- **PASS:** Additive changes only
- **WARN:** Deprecation announced; migration path documented
- **FAIL:** Breaking REST/MCP/schema without owner approval

### 4 — Security & isolation

- **PASS:** Owner-scoped queries; cross-owner not-found semantics
- **WARN:** API leak tests incomplete but service layer verified
- **FAIL:** Scope leak, secrets exposure, or auth bypass

### 5 — Test adequacy

- **PASS:** Changed behavior tested; full suite green
- **WARN:** Gap in E2E but strong unit/repo coverage
- **FAIL:** Missing tests for new ports or security paths

### 6 — Performance budgets

- **PASS:** Within [12-PERFORMANCE-STANDARD.md](../../supplementary/PERFORMANCE.md) caps
- **WARN:** Known hotspot documented (e.g. N× recordAccess)
- **FAIL:** Unbounded query, sync inference on CRUD, or ignored ceilings

### 7 — Documentation sync

- **PASS:** Roadmap, ARCHITECTURE, ADRs current
- **WARN:** Minor cross-ref drift
- **FAIL:** Phase marked complete but docs contradict implementation

### 8 — Future phase readiness

- **PASS:** Ports and schema support roadmap next phases
- **WARN:** Optional prep item deferred with ADR note
- **FAIL:** Decision blocks Phase N+1, N+2, or N+3 without ADR

### 9 — Technical debt control

- **PASS:** New debt logged with priority in retrospective
- **WARN:** Debt increased but bounded and prioritized
- **FAIL:** Unlogged structural debt or unbounded refactor scope

### 10 — Operational readiness

- **PASS:** Migrations idempotent; scripts dry-run default; rollback documented
- **WARN:** Manual ops step documented in PANDUAN
- **FAIL:** Non-idempotent migration or no rollback path

---

## Gate derivation

| Scorecard result | Phase Gate verdict |
|----------------|-------------------|
| All PASS | **PASS** |
| Any WARN, zero FAIL | **PASS WITH OBSERVATIONS** |
| Any FAIL | **REWORK REQUIRED** |
| Constitutional violation | **BLOCKER** (regardless of scores) |

---

*Used at Phase Gate only. Subordinate to [00-PHASE-GATE.md](00-PHASE-GATE.md).*
