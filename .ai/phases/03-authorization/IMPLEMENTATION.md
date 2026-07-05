# Phase 3 — Authorization — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-06-30  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record what was built: modules, composition wiring, feature flags, and commit sequence.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Implementation planning starts (TASK_PROMPT active) |
| **Updated by** | Implementing AI assistant; maintainer on handoff |
| **Read-only when** | Phase gate PASS |
| **Roadmap relation** | Tracks milestone checkboxes in roadmap |

---

## Deliverables

| Area | Module / artifact | Status |
|------|-------------------|--------|
| Auth service | `AuthService` — provider chain + identity resolution | ✅ |
| API key provider | `resolveApiKey` — hash/compare via `identities` table | ✅ |
| Middleware | `auth.middleware.ts` — Fastify preHandler hook | ✅ |
| Identity repository | `IdentityRepository` — last_used tracking | ✅ |
| REST routes | `/api/v1/auth/*` — key management endpoints | ✅ |
| 401/403 E2E | Unauthorized routes rejected in regression suite | ✅ |
| MCP owner anchor | `MCP_OWNER_ID` documented for production MCP | ✅ |

---

## File map

```
src/auth/
  auth.service.ts
  auth.middleware.ts
  auth.types.ts
  identity.repository.ts
  providers/api-key.provider.ts
  events.ts                            auth audit events
src/controllers/auth.controller.ts
src/routes/v1/auth.routes.ts
tests/auth/
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `AUTH_SECRET` | required | Session/signing secret (min 32 chars) |
| `MCP_OWNER_ID` | optional | MCP process owner binding in prod |

---

## Invariants

- Never log raw API keys — hash/compare only
- Owner bound on identity — no header override spoofing
- Reuses Phase 1 `identities` schema — no new DDL

---

## Rollback

Disable auth plugin registration; schema unchanged


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
