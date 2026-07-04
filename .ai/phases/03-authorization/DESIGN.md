# Phase 3 — Authorization — DESIGN

**Phase status:** Closed  
**Gate:** PASS 2026-06-30  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Secure REST API with API-key authentication bound to owner identity. Fail closed on missing/invalid credentials. MCP process anchored via `MCP_OWNER_ID`.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Design phase begins — before implementation commits |
| **Updated by** | AI assistant drafts; owner approves; ADR author if structural |
| **Read-only when** | Phase gate PASS — frozen as historical design record |
| **Roadmap relation** | Captures scope and architecture evolution row |

---

## Architecture

```
HTTP Request
    │
    ▼
auth.middleware (Fastify preHandler)
    │
    ▼
AuthService → IdentityProvider chain → IdentityRepository
    │
    ▼
AuthUser { ownerId, identityId, clientId } → handlers
```

---

## Boundaries

- Reuses Phase 1 `identities` schema — no new DDL
- Never log raw API keys — hash/compare only via `secret_hash`
- Owner bound on identity — no header override for owner_id spoofing
- 401 on missing auth; 403 on insufficient scope (future RBAC hooks)

## Ports & modules

| Port / module | Responsibility |
|---------------|----------------|
| `AuthService` | Provider chain; updates last_used on success |
| `IdentityProvider` | Pluggable auth (API key MVP) |
| `IdentityRepository` | CRUD on Phase 1 `identities` table |

---

## Non-goals

- OAuth / OIDC / SSO (Phases 17, 13.1)
- Workspace-scoped RBAC (Phase 9–10)
- OPA policy engine (Phase 17)


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
