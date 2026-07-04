# Phase 7.5 — Runtime Compatibility — TESTING

**Status:** Implemented (2026-07-04)

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/capabilities/manifest-builder.test.ts` | Env → flags (hybrid, embedding, compression, signals) |
| `tests/capabilities/manifest-contract.test.ts` | Tool registry parity, required fields, transport section |
| `tests/api/capabilities.test.ts` | GET /api/v1/capabilities 200, X-Protocol-Version, transport block |
| `tests/composition/runtime-compatibility-ports.test.ts` | Composition root wiring |
| `tests/mcp/tools.test.ts` | MCP tool list ↔ `MCP_TOOL_NAMES` |

---

## Scenarios verified

- [x] `mcp.toolCount` === `MCP_TOOL_NAMES.length` (20 tools)
- [x] `get_capabilities` in tool registry
- [x] Default D1: hybrid/graph/compression/signals off
- [x] Hybrid enabled when `HYBRID_RETRIEVAL` + embedding provider active
- [x] Standard error codes and rate limits present
- [x] REST endpoint public, returns valid manifest JSON
- [x] gRPC transport section when `GRPC_ENABLED=true`
- [x] Shared builder path via composition root

---

## Manual verification

```bash
curl -i http://localhost:3000/api/v1/capabilities
# Expect: 200, X-Protocol-Version: 1.0.0, JSON manifest
```

MCP: call `get_capabilities` — parse JSON from content text.
