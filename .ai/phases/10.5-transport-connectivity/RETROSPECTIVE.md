# Phase 10.5 — Transport & Connectivity — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
---

## What went well

- Strangler re-exports (`src/server.ts`, `src/mcp/server.ts`) avoided breaking Vercel, tests, and MCP spawn paths.
- Shared handlers eliminated REST/MCP drift before gRPC was added.
- Dynamic import of `@grpc/grpc-js` keeps default bundle lean.
- Layer boundary lint test prevents future transport leaks into services.

---

## What to improve

- gRPC surface is minimal (Memory, Search, Context stream, Health) — Phase 13 should extend without duplicating ranking logic.
- MCP remains a separate process entrypoint (not in `startTransports`) — document clearly for operators.
- Full gRPC E2E client test deferred.

---

## Risks closed

| Risk | Mitigation |
|------|------------|
| REST/MCP drift | Shared handlers + parity suite |
| Over-abstraction | `ITransportServer` lifecycle only |
| gRPC on Vercel | Flag off + PANDUAN warning |
| Phase 11 delay | Parallel delivery; no Postgres changes |

---

## Recommendations

1. Phase 13: add SSE/WebSocket as new `ITransportServer` implementations — do not fork ContextService.
2. Phase 14 federation: reuse `TransportContext` metadata propagation.
3. Keep `@ai-brain/client` SDK external to repo per constitution.
