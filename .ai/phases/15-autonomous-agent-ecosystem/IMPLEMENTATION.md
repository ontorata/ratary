# Phase 15 — Autonomous Agent Ecosystem — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-030 Implemented](../../adr/030-autonomous-agent-ecosystem.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 15A | `AgentClientType` SSOT + 12 client profiles | ✅ |
| 15B | `IAgentClientCatalog` + `DefaultAgentClientCatalog` | ✅ |
| 15C | `AgentEcosystemManifestBuilder` + manifest `ecosystem` section | ✅ |
| 15D | `GET /api/v1/ecosystem/clients` (+ `/:type`, `/manifest`) | ✅ |
| 15E | Compatibility matrix + contract tests | ✅ |
| 15F | PANDUAN § Agent Ecosystem | ⏸ Deferred |

---

## File map

```
src/ecosystem/
  types/                    AgentClientType, AgentClientProfile, AgentEcosystemManifest
  ports/                    IAgentClientCatalog
  catalog/                  agent-client-registry.ts (SSOT data), default-agent-client-catalog.ts
  builders/                 agent-ecosystem-manifest-builder.ts
src/controllers/ecosystem.controller.ts
src/routes/v1/ecosystem.routes.ts
src/capabilities/
  capability-manifest-builder.ts   # EXTENDED — ecosystem block + supportsAgentEcosystem
  capability-manifest.types.ts
tests/ecosystem/
  agent-client-catalog.test.ts
  ecosystem-manifest.test.ts
tests/api/ecosystem.test.ts
```

---

## REST endpoints (always on — public read-only)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/ecosystem/clients` | Deployment-filtered client catalog |
| GET | `/api/v1/ecosystem/clients/:type` | Single profile by `AgentClientType` |
| GET | `/api/v1/ecosystem/manifest` | Full ecosystem manifest |
| — | `/api/v1/capabilities` | Extended with `ecosystem` block |
| — | MCP `get_capabilities` | Same manifest (includes ecosystem) |

---

## Client profiles (SSOT)

12 profiles: `cursor`, `claude-code`, `claude-desktop`, `openai-api`, `openai-agents-sdk`, `gemini-cli`, `codex`, `continue`, `qwen-code`, `vscode-copilot`, `custom-rest`, `custom-mcp`.

`listCompatibleProfiles` filters `supportedProtocols` by deployment env (`GRPC_ENABLED`, `SSE_ENABLED`, `WEBSOCKET_ENABLED`, etc.).

---

## Invariants

- **Zero agent runtime** in `src/` — metadata/catalog only
- **`MemoryService` unchanged** — no imports from `ecosystem/` in memory layer
- **Additive** — no breaking changes to MCP tools or REST v1
- External agent loops remain **outside** repository

---

## Rollback

Remove `src/ecosystem/`, ecosystem routes, and manifest `ecosystem` field — zero impact on memory CRUD.
