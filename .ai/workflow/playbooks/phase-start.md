# Playbook: Phase Start

**ID:** `playbooks/phase-start`  
**Purpose:** Authorize design and implementation for phase N+1 after phase N is closed.  
**Owner sign-off:** Readiness **READY** verdict required.

---

## When to execute

- After phase N receives **PASS** or **PASS WITH OBSERVATIONS** on [review/00-PHASE-GATE.md](../review/00-PHASE-GATE.md)
- Before rotating `{TASK_PROMPT_PATH}` to phase N+1
- Before any phase N+1 code merge

**Not for:** mid-phase work, hotfixes, or releases (see other playbooks).

---

## Prerequisites

| Check | Source |
|-------|--------|
| Phase N gate recorded | `phases/NN-name/REVIEW.md` |
| Roadmap phase N marked complete | `{ROADMAP_PATH}` |
| Dependency phases complete | Roadmap dependency table |
| ADR gates **Approved** (not Proposed) | `{ADR_INDEX_PATH}` |
| Extension points exist in codebase | `{SOURCE_ROOT}` |

---

## Procedure

### 1. Session open

Run prompt: `operations/session-start`

Provide: `{PROJECT_NAME}`, `{GOVERNANCE_ROOT}`, `{CONSTITUTION_PATH}`, task = "Phase {N+1} readiness"

### 2. Readiness review

Execute [review/04-PHASE-READINESS.md](../review/04-PHASE-READINESS.md) checklist.

Record verdict in: `phases/{N+1}-name/README.md` (status → **Ready**)

### 3. Phase folder activation

Open or update `phases/{N+1}-name/`:

| Document | Action |
|----------|--------|
| `README.md` | Status Ready; link roadmap row |
| `CHECKLIST.md` | Copy from [review/01-PHASE-CHECKLIST.md](../review/01-PHASE-CHECKLIST.md) |
| `DESIGN.md` | Draft or link approved ADR |
| `RISKS.md` | Initial register from roadmap risks |

### 4. Planning chain (if scope not yet defined)

| Order | Prompt |
|-------|--------|
| 1 | `planning/scope-definition` |
| 2 | `planning/work-breakdown` |
| 3 | `planning/dependency-planning` |
| 4 | `planning/risk-register` |

### 5. Design chain (structural work)

| Order | Prompt |
|-------|--------|
| 1 | `analysis/codebase-exploration` |
| 2 | `architecture/system-design-brief` |
| 3 | `architecture/adr-authoring` (if structural) |
| 4 | `architecture/compliance-check` |
| 5 | `review/design-review` |

### 6. Task prompt rotation

Rotate `{TASK_PROMPT_PATH}` from [templates/task-prompt.md](../templates/task-prompt.md).

### 7. Owner verdict

| Verdict | Action |
|---------|--------|
| **READY** | Proceed to implementation playbook pre-step (`implementation/pre-implementation-gate`) |
| **NOT READY** | Halt; resolve blockers; do not code |
| **DEFERRED** | Log reason in phase README; revisit date |

---

## Exit criteria

- [ ] Readiness Review **READY** recorded
- [ ] Phase N+1 folder active with CHECKLIST, DESIGN, RISKS
- [ ] Required ADRs **Approved**
- [ ] `{TASK_PROMPT_PATH}` rotated
- [ ] No implementation commits until `implementation/pre-implementation-gate` passes

---

## Dependencies

| Artifact | Relationship |
|----------|----------------|
| [phase-completion.md](phase-completion.md) | Precedes this for phase N |
| [review/04-PHASE-READINESS.md](../review/04-PHASE-READINESS.md) | Normative process |
| [phases/PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md) | Document lifecycle |

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Cursor**, **Codex**, **Gemini**, **OpenHands** — Cursor/OpenHands preferred for codebase verification steps.

---

*Halt on Proposed ADR or missing dependency — use `operations/escalation`.*
