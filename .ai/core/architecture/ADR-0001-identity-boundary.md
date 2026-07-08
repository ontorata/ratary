# ADR-0001 — Identity Boundary

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — codifies P0-A Identity Foundation |
| **Date** | 2026-07-08 |
| **Baseline** | `identity-foundation-p0-a-complete` @ `2a57647` |
| **Related** | ADR-006 · ADR-007 · P0-A Wave 1–2 |

---

## Context

Ratary serves REST, MCP, Studio, and organizational memory. Every protected operation must answer: **who is the authenticated identity, who owns the data, and in which organization/workspace does the request execute?**

Partial identity scaffolding existed before P0-A. Without a locked identity boundary, tenant isolation and authorization cannot be proven.

---

## Decision

1. **Authentication boundary** resolves `AuthUser` with stable `ownerId`, `identityId`, `identityType`, and `permissions[]`.
2. **Authentication identity ≠ AI identity** (Ontory persona is separate from auth subject — see ADR-007).
3. **Tenant context** (`organizationId`, `workspaceId`) is resolved **after** authentication and **before** permission evaluation on all data-plane paths.
4. **Bootstrap paths** (register, login, public health) are exempt from full tenant scope; **data-plane paths** require resolved tenant context — bootstrap is not a substitute for tenant headers on data-plane.
5. **Default organization/workspace** may be created lazily but every workspace row MUST bind to an organization after P0-A.

**Canonical flow:**

```
Authentication → Tenant Context → Permission Evaluation → Resource Access
```

**Primary implementation references:**

- `src/auth/auth.middleware.ts`
- `src/auth/tenant-context.ts` · `tenant-context.middleware.ts`
- `src/scope/default-scope-resolver.ts`
- `src/transport/shared/resolve-transport-scope.ts`

---

## Consequences

### Positive

- Single identity model for REST and MCP remote authenticated paths.
- Studio can propagate org/workspace via headers without separate auth semantics.

### Negative / tradeoffs

- Lazy default org creation adds migration/backfill complexity.
- MCP stdio remains env-bootstrap (documented non-goal — not part of this ADR's proof surface).

### Non-goals

- SSO / OIDC org claim sync
- Per-user User table as first-class tenant actor
- Marketplace identity federation

---

## Evidence

| Type | Location |
|------|----------|
| Forge intent | `.ai/designs/drafts/identity-foundation-intent.md` |
| Tests | `tests/identity/auth-context.integration.test.ts` · `scope-resolver.test.ts` |
| Release | tag `identity-foundation-p0-a-complete` |

---

## Compliance

Changes to `src/auth/` identity resolution, scope hints, or auth middleware order require ADR amendment and `ci:adr-impact` pass.
