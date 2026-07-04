# Phase 7.5 — Runtime Compatibility — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04 · D7.5 deferred closed 2026-07-05  
**ADR:** [ADR-025 Accepted](../../../docs/adr/025-capability-discovery-api.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| Builder | `CapabilityManifestBuilder` + `AICapabilityManifest` types | ✅ |
| Registry | `MCP_TOOL_NAMES` SSOT (**23 tools**) | ✅ |
| REST | `GET /api/v1/capabilities` (public, `X-Protocol-Version` header) | ✅ |
| REST | `POST /api/v1/capabilities/negotiate` (D7.5-03) | ✅ |
| MCP | `get_capabilities` tool — same manifest JSON | ✅ |
| MCP | `negotiate_capabilities` tool (D7.5-03) | ✅ |
| MCP init | Condensed snapshot in `initialize` (`_meta`, `serverInfo`, `instructions`) — D7.5-01 | ✅ |
| MCP negotiate | Initialize `_meta` request/negotiation handshake — D7.5-03 | ✅ |
| Transport | Shared `IApplicationHandler` via capabilities handlers | ✅ |
| Composition | `create-runtime-compatibility-ports.ts` | ✅ |
| OpenAPI | Capabilities tag in swagger | ✅ |
| SDK | `@ai-brain/sdk` `CapabilitiesApi.get()` + `.negotiate()` — D7.5-02 | ✅ |
| Extension flags | 5.5/6.5/04.7/10.5 fields in manifest | ✅ |

---

## File map

```
src/capabilities/
  capability-manifest.types.ts
  capability-manifest.constants.ts
  capability-manifest-builder.ts
  capability-negotiation.ts
  capability-negotiation.types.ts
  condensed-capability-manifest.ts
  mcp-tool-names.ts
  index.ts
src/composition/create-runtime-compatibility-ports.ts
src/controllers/capabilities.controller.ts
src/routes/v1/capabilities.routes.ts
src/transport/shared/handlers/capabilities.handlers.ts
src/transport/mcp/mcp-server.ts
src/transport/mcp/mcp-initialize-capabilities.ts
packages/sdk/src/apis/capabilities-api.ts
tests/capabilities/manifest-builder.test.ts
tests/capabilities/manifest-contract.test.ts
tests/capabilities/condensed-capability-manifest.test.ts
tests/capabilities/capability-negotiation.test.ts
tests/transport/mcp-initialize-capabilities.test.ts
tests/api/capabilities.test.ts
tests/composition/runtime-compatibility-ports.test.ts
tests/mcp/tools.test.ts
```

---

## Wiring

```typescript
createRuntimeCompatibilityPorts(env) → { buildManifest(options?) }

REST: GET  /api/v1/capabilities          → CapabilitiesController → handlers.getManifest
REST: POST /api/v1/capabilities/negotiate → CapabilitiesController → handlers.negotiate
MCP:  get_capabilities                   → handlers.getManifest (shared builder path)
MCP:  negotiate_capabilities               → handlers.negotiate
MCP:  initialize                           → wireMcpInitializeCapabilities (condensed + optional negotiation)
SDK:  client.capabilities.get() / .negotiate()
```

---

## Manifest highlights

- `protocolVersion`, `capabilities.*` flags from env
- `limits` — context tokens, search max, relations cap
- `errorCodes`, `rateLimits` — Phase 7 §10 catalog
- `mcp.toolNames` / `toolCount` — matches `MCP_TOOL_NAMES` (23)
- `transport` — REST, MCP, gRPC (opt-in), SDK published
- `retrieval.progressivePolicyVersion`, `defaultContentMode`

---

## Non-regression

- Prior MCP tool signatures unchanged (additive tools only)
- `get_capabilities`, `negotiate_capabilities` are additive
- No new env vars required — reads existing deployment flags

---

## Rollback

Remove route/tool registration; clients fall back to OpenAPI `/docs/json` (partial discovery only).
