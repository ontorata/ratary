# Phase 10.5 — Transport & Connectivity — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-027 Implemented](../../adr/027-transport-connectivity-layer.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 10.5A | `TransportContext`, `resolve-transport-scope`, transport errors | ✅ |
| 10.5B | `IApplicationHandler` + 23 shared handlers | ✅ |
| 10.5C | REST → `transport/rest/` + `RestTransportServer` | ✅ |
| 10.5D | MCP → `transport/mcp/` + `McpTransportServer` | ✅ |
| 10.5E | gRPC `ai.brain.v1` behind `GRPC_ENABLED=false` | ✅ |
| 10.5F | Manifest `transport` section + docs | ✅ |

---

## File map

```
src/transport/
  shared/
    transport-context.types.ts
    resolve-transport-scope.ts
    transport-errors.ts
    iapplication-handler.interface.ts
    handlers/
      memory.handlers.ts          (15 handlers)
      context.handlers.ts           (2 handlers)
      capabilities.handlers.ts      (1 handler)
      graph.handlers.ts             (2 handlers)
      relation.handlers.ts          (3 handlers)
      create-transport-handlers.ts
  rest/
    rest-server.ts                  buildApp composition root
    rest-transport-server.ts        ITransportServer wrapper
  mcp/
    mcp-server.ts                     stdio tool dispatch → handlers
    mcp-transport-server.ts
  grpc/
    proto/ai/brain/v1/ai_brain.proto
    grpc-server.ts                    GrpcTransportServer
    grpc-services.ts
    grpc-mappers.ts
    load-proto.ts
  registry/
    itransport-server.interface.ts
    transport-registry.ts
    start-transports.ts               composition root (REST + optional gRPC)
src/server.ts                         strangler re-export → transport/rest/
src/mcp/server.ts                     strangler re-export → transport/mcp/
src/dev-server.ts                     uses startTransports()
```

---

## Wiring

```typescript
// Dev / long-running Node
startTransports() → TransportRegistry
  ├── RestTransportServer (always)
  └── GrpcTransportServer (when GRPC_ENABLED=true, dynamic import)

// Vercel / tests
buildApp() from transport/rest/rest-server.ts

// MCP stdio (separate process)
startMcpStdioServer() → createTransportHandlers() → same handlers as REST
```

Controllers delegate to shared handlers (`src/controllers/index.ts`, knowledge, context, graph, capabilities).

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `GRPC_ENABLED` | `false` | Master gRPC switch |
| `GRPC_PORT` | `50051` | Bind port (`0` = OS ephemeral) |
| `GRPC_HOST` | `0.0.0.0` | Bind host |
| `GRPC_TLS_CERT_PATH` | — | Optional mTLS (pair with key) |
| `GRPC_TLS_KEY_PATH` | — | Optional mTLS |

---

## Invariants

- No business logic in transport handlers (mapping + scope only)
- No `fastify` / `@grpc/grpc-js` / MCP SDK in `services/`
- REST v1 and MCP tool schemas unchanged
- `@grpc/grpc-js` loaded only when `GRPC_ENABLED=true`

---

## Rollback

Set `GRPC_ENABLED=false`. Revert transport folder commits if needed; legacy `src/server.ts` and `src/mcp/server.ts` shims preserve import paths.
