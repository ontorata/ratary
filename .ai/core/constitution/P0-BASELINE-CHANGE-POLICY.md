# P0 Baseline Change Policy

| Field | Value |
|-------|-------|
| **Status** | Canonical — constitutional |
| **Authority** | [ENGINEERING-CONSTITUTION.md](./ENGINEERING-CONSTITUTION.md) |
| **Owner** | Engineering |
| **Updated** | 2026-07-08 |
| **Effective after** | P0-A and P0-B both **RELEASED** on `origin` |

---

## Role

This document defines what the **P0 Platform Foundation** is, why it is **frozen** after release, and which changes are permitted without opening a new governance milestone.

It does **not** replace [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md). It clarifies a constitutional boundary that Forge-Land practice already enforced.

---

## What is the P0 Baseline?

The P0 Platform Foundation consists of two released milestones:

| Milestone | Baseline tag | Domain |
|-----------|--------------|--------|
| **P0-A** Identity Foundation | `identity-foundation-p0-a-complete` | Identity · organization · tenant boundary · authorization · transport parity |
| **P0-B** Engineering Governance | `engineering-governance-p0-b-complete` | ADR enforcement · constitution · CI governance · migration governance · release governance · AI workflow |

Together they answer:

> **"Is the platform built correctly?"**

Release records: [.ai/governance/releases/P0-A-IDENTITY-FOUNDATION.md](../../governance/releases/P0-A-IDENTITY-FOUNDATION.md) · [P0-B-ENGINEERING-GOVERNANCE.md](../../governance/releases/P0-B-ENGINEERING-GOVERNANCE.md)

---

## Frozen after RELEASED

When a P0 milestone reaches **RELEASED on origin** (merge to `main` + tag verified + release record updated):

1. The milestone becomes an **immutable baseline reference** for audit and traceability.
2. Wave lock tags and release tags **must not be moved or force-updated**.
3. **Feature development on P0 is prohibited** — new product capability belongs to P1+ milestones.

**Frozen ≠ abandoned.** Frozen means changes require an explicit exception class below, not ad-hoc edits.

---

## Permitted changes on P0 (exception classes)

| Class | Description | Evidence required |
|-------|-------------|-------------------|
| **Critical bug fix** | Production or CI breakage; data integrity or isolation failure | Fix + test + minimal doc sync |
| **Security patch** | Vulnerability or boundary violation | Fix + test + security note; ADR if boundary semantics change |
| **Compatibility patch** | Runtime/toolchain compatibility (Node, driver, CI runner) without behavior change | Fix + CI green + changelog note |
| **Governance milestone** | Intentional evolution of P0 scope via **new ADR** and a **new governance milestone** (e.g. P0-C) | ADR · intent · blueprint · evidence · release record |

Every permitted change must still pass:

- `npm run ci:governance` (or equivalent CI gate on `main`)
- Documentation Impact Check per [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md)
- ADR impact check when architecture-boundary paths change

---

## Prohibited on P0

| Prohibited | Route instead |
|------------|---------------|
| New product features | P1+ milestone (e.g. P1-A Org Memory Dogfood) |
| Scope expansion disguised as "small fix" | New milestone or ADR |
| Direct edits to locked wave evidence to rewrite history | Addendum + new evidence; do not rewrite locked proofs |
| Bypassing CI or release process | [RELEASE-PROCESS.md](../../governance/releases/RELEASE-PROCESS.md) |

---

## Feature development belongs to P1+

From P1 onward the success question changes:

| Phase | Question |
|-------|----------|
| **P0** | Is the platform **built** correctly? |
| **P1** | Is the platform **useful** for daily work? |
| **P2** | Can the platform **scale**? |
| **P3** | Can the platform **open** to external ecosystems? |

All new capability — org memory, ingestion, retrieval, AI workspace, Ontory, MCP integrations — is implemented **on top of** the P0 baseline, not by mutating it.

---

## Decision flow

```
Change proposed
        │
        ├── Touches P0-A or P0-B released scope?
        │         │
        │         ├── No → normal CHANGE-MANAGEMENT lifecycle
        │         │
        │         └── Yes → classify exception
        │                   │
        │                   ├── Critical bug / security / compatibility → minimal fix path
        │                   │
        │                   ├── Feature or expansion → STOP → new P1+ milestone
        │                   │
        │                   └── Governance evolution → new ADR + milestone (e.g. P0-C)
        │
        └── Merge only with CI green + doc sync + evidence when required
```

---

## Verification

```bash
git ls-remote origin refs/tags/identity-foundation-p0-a-complete
git ls-remote origin refs/tags/engineering-governance-p0-b-complete
git ls-remote origin refs/heads/main
```

---

## Related

- [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md)
- [ENGINEERING-PRINCIPLES.md](./ENGINEERING-PRINCIPLES.md) — P5 Architecture before implementation
- [RELEASE-PROCESS.md](../../governance/releases/RELEASE-PROCESS.md)
- P1-A intent: [org-memory-dogfood-intent.md](../../designs/drafts/org-memory-dogfood-intent.md)
