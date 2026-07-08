---
id: P0-B-ENGINEERING-GOVERNANCE
phase: 04-proof-of-platform
status: Intent Draft — not started
owner: Ontorata
workload: Engineering Governance
baseline_tag: identity-foundation-p0-a-complete
baseline_commit: 2a57647
forge_branch: forge/engineering-governance
intent: engineering-governance-intent.md
updated: 2026-07-08
---

# P0-B Engineering Governance — Release Record

| Field | Value |
|-------|-------|
| **Milestone** | Engineering Governance (P0-B) |
| **Status** | ⏳ **READY TO OPEN** — blocked on P0-A remote sync |
| **Category** | Operational foundation (not feature development) |
| **Baseline** | `main` @ `2a57647` · tag `identity-foundation-p0-a-complete` |
| **Forge branch** | `forge/engineering-governance` |
| **Intent** | [engineering-governance-intent.md](../../designs/drafts/engineering-governance-intent.md) |

---

## Prerequisite gate

P0-A must reach **RELEASED** (not Local Release Candidate):

```bash
git push origin main --tags   # requires OAuth workflow scope
git ls-remote origin refs/tags/identity-foundation-p0-a-complete
```

Until verified on `origin`, P0-B waves do **not** start.

---

## Scope summary

| # | Area | Deliverable |
|---|------|-------------|
| 1 | ADR enforcement | ADR-0001–0004 + PR linkage rule |
| 2 | CI governance gate | test · test:identity · test:e2e · arch · migration · permission · docs |
| 3 | AI workflow governance | Implementation → evidence → review → commit |
| 4 | Release process | RELEASE-PROCESS · VERSIONING · CHANGELOG-POLICY |
| 5 | Migration governance | ownership · compat · rollback · verification |
| 6 | Repository constitution | ENGINEERING-PRINCIPLES · SECURITY-BOUNDARY · CHANGE-MANAGEMENT |

Detail: [engineering-governance-intent.md](../../designs/drafts/engineering-governance-intent.md)

---

## Acceptance gate (target)

| Gate | Status |
|------|--------|
| ADR system | ⏳ |
| CI governance | ⏳ |
| AI workflow governance | ⏳ |
| Release process | ⏳ |
| Migration policy | ⏳ |
| Repository constitution | ⏳ |
| Evidence artifact | ⏳ |

**Target tag (on completion):** `engineering-governance-p0-b-complete`

---

## Related

- [P0-A-IDENTITY-FOUNDATION.md](./P0-A-IDENTITY-FOUNDATION.md)
- [FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md](../../phases/04-proof-of-platform/FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md)
- Evidence (create on execute): `.ai/reviews/engineering-governance/`
