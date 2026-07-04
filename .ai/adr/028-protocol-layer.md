# ADR-028: Protocol Layer — Multi-Protocol Streaming & Benchmark (Phase 13)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 10.5 (Transport & Connectivity, ADR-027 Proposed) formalizes REST, MCP, and optional gRPC behind shared application handlers and `TransportContext`. Constitution §17 requires transport/protocol as outer adapters; services must remain protocol-agnostic.

Enterprise and real-time consumers need:

- **Server-sent context streaming** (SSE for browsers, gRPC stream for backends)
- **WebSocket** for bidirectional subscriptions (memory updates, Phase 12 events)
- **Protocol comparison** (latency, throughput, token delivery) without guessing

Phase 12 event pipeline provides domain events suitable for push protocols. Phase 13 completes the **protocol surface** without touching `MemoryService` business rules or repository contracts.

## Problem

1. **REST-only streaming gap** — `POST /context` is unary; LLM clients benefit from chunked delivery.
2. **No WebSocket/SSE adapters** — browser and live-dashboard integrations require push protocols.
3. **Protocol drift** — without a shared handler + benchmark harness, REST/gRPC/WS/SSE may diverge.
4. **Layer violations risk** — ad hoc streaming in controllers leaks Fastify/ws types inward.
5. **Roadmap collision** — POST-ROADMAP Phase 13 was "Content Scale"; protocol work is orthogonal → renumber Content Scale to Phase 15.

## Constraints

- **Same MemoryService** for all protocols — one behavioral path.
- Repository MUST NOT import or branch on protocol types.
- Controllers/handlers MUST NOT import storage SDKs or repositories directly.
- Services MUST NOT import Fastify, gRPC, WebSocket, or SSE libraries.
- REST `/api/v1` response shapes unchanged for existing unary endpoints.
- MCP stdio tool schemas unchanged.
- All new protocols **opt-in** via env flags; default deploy unchanged.
- Protocol benchmark is **observability tooling** — not on CRUD hot path.
- No agent runtime in repo.

## Alternatives

### Option A — Phase 13 Protocol Layer module (`src/protocol/`) extending 10.5 transport (recommended)

- Pros: Clean separation; streaming ports; benchmark isolated; builds on 10.5 handlers.
- Cons: Requires 10.5 foundation first (or combined gate).

### Option B — Streaming only inside REST (SSE route on Fastify)

- Pros: Minimal new surface.
- Cons: No WebSocket/gRPC parity; benchmark incomplete; violates "protocol agnostic" goal.

### Option C — Merge into Phase 10.5

- Pros: Single phase.
- Cons: Scope too large; delays 10.5 structural migration; mixes foundation with streaming.

### Option D — GraphQL subscriptions

- Pros: Unified query + subscription.
- Cons: Speculative; new resolver layer; deferred.

## Decision

**Adopt Option A — Phase 13 Protocol Layer:**

1. Introduce `src/protocol/` as canonical **protocol adapter** root (extends `src/transport/` from 10.5 or renames to `protocol/` with backward re-exports).
2. Sub-adapters: `rest/`, `grpc/`, `websocket/`, `sse/`, `mcp/` (MCP remains from 10.5).
3. Shared **`ProtocolContext`** (alias/evolution of `TransportContext`) + **`IUseCaseHandler`** — sole entry to application services.
4. Introduce **`IStreamPublisher`** port at protocol boundary for chunked context delivery — implemented per protocol, consumes **`IContextStreamSource`** from application layer (thin iterator over `ContextService` output, not reimplemented ranking).
5. Add **Protocol Benchmark** CLI (`npm run benchmark:protocols`) — measures unary + stream paths; no production dependency.
6. Extend capability manifest with `protocols` block (streaming support, WS/SSE/gRPC flags).
7. Renumber former Phase 13 Content Scale → **Phase 15**.

**Env flags (all default OFF except REST/MCP):**

| Flag | Default | Protocol |
|------|---------|----------|
| `GRPC_ENABLED` | `false` | gRPC |
| `WEBSOCKET_ENABLED` | `false` | WebSocket |
| `SSE_ENABLED` | `false` | SSE |
| `PROTOCOL_BENCHMARK_ENABLED` | n/a | CLI only |

## Tradeoffs

- **Gain:** Full streaming stack; measurable protocol choice; Clean Architecture preserved.
- **Accept:** Phase 15 renumber requires roadmap doc update.
- **Accept:** WebSocket/SSE not on Vercel serverless default — long-running Node documented.
- **Defer:** GraphQL; MCP HTTP transport (separate ADR).

## Migration

| Track | Action | Impact |
|-------|--------|--------|
| 13A | `IStreamPublisher` + context stream source port | None at default env |
| 13B | SSE adapter (`GET /api/v1/context/stream`) | Additive route |
| 13C | WebSocket adapter | New port when enabled |
| 13D | gRPC stream completion (extends 10.5E) | Flag-gated |
| 13E | Protocol benchmark CLI + report schema | Dev/CI optional |
| 13F | Manifest + docs | Additive |

## Rollback

- Disable `SSE_ENABLED`, `WEBSOCKET_ENABLED`, `GRPC_ENABLED` — unary REST/MCP only.
- Remove stream routes — existing tests unchanged.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 15 Content Scale | Uses gRPC client-stream for batch ingest (protocol ready) |
| 12 Events | WebSocket/SSE subscribe to `IEventBus` fan-out |
| 14 Search/Graph | Reindex notifications via WS optional |
| Global fabric | Multi-protocol peering manifest |

---

## References

- [ADR-027 Transport layer](../../adr/027-transport-connectivity-layer.md)
- [ADR-025 Capability manifest](../../../docs/adr/025-capability-discovery-api.md)
- [Phase 13 DESIGN](../phases/13-protocol-layer/DESIGN.md)
- [04-ARCHITECTURE.md](../core/architecture/04-ARCHITECTURE.md)
