# Phase 7.5 — Runtime Compatibility — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-025 Accepted](../../../docs/adr/025-capability-discovery-api.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Builder | `CapabilityManifestBuilder` + `AICapabilityManifest` types | ✅ |
| Registry | `MCP_TOOL_NAMES` SSOT (20 tools incl. `get_capabilities`) | ✅ |
| REST | `GET /api/v1/capabilities` (public, `X-Protocol-Version` header) | ✅ |
| MCP | `get_capabilities` tool — same manifest JSON | ✅ |
| Transport | Shared `IApplicationHandler` via capabilities handlers | ✅ |
| Composition | `create-runtime-compatibility-ports.ts` | ✅ |
| OpenAPI | Capabilities tag in swagger | ✅ |
| Extension flags | 5.5/6.5/04.7/10.5 fields in manifest | ✅ |

---

## File map

```
src/capabilities/
  capability-manifest.types.ts
  capability-manifest.constants.ts
  capability-manifest-builder.ts
  mcp-tool-names.ts
  index.ts
src/composition/create-runtime-compatibility-ports.ts
src/controllers/capabilities.controller.ts
src/routes/v1/capabilities.routes.ts
src/transport/shared/handlers/capabilities.handlers.ts
src/transport/mcp/mcp-server.ts              # get_capabilities tool
tests/capabilities/manifest-builder.test.ts
tests/capabilities/manifest-contract.test.ts
tests/api/capabilities.test.ts
tests/composition/runtime-compatibility-ports.test.ts
tests/mcp/tools.test.ts                    # tool registry parity
```

---

## Wiring

```typescript
createRuntimeCompatibilityPorts(env) → { buildManifest(options?) }

REST: GET /api/v1/capabilities → CapabilitiesController → handlers.getManifest
MCP:  get_capabilities → handlers.getManifest (shared builder path)
```

---

## Manifest highlights

- `protocolVersion`, `capabilities.*` flags from env
- `limits` — context tokens, search max, relations cap
- `errorCodes`, `rateLimits` — Phase 7 §10 catalog
- `mcp.toolNames` / `toolCount` — matches `MCP_TOOL_NAMES`
- `transport` — REST, MCP, gRPC (opt-in), SDK planned
- `retrieval.progressivePolicyVersion`, `defaultContentMode`

---

## Non-regression

- All 19 prior MCP tool signatures unchanged
- `get_capabilities` is additive (tool #20)
- No new env vars required — reads existing deployment flags

---

## Rollback

Remove route/tool registration; clients fall back to OpenAPI `/docs/json` (partial discovery only).
