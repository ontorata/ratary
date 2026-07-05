# Phase 12 — Event Pipeline — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
---

## What went well

- Phase 10 `IEventBus` port was ready — consumers landed without new infrastructure adapters.
- Coordinator pattern mirrored evolution (9.7) with minimal MemoryService diff.
- Auditor decorator avoided ContextService contract changes.

## What to improve

- 12C request metadata (identity/IP) needs transport-layer audit context — defer to follow-up.
- Signal ingest → `memory.signal.received` bridge still open.
- Consider in-process bus for local dev without Redis (separate ADR if needed).

## Lessons

- Strict env validation (`EVENT_CONSUMERS_ENABLED` requires `redis`) prevents silent noop fan-out in production.
- Idempotency via `correlationId` as analytics primary key is sufficient for at-least-once.

---

*Phase 12 gate closed.*
