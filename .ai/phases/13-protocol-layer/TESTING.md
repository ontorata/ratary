# Phase 13 — Protocol Layer — TESTING

**Status:** Implemented (2026-07-04)

---

## Test suites

| Suite | File | Coverage |
|-------|------|----------|
| Context stream handler | `tests/transport/context-stream.test.ts` | chunk order, publisher contract, benchmark report schema |
| Handler parity | `tests/transport/handler-parity.test.ts` | REST/MCP unchanged |
| gRPC stream | `tests/transport/grpc-transport.test.ts` | proto + server-stream shape |
| Layer boundaries | `tests/transport/layer-boundaries.test.ts` | no protocol imports in services |
| Manifest | `tests/capabilities/manifest-contract.test.ts` | transport.streaming, benchmark CLI |

---

## Manual smoke

```bash
# SSE (requires SSE_ENABLED=true + auth)
curl -N -H "Authorization: Bearer aic_..." \
  "http://localhost:3000/api/v1/context/stream?query=handoff&limit=5"

# Protocol benchmark
npm run benchmark:protocols

# WebSocket (requires WEBSOCKET_ENABLED=true)
# Connect to ws://localhost:3000/api/v1/ws and send:
# {"id":"1","op":"context.stream","payload":{"query":"handoff","limit":3}}
```

---

## Quality gate

557 tests green at default env (flags off).
