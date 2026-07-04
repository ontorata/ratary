# Phase 7.5 — Runtime Compatibility — IMPLEMENTATION

**Status:** In progress  
**ADR:** [ADR-025 Approved](../../../docs/adr/025-capability-discovery-api.md)

## Commit sequence

| Commit | Scope | Status |
|--------|-------|--------|
| 1 | ADR-023–026 Approved | ✅ |
| 2 | `CapabilityManifestBuilder` + types + constants | ✅ |
| 3 | `GET /api/v1/capabilities` (public) | ✅ |
| 4 | MCP `get_capabilities` + `MCP_TOOL_NAMES` registry | ✅ |

## Modules

- `src/capabilities/capability-manifest-builder.ts` — canonical builder
- `src/capabilities/mcp-tool-names.ts` — tool registry SSOT
- `src/controllers/capabilities.controller.ts`
- `src/routes/v1/capabilities.routes.ts`

## Env

No new env vars. Manifest reads existing deployment flags.

## Non-regression

All 19 prior MCP tool signatures unchanged. Tool #20 `get_capabilities` is additive.
