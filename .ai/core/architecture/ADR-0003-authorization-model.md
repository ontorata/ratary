# ADR-0003 — Authorization Model

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — codifies P0-A Wave 3 |
| **Date** | 2026-07-08 |
| **Baseline** | `identity-wave-3-locked` @ `e96330b` |
| **Related** | ADR-0001 · ADR-0002 · P0-A Wave 3 |

---

## Context

Authentication and tenant resolution alone do not protect write paths. Permissions must be **evaluated explicitly** after tenant context is attached — not inferred from transport or route convenience.

---

## Decision

1. **Order is mandatory:** Authentication → Tenant Context → Permission Evaluation → Resource Access.
2. **Permission contract** uses exactly these canonical strings (no aliases):

   | Permission | Typical use |
   |------------|-------------|
   | `memory.read` | Read memory, search, GET data-plane |
   | `memory.write` | Write, ingest, delete memory |
   | `workspace.read` | List/read workspaces |
   | `workspace.manage` | Create/update workspaces |
   | `organization.manage` | Create/list organizations |

3. **Single source of truth:** `src/auth/permission-context.ts` (`PERMISSIONS` constant). Changes require governance signal (see `ci:permission-contract` in Wave 2).
4. **Shared authorization service:** `src/auth/authorization-boundary.ts` coordinates tenant resolution + permission assertion for REST middleware and MCP remote handlers.
5. **Data-plane classification** (`isDataPlanePath`) determines when tenant + permission gates apply.

**Forbidden:**

- Granting write access because request arrived on MCP vs REST
- Skipping permission middleware on authenticated protected routes
- Introducing duplicate permission string literals outside the contract

---

## Consequences

### Positive

- Auditable permission decisions with optional audit sink hook.
- Wave 4 transport parity builds on one authorization boundary.

### Negative / tradeoffs

- No separate admin permission namespace in P0-A — org/workspace admin uses `memory.write` / manage permissions.

### Non-goals

- Enterprise RBAC matrix (`ENTERPRISE_RBAC`)
- Permission UI in Studio
- Role storage per tenant

---

## Evidence

| Type | Location |
|------|----------|
| Implementation | `src/auth/authorization-boundary.ts` · `permission.middleware.ts` |
| Tests | `tests/identity/permission-enforcement.test.ts` · `authorization-boundary.test.ts` |
| Wave checkpoint | `.ai/governance/waves/WAVE-3-AUTHORIZATION.md` |
| Lock tag | `identity-wave-3-locked` |

---

## Compliance

Changes to permission strings, evaluation order, middleware wiring, or `authorization-boundary.ts` require ADR amendment and `ci:adr-impact` pass.
