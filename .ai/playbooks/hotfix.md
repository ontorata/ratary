# Playbook: Hotfix

**ID:** `playbooks/hotfix`  
**Purpose:** Deliver an urgent production fix outside normal phase flow with minimal scope and full traceability.  
**Owner sign-off:** Required before merge and deploy.

---

## When to execute

- Production defect with active or imminent user impact
- Fix cannot wait for current phase completion
- Workaround insufficient or unavailable

**Not for:** planned features, refactors, or phase scope (use phase playbooks).

---

## Prerequisites

| Check | Action |
|-------|--------|
| Incident documented or triaged | [incident-response.md](incident-response.md) if SEV1–2 |
| Scope limited to fix only | Owner confirms |
| Rollback path exists | [rollback.md](rollback.md) drafted |

---

## Procedure

### 1. Triage (if not done)

Prompt: `operations/incident-triage` or `operations/production-debug`

### 2. Minimal impact analysis

Prompt: `analysis/change-impact`

**Rule:** Hotfix MUST NOT expand scope. No drive-by refactors.

### 3. Pre-implementation gate (abbreviated)

Prompt: `implementation/pre-implementation-gate`

Confirm:
- Fix is backward compatible OR owner approves break
- No structural change without expedited ADR addendum
- Tests cover the defect

### 4. Implement

Prompt: `implementation/incremental-delivery` (single-step preferred)

Branch naming: `hotfix/{short-description}`

### 5. Verify

| Order | Prompt |
|-------|--------|
| 1 | `testing/unit-test-design` or targeted test |
| 2 | `testing/regression-verification` |
| 3 | `review/code-review` |
| 4 | `review/security-review` (if security-related) |

### 6. Deploy

Follow [release.md](release.md) **expedited path** (skip version features if patch only).

### 7. Document

| Artifact | Action |
|----------|--------|
| Changelog | `documentation/changelog-authoring` — PATCH entry |
| Runbook | Update if new operational step |
| Incident record | Link hotfix PR to incident |
| `audits/latest.md` | Note hotfix and any debt accepted |

### 8. Post-fix

Schedule proper fix in phase backlog if hotfix introduced debt.

---

## Exit criteria

- [ ] Defect verified fixed in `{ENVIRONMENT}`
- [ ] Regression suite pass
- [ ] Owner approved merge and deploy
- [ ] Changelog and incident updated
- [ ] Debt logged if applicable

---

## Forbidden

1. Scope creep — feature work in hotfix branch
2. Skipping regression on touched paths
3. Structural rewrite without ADR
4. Deploy without rollback plan

---

## Dependencies

| Artifact | Relationship |
|----------|----------------|
| [incident-response.md](incident-response.md) | Often precedes |
| [rollback.md](rollback.md) | Required before deploy |
| [release.md](release.md) | Expedited deploy path |

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands** for fix implementation. **Claude**, **ChatGPT** for triage and documentation.

---

*Expedited does not mean skipping owner approval or regression on affected paths.*
