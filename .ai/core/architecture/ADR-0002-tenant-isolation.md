# ADR-0002 — Tenant Isolation

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — codifies P0-A Identity Foundation |
| **Date** | 2026-07-08 |
| **Baseline** | `identity-foundation-p0-a-complete` @ `2a57647` |
| **Related** | ADR-012 · ADR-0001 · P0-A Wave 1 |

---

## Context

Multi-tenant memory requires hard boundaries: **Organization A MUST NOT read, write, search, or aggregate Organization B data**, even when the same owner account exists in both (future multi-org owners).

ADR-012 mandates `owner_id` on customer data paths. P0-A extends isolation with explicit **organization** as tenant boundary via workspace binding.

---

## Decision

1. **Organization is the tenant boundary** for P0-A proof. Workspace MUST belong to exactly one organization (`organization_id` NOT NULL after migration/bind).
2. **Memory scope** resolves `ownerId` + `organizationId` + `workspaceId` for authenticated data-plane operations.
3. **Cross-org access MUST fail closed** — HTTP 403/404; MCP tools MUST NOT return cross-org rows.
4. **Header hints** (`X-Organization-Id`, `X-Workspace-Id`) MUST NOT bypass resolver invariants; mismatch between hint and workspace org MUST reject.
5. **Repository filters** enforce owner + workspace; workspace row implies organization chain.

**Invariant:**

```
Org A → MUST NOT see → Org B
```

**Primary implementation references:**

- `src/scope/workspace-store.ts` · `organization-store.ts`
- `src/scope/default-scope-resolver.ts`
- `tests/identity/organization-isolation.test.ts` · `tenant-isolation.rest.test.ts` · `tenant-permission-isolation.test.ts`

---

## Consequences

### Positive

- Enterprise proof path: org-scoped memory before external onboarding.
- Aligns with ADR-012 owner scoping plus org/workspace layering.

### Negative / tradeoffs

- Memories table may not carry denormalized `organization_id` — isolation via workspace→org chain (acceptable if tests prove no leakage).

### Non-goals

- Row-level security in SQL engine
- Cross-org shared workspaces
- Analytics aggregation across organizations

---

## Evidence

| Type | Location |
|------|----------|
| Tests | `tests/identity/organization-isolation.test.ts` · `workspace-boundary.test.ts` |
| Wave checkpoint | `.ai/governance/waves/WAVE-3-AUTHORIZATION.md` (tenant-before-permission) |
| Release | tag `identity-foundation-p0-a-complete` |

---

## Compliance

Changes to `src/scope/`, workspace/org stores, repository scope filters, or isolation tests require ADR amendment and `ci:adr-impact` pass.
