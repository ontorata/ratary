---
id: IDENTITY-FOUNDATION
phase: 04-proof-of-platform
stage: forge-intent
status: Approved
owner: Ontorata
workload: Engineering Governance
evidence_package: identity-foundation
constitution:
  - Internal Proof Before Public Capability
dependencies:
  - EXECUTION-CONTRACT
updated: 2026-07-08
---

# Identity Foundation — Forge Intent

| Field | Value |
|-------|-------|
| **Status** | **Approved** — owner direction locked 2026-07-08 |
| **Slug** | `identity-foundation` |
| **Phase** | 4 — Proof of Platform |
| **Category** | Must Enable |
| **Constitution** | Internal Proof Before Public Capability |
| **Evidence package** | `.ai/reviews/identity-foundation/` |

Parent contract: [EXECUTION-CONTRACT.md](../../phases/04-proof-of-platform/EXECUTION-CONTRACT.md)

---

## Problem

Ratary, Studio, MCP, workloads, and organizational memory all depend on a single trust boundary: **who owns what, in which organization and workspace, with which permissions**.

Partial implementation exists (`AuthUser`, `DefaultScopeResolver`, `organizations`, `workspaces`) but end-to-end proof is missing. Without a locked identity foundation, the first production workload and dogfood loop risk rework.

---

## Objective

**Identity Foundation becomes the trust boundary of the entire platform.**

Every authenticated path — REST, MCP, Memory, Search, Metrics, Studio — must resolve and enforce the same tenant context.

---

## Constraints (constitution / ADR)

| Constraint | Source |
|------------|--------|
| Authentication identity ≠ AI identity | Constitution · ADR-007 |
| Tenant isolation | ADR-012 |
| Auth at boundary; data plane owns `owner_id` / workspace | ADR-006 |
| Internal Proof Before Public Capability | Constitution (2026-07-08) |
| Evidence package before milestone complete | Phase 4 EXECUTION-CONTRACT |

---

## Decision

Implement and **prove** Identity Foundation as P0-A before Engineering Governance workload (P0-B).

Execution order after this intent:

```
forge-isolate → forge-blueprint → forge-execute → forge-prove → evidence package → forge-land
```

No new ADR required unless acceptance tests reveal a semantic gap — then file ADR before merge.

---

## Success criteria (objective)

### Organization

| # | Criterion | Pass condition |
|---|-----------|----------------|
| O1 | Organization can be created | API or bootstrap path creates org with stable `id` |
| O2 | Organization has owner | Every org row has valid `owner_id` |
| O3 | Organization resolvable from request | Scope resolver returns `organizationId` for authenticated requests |

### Workspace

| # | Criterion | Pass condition |
|---|-----------|----------------|
| W1 | Workspace under organization | Every workspace has non-null `organization_id` (no orphan workspaces) |
| W2 | Multi-workspace validated | Create second workspace; list + resolve by id/slug |
| W3 | Default workspace policy | Lazy default still works but is bound to org |

### Identity (every request)

| # | Criterion | Pass condition |
|---|-----------|----------------|
| I1 | Identity present | Unauthenticated protected paths rejected |
| I2 | Owner resolved | `AuthUser.ownerId` set on all authenticated paths |
| I3 | Organization resolved | `MemoryScope.organizationId` set |
| I4 | Workspace resolved | `MemoryScope.workspaceId` set |
| I5 | Permissions resolved | `AuthUser.permissions` enforced on write paths |
| I6 | Session / token path | Studio → Auth → Ratary path documented and tested |

### Authorization (same context everywhere)

| Surface | Read | Write | Search | Memory | MCP | REST | Studio |
|---------|------|-------|--------|--------|-----|------|--------|
| Context | owner · org · workspace · permissions | same | same | same | same | same | same |

Pass: automated tests demonstrate identical scope resolution across at least REST + MCP + one memory write/read path.

### Tenant isolation (must never happen)

```
Org A → must NOT see → Org B
```

| Vector | Test required |
|--------|---------------|
| REST | Cross-org memory/API access returns 404 or 403 |
| MCP | `search_memory` / `save_memory` scoped; no cross-org leakage |
| Memory | SQL queries filter by scope invariants |
| Search | Results never cross organization boundary |
| Metrics | Usage records scoped to org; no cross-org aggregation leak |

---

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Ship workload first, fix identity later | Violates trust sequence; rework risk |
| Owner-only scope (skip org) | Insufficient for enterprise proof and ADR-012 |
| Separate scope per surface (REST vs MCP) | Already partially exists; goal is unify, not split |

---

## Impact (layers, ports, tests)

| Layer | Expected touch |
|-------|----------------|
| `src/auth/` | Middleware, permission enforcement |
| `src/scope/` | Resolver, workspace store, org binding |
| `src/infrastructure/enterprise/` | Organization store adapters |
| `schema.sql` / migrations | Org-workspace invariants |
| Tests | New integration suite: `identity-foundation.e2e` or ADR-012 isolation tests |
| Docs | Evidence package `.ai/reviews/identity-foundation/` |
| Studio / Auth | E2E path validation (may span repos) |

---

## Evidence deliverables

On completion, fill:

```
.ai/reviews/identity-foundation/
├── architecture-review.md
├── acceptance-test.md
├── e2e-proof.md
├── metrics.md
├── known-limitations.md
└── decision.md
```

---

## Open questions

| # | Question | Default if unresolved |
|---|----------|-------------------------|
| 1 | First production org slug (`ontorata`)? | Use slug `ontorata` for internal org |
| 2 | Backfill existing owners without org? | Run organization backfill; bind default workspace |
| 3 | Studio session → workspace hint | Default workspace until Studio sends explicit workspace |

---

## Related

- [FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md](../../phases/04-proof-of-platform/FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md) — blocked until P0-A passes
- [ENGINEERING-CONSTITUTION.md](../../core/constitution/ENGINEERING-CONSTITUTION.md) — Internal Proof Before Public Capability
