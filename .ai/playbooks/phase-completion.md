# Playbook: Phase Completion

**ID:** `playbooks/phase-completion`  
**Purpose:** Formally close phase N: verify success criteria, record gate verdict, freeze phase artifacts.  
**Owner sign-off:** Phase Gate **PASS** or **PASS WITH OBSERVATIONS** required.

---

## When to execute

- Implementation complete per `{TASK_PROMPT_PATH}`
- All phase milestones addressed or explicitly deferred with owner approval
- Test quality gate green
- Architecture review complete

**Not for:** release to production (see [release.md](release.md)) or incident handling.

---

## Prerequisites

| Check | Source |
|-------|--------|
| Phase CHECKLIST largely complete | `phases/NN-name/CHECKLIST.md` |
| IMPLEMENTATION, TESTING, MIGRATION drafted | Phase folder |
| Quality commands pass | `{TEST_COMMAND}` |
| No open BLOCKER from architecture review | `phases/NN-name/REVIEW.md` draft |

---

## Procedure

### 1. Verification chain

| Order | Prompt / action |
|-------|-----------------|
| 1 | `testing/regression-verification` |
| 2 | `review/code-review` |
| 3 | `review/security-review` (if auth, data, or new surface) |
| 4 | `architecture/compliance-check` |

### 2. Phase artifact completion

Update `phases/NN-name/`:

| Document | Content |
|----------|---------|
| `TESTING.md` | Evidence — suites, counts, fixtures |
| `COMPLETION.md` | Success criteria → evidence mapping |
| `REVIEW.md` | Architecture review findings |
| `CHECKLIST.md` | All items checked or waived with owner note |
| `RISKS.md` | Realized and deferred risks |

### 3. Scorecard

Complete [review/02-PHASE-SCORECARD.md](../review/02-PHASE-SCORECARD.md). No dimension **FAIL**.

### 4. Phase gate

Execute [review/00-PHASE-GATE.md](../review/00-PHASE-GATE.md).

Record in `phases/NN-name/REVIEW.md`:

| Field | Value |
|-------|-------|
| Verdict | PASS / PASS WITH OBSERVATIONS / REWORK / BLOCKER |
| Date | ISO date |
| Owner | Name |
| Observations | Non-blocking debt |

### 5. Retrospective

Run prompt: `documentation/session-handoff` (extended) or complete [review/03-PHASE-RETROSPECTIVE.md](../review/03-PHASE-RETROSPECTIVE.md).

File in `phases/NN-name/RETROSPECTIVE.md`.

### 6. Roadmap and architecture sync

| Document | Update |
|----------|--------|
| `{ROADMAP_PATH}` | Phase N → ✅ Completed |
| `{ARCHITECTURE_SNAPSHOT_PATH}` | Phase row, ports, metrics |
| `{ADR_INDEX_PATH}` | Relevant ADRs → **Implemented** |
| `{TASK_PROMPT_PATH}` | Archive completion report |

### 7. Audit record

Append or update [audits/phase-NN.md](../audits/) and refresh [audits/latest.md](../audits/latest.md).

### 8. Freeze phase folder

All `phases/NN-name/` documents become **read-only** (append-only addenda).

---

## Exit criteria

- [ ] Gate verdict **PASS** or **PASS WITH OBSERVATIONS**
- [ ] Roadmap and architecture snapshot updated
- [ ] ADRs marked Implemented where applicable
- [ ] Retrospective filed
- [ ] Audit record updated
- [ ] Phase folder frozen

---

## Verdict handling

| Verdict | Next step |
|---------|-----------|
| **PASS** | Run [phase-start.md](phase-start.md) for N+1 |
| **PASS WITH OBSERVATIONS** | PASS + debt in RETROSPECTIVE; then phase-start |
| **REWORK** | Return to implementation; re-run gate when fixed |
| **BLOCKER** | `operations/escalation`; halt next phase |

---

## Dependencies

| Artifact | Relationship |
|----------|----------------|
| [review/00-PHASE-GATE.md](../review/00-PHASE-GATE.md) | Normative gate |
| [phases/PHASE-DOCUMENT-SCHEMA.md](../phases/PHASE-DOCUMENT-SCHEMA.md) | Document freeze rules |
| [audits/](../audits/README.md) | Audit trail |

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands** for test/evidence gathering. **Claude**, **ChatGPT** for gate documentation. Owner must sign verdict.

---

*AI assistants MUST NOT self-approve gate PASS.*
