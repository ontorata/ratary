# Engineering Principles

| Field | Value |
|-------|-------|
| **Status** | Canonical — P0-B Wave 6 |
| **Authority** | [ENGINEERING-CONSTITUTION.md](../ENGINEERING-CONSTITUTION.md) |
| **Supersedes** | Undocumented engineering conventions |
| **Owner** | Engineering |
| **Updated** | 2026-07-08 |

---

## Role

This document codifies the **non-negotiable engineering principles** that every engineer, AI agent, and reviewer must uphold. Principles are rules — not suggestions.

For implementation patterns → [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md)  
For security rules → [SECURITY-BOUNDARY.md](./SECURITY-BOUNDARY.md)  
For enforcement → `npm run ci:governance` · [CI-GOVERNANCE-MODEL.md](../../governance/ci/CI-GOVERNANCE-MODEL.md)

---

## Core principles

### P1 — Security over convenience

**Rule:** No feature, deadline, or convenience justifies a security trade-off.

- Least privilege on every permission
- Auth at every boundary, not inside the data plane
- Tenant isolation is mandatory — never optimizable
- Secrets never in source code
- Transport layer does not define authorization

**Why:** Once a security boundary is weakened, it is never fully restored. Evidence shows breach costs compound over years.

**Enforcement:** ADR-0003 · `npm run ci:permission-contract` · [SECURITY-BOUNDARY.md](./SECURITY-BOUNDARY.md)

---

### P2 — Documentation is engineering output

**Rule:** Code without documentation is incomplete. Evidence without artifact is invisible.

- Every significant feature ships with architecture, API, configuration, and upgrade docs
- Migration changes require evidence template — before and after state
- Implementation is not completion — completion requires documentation
- `.ai/` and `docs/` are git-tracked source of truth for governance

**Why:** Future engineers (and AI agents) must not reverse-engineer intent from code.

**Enforcement:** `npm run ci:docs-impact` (fail mode) · [CHANGELOG-POLICY.md](../../governance/releases/CHANGELOG-POLICY.md)

---

### P3 — Evidence before completion

**Rule:** Completion means evidence package + metrics + audit trail + evaluation. Merge is not done.

- Feature ≠ Capability — shipping code does not declare a platform capability
- Implementation ≠ Completion — merge is not Done without Ratary sync
- Internal Proof Before Public Capability — no external GA without internal production evidence

**Why:** Without evidence, there is no proof. Without proof, there is no trust. Without trust, there is no scale.

**Enforcement:** [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) · `.ai/reviews/` · [RELEASE-PROCESS.md](../../governance/releases/RELEASE-PROCESS.md)

---

### P4 — Tenant isolation is mandatory

**Rule:** Org A's data must never touch Org B's data. `owner_id` is not optional.

- Every data path must carry and enforce `owner_id`
- Organization boundary is the hard security perimeter
- Audit events must include `owner_id` on every write
- Cross-tenant data access requires explicit privilege escalation with ADR

**Why:** Multi-tenant SaaS lives or dies by its isolation boundary. A single violation invalidates the trust of every customer.

**Enforcement:** `npm run test:identity` · ADR-0002 · ADR-0012

---

### P5 — Change requires architecture record

**Rule:** Significant architectural changes require an ADR before or alongside implementation.

- ADR for: auth, tenant, permission, transport, data boundary, cross-product API
- No ADR → no merge on architecture paths
- ADR is immutable once accepted — deprecate and supersede, never amend

**Why:** Without a written decision record, every future engineer repeats the same debate.

**Enforcement:** `npm run ci:adr-impact` · [ARCHITECTURE-CHANGE-MAP.md](../../core/governance/ARCHITECTURE-CHANGE-MAP.md) · [CHANGE-GATING.md](../../core/governance/CHANGE-GATING.md)

---

## Non-principles (what principles are NOT)

| Misconception | Reality |
|---------------|---------|
| "If it works, it's done" | Implementation ≠ Completion |
| "Write the docs later" | Docs are part of the PR — not after |
| "Tests are optional" | Tests are evidence — not optional |
| "It's fine for now" | Technical debt compounds; address before it spreads |
| "AI wrote it, so it's correct" | AI assists — humans own the output |

---

## Decision hierarchy

```
Constitution (this document — highest authority)
    │
    ├── ENGINEERING-PRINCIPLES.md  (P1–P5)
    ├── SECURITY-BOUNDARY.md       (P1 + P4 specifics)
    └── CHANGE-MANAGEMENT.md      (P5 specifics)
            │
            ├── ADR (why — immutable once accepted)
            ├── Blueprint (how — mutable)
            └── Implementation (evidence)
```

---

## Related

- [ENGINEERING-CONSTITUTION.md](./ENGINEERING-CONSTITUTION.md)
- [SECURITY-BOUNDARY.md](./SECURITY-BOUNDARY.md)
- [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md)
- [CI-GOVERNANCE-MODEL.md](../../governance/ci/CI-GOVERNANCE-MODEL.md)
- [RELEASE-PROCESS.md](../../governance/releases/RELEASE-PROCESS.md)
