# Phase 13 — Protocol Layer — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-028 Implemented](../../adr/028-protocol-layer.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 13A | Streaming ports (`IStreamPublisher`, `IContextStreamSource`, `ContextChunk`) | ✅ |
| 13A | `context.streamContext` handler + `DefaultContextStreamSource` | ✅ |
| 13B | SSE `GET /api/v1/context/stream` when `SSE_ENABLED=true` | ✅ |
| 13C | WebSocket `WEBSOCKET_PATH` when `WEBSOCKET_ENABLED=true` | ✅ |
| 13D | gRPC stream uses shared `chunksFromBuildContextResult` | ✅ |
| 13E | `npm run benchmark:protocols` CLI + report schema | ✅ |
| 13F | Manifest transport extensions + docs | ✅ |

---

## File map

```
src/transport/
  shared/streaming/
    context-chunk.types.ts
    istream-publisher.interface.ts
    icontext-stream-source.interface.ts
    default-context-stream-source.ts
    stream-context-chunks.ts
  shared/handlers/context.handlers.ts   (+ streamContext)
  sse/
    sse-stream-publisher.ts
    register-sse-routes.ts
  websocket/
    ws-message.envelope.ts
    ws-router.ts
    websocket-transport-server.ts
  benchmark/
    protocol-benchmark.runner.ts
    protocol-benchmark.report.ts
scripts/benchmark-protocols.ts
tests/transport/context-stream.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `SSE_ENABLED` | `false` | Mount `GET /api/v1/context/stream` |
| `WEBSOCKET_ENABLED` | `false` | Attach WS upgrade on Fastify HTTP server |
| `WEBSOCKET_PATH` | `/api/v1/ws` | WebSocket endpoint path |

Existing `GRPC_ENABLED` unchanged — gRPC context server-stream now shares chunk helper.

---

## Wiring

- `buildApp()` creates `transportHandlers` once; decorates Fastify instance
- SSE routes registered inside `/api/v1` prefix when `SSE_ENABLED`
- WebSocket server starts on `onReady` hook when `WEBSOCKET_ENABLED`
- gRPC unchanged in `startTransports()` — dynamic import when flag on

---

## Invariants

- No business logic in protocol adapters
- `MemoryService` / repositories unchanged
- REST unary routes unchanged
- MCP stdio unchanged
- All new protocols default OFF

---

## Rollback

Set `SSE_ENABLED=false`, `WEBSOCKET_ENABLED=false` — unary REST/MCP only.
