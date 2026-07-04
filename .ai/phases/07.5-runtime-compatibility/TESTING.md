# Phase 7.5 — Runtime Compatibility — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04 · D7.5-01/03 follow-up verified 2026-07-05

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/capabilities/manifest-builder.test.ts` | Env → flags (hybrid, embedding, compression, signals) |
| `tests/capabilities/manifest-contract.test.ts` | Tool registry parity, required fields, transport section |
| `tests/capabilities/condensed-capability-manifest.test.ts` | D7.5-01 condensed snapshot builder |
| `tests/capabilities/capability-negotiation.test.ts` | D7.5-03 protocol + capability matching |
| `tests/transport/mcp-initialize-capabilities.test.ts` | Initialize `_meta` condensed + negotiation wire |
| `tests/api/capabilities.test.ts` | GET manifest + POST negotiate (public, headers) |
| `tests/composition/runtime-compatibility-ports.test.ts` | Composition root wiring |
| `tests/mcp/tools.test.ts` | MCP tool list ↔ `MCP_TOOL_NAMES`; init + negotiate tools |
| `packages/sdk/tests/client.test.ts` | `CapabilitiesApi.get()` + `.negotiate()` |

---

## Scenarios verified

- [x] `mcp.toolCount` === `MCP_TOOL_NAMES.length` (**23 tools** at 2026-07-05)
- [x] `get_capabilities` and `negotiate_capabilities` in tool registry
- [x] Default D1: hybrid/graph/compression/signals off
- [x] Hybrid enabled when `HYBRID_RETRIEVAL` + embedding provider active
- [x] Standard error codes and rate limits present
- [x] REST GET `/capabilities` public, returns valid manifest JSON
- [x] REST POST `/capabilities/negotiate` public, returns compatible matrix
- [x] MCP initialize returns condensed snapshot in `_meta`
- [x] MCP initialize negotiation when client sends `capabilities-request` meta
- [x] gRPC transport section when `GRPC_ENABLED=true`
- [x] Shared builder path via composition root

---

## Manual verification

```bash
curl -i http://localhost:3000/api/v1/capabilities
# Expect: 200, X-Protocol-Version: 1.0.0, JSON manifest

curl -i -X POST http://localhost:3000/api/v1/capabilities/negotiate \
  -H "Content-Type: application/json" \
  -d '{"protocolVersion":"1.0.0","requiredCapabilities":["supportsMemoryCRUD"]}'
# Expect: 200, compatible: true
```

MCP: call `get_capabilities` or `negotiate_capabilities` — parse JSON from content text.

---

## Current regression

736 passed | 3 skipped (default env, 2026-07-05) (full suite, all master flags OFF)
