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
| 13G | SSE connection guard + per-IP rate limits | ✅ 2026-07-05 |

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
    sse-connection-guard.ts
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
| `SSE_MAX_CONCURRENT_PER_IP` | `10` | Max open SSE streams per client IP |
| `SSE_STREAM_RATE_LIMIT_MAX` | `30` | New SSE stream attempts per IP per window |
| `SSE_STREAM_RATE_LIMIT_WINDOW` | `1 minute` | Rate limit window for new SSE streams |
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

---

## Operations — SSE connection limits

Long-lived SSE streams can exhaust file descriptors or worker threads if clients open unbounded connections.

**Defaults (tunable via env):**

| Control | Default | Env |
|---------|---------|-----|
| Concurrent streams per IP | 10 | `SSE_MAX_CONCURRENT_PER_IP` |
| New stream attempts per IP | 30 / minute | `SSE_STREAM_RATE_LIMIT_MAX`, `SSE_STREAM_RATE_LIMIT_WINDOW` |

**HTTP 429** when concurrent cap exceeded (`SSE_CONNECTION_LIMIT`). Route-level rate limit applies to new stream requests.

**Production guidance:**

- Run SSE on a **long-running Node host** (Railway, Fly, VPS) — not Vercel serverless.
- Set `RATE_LIMIT_REDIS_URL` so per-IP counters survive multi-instance restarts.
- Size `SSE_MAX_CONCURRENT_PER_IP` × expected clients below process `ulimit -n`.
- Prefer unary `POST /api/v1/context` for batch clients; reserve SSE for browser streaming UX.
- Monitor `ratary_http_requests_total{route="sse"}` (Phase 19) for stream volume.

Implementation: `src/transport/sse/sse-connection-guard.ts`, `@fastify/rate-limit` on `/context/stream`.
