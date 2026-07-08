# Security Boundary Constitution

| Field | Value |
|-------|-------|
| **Status** | Canonical — P0-B Wave 6 |
| **Authority** | [ENGINEERING-CONSTITUTION.md](../ENGINEERING-CONSTITUTION.md) |
| **Supersedes** | Ad-hoc security assumptions |
| **Owner** | Engineering |
| **Updated** | 2026-07-08 |

---

## Role

This document defines the **non-negotiable security boundaries** for every Ontorata product. These rules exist because one tenant isolation breach invalidates the trust of every customer.

For principles → [ENGINEERING-PRINCIPLES.md](./ENGINEERING-PRINCIPLES.md)  
For change rules → [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md)  
For enforcement → `npm run ci:governance` · `npm run test:identity` · `npm run ci:permission-contract`

---

## Security first principle

> **Security over convenience.** Every feature, deadline, or convenience trade-off that weakens a security boundary must be rejected. The cost of a breach compounds over years; the cost of doing it right once is finite.

---

## Identity boundary (P0-A — permanent)

### Authentication layer

```
User credential
    │
    ├── Auth Service → JWT / session token
    │                        │
    │                        └── Ratary / Studio / Auth
    └── Token carries: owner_id · organizationId · workspaceId
```

| Rule | Requirement |
|------|-------------|
| Credential boundary | Auth owns authentication — not application code |
| Token contents | Must include `owner_id` · `organizationId` · `workspaceId` |
| Token validation | Every API call, every transport, every environment |
| Token lifetime | Short-lived; refresh mechanism required |

### Authorization chain

```
Authentication (who)
    │
    └── Tenant Context (owner_id · organizationId · workspaceId)
            │
            └── Permission Evaluation (can they?)
                    │
                    └── Resource Access (data-plane)
```

**Rule:** Authorization happens after authentication, inside the tenant context, before data-plane access. Never before tenant context is established.

---

## Tenant isolation boundary (P0-A — permanent)

### Hard rule

**Org A's data must never touch Org B's data. `owner_id` is not optional.**

### Data-plane isolation model

```
Organization A
    └── workspaceId: ws_A
            └── owner_id: u_A
                    └── resource access: only records where owner_id = u_A

Organization B
    └── workspaceId: ws_B
            └── owner_id: u_B
                    └── resource access: only records where owner_id = u_B
```

| Rule | Requirement |
|------|-------------|
| `owner_id` mandatory | Every data record · every write path · every query |
| Organization boundary | Hard security perimeter — not optimizable |
| Cross-tenant access | Requires explicit privilege escalation + ADR |
| Audit events | Every write must include `owner_id` in audit log |

### Isolation enforcement

| Layer | Mechanism |
|-------|-----------|
| Data model | `owner_id` required on every entity |
| Query layer | Automatic tenant scope on every query |
| API layer | Tenant context validated before data-plane call |
| Audit | `owner_id` in every audit event |

**Enforcement:** `npm run test:identity` — tenant isolation tests must always pass.

---

## Permission contract (locked)

### Permission strings

All permission strings are locked. Changes require:

1. ADR proposing the change
2. Engineering owner approval
3. `npm run ci:permission-contract` update
4. Migration evidence for production deployment

**Locked permissions:**

| Permission | Scope | Changeable? |
|------------|-------|-------------|
| `memory.read` | Read owned memory | No ADR only |
| `memory.write` | Write owned memory | No ADR only |
| `workspace.read` | Read workspace metadata | No ADR only |
| `workspace.manage` | Manage workspace resources | No ADR only |
| `organization.manage` | Organization administration | No ADR only |

**Source of truth:** [PERMISSION-CONTRACT.md](../../core/governance/PERMISSION-CONTRACT.md)

### Permission evaluation

```
Request
    │
    ├── Extract: owner_id · organizationId · workspaceId
    │              │
    │              └── From token (not from request body)
    │
    ├── Validate: permission string exists in contract
    │
    └── Evaluate: owner owns resource?
            ├── Yes → allow
            └── No  → deny
```

---

## Transport boundary

### Core rule

**Transport does not define authorization.**

| Transport | Authorization |
|-----------|--------------|
| REST | Same permission boundary as any other |
| MCP remote | Same permission boundary — transport is an implementation detail |
| WebSocket | Same permission boundary |
| Any future transport | Same permission boundary |

```
REST ──┐
MCP ───┼──→ Same Authorization Boundary ──→ Data Plane
WS ────┘
```

**Why:** Authorization must not depend on how data is transmitted. A REST call and an MCP call to the same resource must evaluate the same permissions.

**Enforcement:** ADR-0004 · `npm run ci:adr-impact` (transport path changes trigger ADR requirement)

---

## Auth at boundary rule

**Authentication and authorization live at the system boundary, not inside the data plane.**

```
External Request
    │
    └── Boundary (Auth Service)
            ├── Authenticate: validate credential
            ├── Authorize: evaluate permission against tenant context
            │
            └── Pass tenant context forward — do not re-evaluate inside data plane
```

| Pattern | Allowed? |
|---------|---------|
| Auth at boundary + tenant context forward | ✅ |
| Auth at boundary + re-evaluate inside data plane | ❌ |
| Auth inside data plane | ❌ |
| No auth (trust internal network) | ❌ |

---

## Security non-negotiable checklist

Before any merge on auth · tenant · permission · data-plane paths:

- [ ] `owner_id` present and enforced on every data path
- [ ] `organizationId` enforced before data access
- [ ] Permission evaluation happens at boundary, not inside data plane
- [ ] Transport type does not change authorization outcome
- [ ] `npm run test:identity` passes — 0 regressions
- [ ] `npm run ci:permission-contract` passes
- [ ] ADR exists for any auth · tenant · permission change
- [ ] Migration evidence prepared (if schema / data path changes)

---

## Related

- [ENGINEERING-CONSTITUTION.md](./ENGINEERING-CONSTITUTION.md)
- [ENGINEERING-PRINCIPLES.md](./ENGINEERING-PRINCIPLES.md)
- [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md)
- [PERMISSION-CONTRACT.md](../../core/governance/PERMISSION-CONTRACT.md)
- [ADR-0001-identity-boundary.md](../../core/architecture/ADR-0001-identity-boundary.md)
- [ADR-0002-tenant-isolation.md](../../core/architecture/ADR-0002-tenant-isolation.md)
- [ADR-0003-authorization-model.md](../../core/architecture/ADR-0003-authorization-model.md)
- [ADR-0004-transport-parity.md](../../core/architecture/ADR-0004-transport-parity.md)
