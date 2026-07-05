# Phase 7.5 — Runtime Compatibility — DESIGN

**Document:** DESIGN  
**Phase status:** Implemented (2026-07-04) · ADR-025 Accepted  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [Phase 7 Agent Runtime DESIGN](../07-agent-runtime/DESIGN.md) · [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md)  
**Roadmap placement:** Extension track **07.5** — runtime capability discovery (Phase 7 gap closure)  
**ADR gate:** [ADR-025](../../adr/025-capability-discovery-api.md) — **Accepted** (Implemented 2026-07-04)

---

## Purpose

Close the **capability discovery gap** left by Phase 7 design approval: external agent runtimes MUST discover Ratary limits, feature flags, and protocol versions **without** trial-and-error or reading source code.

Phase 7.5 delivers:

- **`GET /api/v1/capabilities`** — machine-readable manifest
- **MCP manifest exposure** — via tool or `initialize` metadata extension
- **Runtime compatibility matrix** — generated from deployment env
- **Protocol version** wiring — aligned with DESIGN §18

Phase 7.5 does **not** implement:

- Agent runtime, planner, or SDK package inside this repo
- Tool execution semantics change
- Authentication model change

---

## Scope

### Inside this repository

| Capability | Status |
|------------|--------|
| `CapabilityManifestBuilder` | New (composition root) |
| `GET /api/v1/capabilities` | New route (public or auth-optional per ADR) |
| MCP `get_capabilities` tool **or** server metadata | New (additive) |
| OpenAPI tag + schema for manifest | Extend swagger |
| Contract tests vs `EXPECTED_TOOLS` | New |
| Compatibility matrix doc generation | Extend Phase 7 §13 |

### Outside this repository

| Capability | Location |
|------------|----------|
| Official SDK | **Phase 16** — `@ratary/sdk` in `packages/` (ADR-031; supersedes `@ratary/client` name here) |
| Agent orchestration | External runtime |
| Cursor / Claude MCP config | User environment |

### Non-goals

- Breaking MCP tool renames
- Versioned duplicate endpoints (`/api/v2` not required)
- Embedding agent health checks

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    External Agent Runtime                        │
│         (Cursor, Claude Code, Cline, custom SDK)               │
└────────────┬───────────────────────────────┬────────────────────┘
             │ MCP                           │ REST
             ▼                               ▼
┌────────────────────────┐       ┌───────────────────────────────┐
│ MCP Server              │       │ GET /api/v1/capabilities       │
│ get_capabilities (new)  │       │ GET /docs/json (existing)      │
└────────────┬───────────┘       └───────────────┬───────────────┘
             │                                   │
             └──────────────┬────────────────────┘
                            ▼
              ┌─────────────────────────────┐
              │ CapabilityManifestBuilder    │
              │ reads: env, adapter registry,  │
              │        MCP tool registry       │
              └─────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │ AICapabilityManifest (DTO)   │
              │ per Phase 7 DESIGN §10       │
              └─────────────────────────────┘
```

### Design invariants

1. **Manifest reflects deployment truth** — not static markdown.
2. **Additive fields only** — clients ignore unknown keys.
3. **No agent logic** — builder reads config; no reasoning.
4. **Single builder** — REST and MCP share one code path.
5. **Tool count verifiable** — manifest lists tool names matching registry test.

---

## Boundary

| Inside Phase 7.5 | Outside |
|------------------|---------|
| Publish capabilities, limits, versions | Execute agent tasks |
| Document compatibility matrix | Certify third-party agents |
| Link OpenAPI + manifest | Host SDK documentation site |
| Error code catalog (Phase 7 S1) | Client-side retry policies |

**Constitution §30:** Protocol-native access. **Phase 7 §7:** Agent runtime external.

---

## Data Flow

### Discovery (REST)

```
Client → GET /api/v1/capabilities
      → CapabilityManifestBuilder.build(env, adapters)
      → 200 AICapabilityManifest JSON
```

### Discovery (MCP)

```
Client → tools/call get_capabilities {}
      → same builder.build()
      → JSON in content[].text
```

### Manifest build inputs

| Input source | Manifest fields |
|--------------|-------------------|
| `process.env` | hybrid/graph/search/vector providers |
| MCP server registry | tool names, count |
| `context.config.ts` | maxChars limits |
| Phase flags | supportsWorkspace, supportsOrganization, etc. |
| Package version | protocolVersion |

---

## Module Structure

```
src/
  capabilities/
    capability-manifest.types.ts   # mirrors Phase 7 §10 interface
    capability-manifest-builder.ts # reads env + registries
    capability-routes.ts           # Fastify plugin
  mcp/
    server.ts                      # register get_capabilities tool
  routes/v1/
    capabilities.routes.ts         # mount GET /capabilities
tests/
  capabilities/
    manifest-builder.test.ts
    manifest-contract.test.ts      # vs EXPECTED_TOOLS, env matrix
```

**No new application services.** Builder is infrastructure/edge concern.

---

## Interfaces

```typescript
/** Canonical — aligned with Phase 7 DESIGN §10 */
interface AICapabilityManifest {
  protocolVersion: string;
  capabilities: CapabilityFlags;
  limits: CapabilityLimits;
  errorCodes: ErrorCodeDescriptor[];
  rateLimits: RateLimitDescriptor[];
  mcp: {
    toolNames: string[];
    toolCount: number;
    transport: 'stdio';
  };
  rest: {
    version: 'v1';
    openApiUrl: string;
  };
  retrieval: {
    progressivePolicyVersion: string;
    defaultContentMode: 'summary' | 'full';
  };
  deployment: {
    sqlProvider: string;
    vectorProvider: string;
    graphProvider: string;
    searchProvider: string;
  };
  timestamp: string;
}

interface ICapabilityManifestBuilder {
  build(): Promise<AICapabilityManifest>;
}
```

### Compatibility matrix (generated section)

| Client class | REST | MCP | Context | Hybrid | Graph | Workspace |
|--------------|------|-----|---------|--------|-------|-----------|
| Cursor | ✓ | ✓ | ✓ | deploy | deploy | deploy |
| Custom SDK | ✓ | ✓ | ✓ | manifest | manifest | manifest |

Deploy-time flags override static doc when present.

---

## Storage Impact

**None.** Manifest is computed at request time. Optional short TTL cache (in-memory) — no persistence.

---

## API Impact

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/v1/capabilities` | Public | Full manifest |
| `POST` | `/api/v1/capabilities/negotiate` | Public | D7.5-03 capability handshake |
| — | `/docs/json` | Public | OpenAPI (existing) |
| — | All existing | Unchanged | — |

Response schema registered in `@fastify/swagger`.

Optional headers:

| Header | Value |
|--------|-------|
| `X-Protocol-Version` | Echo `protocolVersion` on all API responses (additive, Phase 7.5 optional track) |

---

## MCP Impact

| Tool | Change |
|------|--------|
| **`get_capabilities`** | Returns full manifest JSON |
| **`negotiate_capabilities`** | D7.5-03 — bidirectional handshake JSON |
| All prior memory/context/graph tools | **Unchanged** |
| `get_context` params | Documented in manifest limits |
| `list_tools` | Count must match manifest.mcp.toolCount (**23** at 2026-07-05) |

**Tool registry test:** `tests/mcp/tools.test.ts` `EXPECTED_TOOLS` ↔ manifest parity.

**Initialize (D7.5-01 / D7.5-03):** condensed snapshot in `_meta['io.aibrain/capabilities']`; optional client request via `_meta['io.aibrain/capabilities-request']` → negotiation in `_meta['io.aibrain/capabilities-negotiation']`; enriched `serverInfo.description` + `instructions`.

---

## Testing

| Test | Purpose |
|------|---------|
| `manifest-builder.test.ts` | Env combinations → correct flags |
| `manifest-contract.test.ts` | toolCount === MCP_TOOL_NAMES; required fields present |
| `capabilities.routes.test.ts` | GET + POST negotiate 200, schema validation |
| `capability-negotiation.test.ts` | Protocol + capability matrix matching |
| `mcp-initialize-capabilities.test.ts` | Initialize `_meta` condensed + negotiation |
| MCP integration | `get_capabilities` / `negotiate_capabilities` parseable JSON |
| Snapshot optional | Manifest shape regression (additive fields OK) |

**Non-regression:** all existing API/MCP tests unchanged.

---

## Success Criteria

- [x] ADR-025 **Accepted** and linked
- [x] `GET /api/v1/capabilities` implemented and in OpenAPI
- [x] MCP `get_capabilities` tool implemented
- [x] Manifest `toolNames` matches `MCP_TOOL_NAMES` / contract tests exactly
- [x] `errorCodes` and `rateLimits` populated per Phase 7 DESIGN §10
- [x] `supportsHybridRetrieval` reflects `HYBRID_RETRIEVAL` + embedding env
- [x] Default D1 deploy manifest accurate with all flags off
- [x] `X-Protocol-Version` response header on capabilities endpoint
- [x] D7.5-01 condensed MCP `initialize` snapshot (`_meta`, `serverInfo`, `instructions`)
- [x] D7.5-03 REST POST negotiate + MCP `negotiate_capabilities` + initialize handshake
- [x] No changes to `MemoryService` or retrieval logic

---

## Future Phase

Phase 7.5 core gate closed **2026-07-04** (ADR-025). Deferred tracks **D7.5-01 / D7.5-02 / D7.5-03** are **closed** — no open D7.5 debt. Successor phases below extended `CapabilityManifestBuilder`; this section records closure and adjacent evolution only.

### D7.5 deferred closure

| ID | Deliverable | Status |
|----|-------------|--------|
| **D7.5-01** | Condensed manifest in MCP `initialize` — `_meta['io.aibrain/capabilities']`, enriched `serverInfo.description`, `instructions` | ✅ 2026-07-05 |
| **D7.5-02** | Client SDK — `@ratary/sdk` `CapabilitiesApi.get()` (Phase 16, ADR-031) | ✅ Phase 16 |
| **D7.5-03** | Bidirectional negotiation — `POST /api/v1/capabilities/negotiate`, MCP `negotiate_capabilities`, initialize `_meta['io.aibrain/capabilities-request' \| 'capabilities-negotiation']`; SDK `CapabilitiesApi.negotiate()` | ✅ 2026-07-05 |

### Successor phases — manifest extensions (closed)

| Phase | Field / behavior in manifest | Status |
|-------|------------------------------|--------|
| **5.5** | `capabilities.supportsSemanticCompression` | ✅ |
| **6.5** | `retrieval.retrievalPolicy`, `retrieval.progressivePolicyVersion`, `defaultContentMode` | ✅ |
| **8.5** | `capabilities.supportsQualitySignals` | ✅ |
| **12** | `capabilities.supportsEventSubscription` (env-scoped) | ✅ |
| **13.1** | `transport.mcp.remote`; remote clients use initialize condensed snapshot + negotiation `_meta` | ✅ |

### Adjacent phases (not owned by 7.5)

| Phase / track | Relationship |
|---------------|--------------|
| **7** | Agent runtime external — boundary unchanged; manifest is the discovery contract |
| **13** | Protocol layer (SSE/gRPC/WS) — consumes manifest `transport.*`; no 7.5 refactor required |
| **16** | SDK owns client call patterns (`get`, `negotiate`); manifest remains server SSOT |
| **18+** | Platform sections (`cloud`, `federation`, `observability`, …) — additive builder options when flags enabled |

### Open evolution (no D7.5 ID)

| Item | Notes |
|------|-------|
| Protocol **2.0** | Breaking changes only with ADR + migration guide (Phase 7 §9) |
| OpenAPI negotiate schema | ✅ Fastify route schemas + `packages/openapi` `POST /capabilities/negotiate` (2026-07-05) |
| Manifest TTL cache | Optional in-memory cache at builder — not implemented; manifest stays compute-on-read |

---

## References

| Document | Relevance |
|----------|-----------|
| [Phase 7 DESIGN](../07-agent-runtime/DESIGN.md) | §10 Capability manifest, §11 MCP, §12 OpenAPI |
| [ADR-025](../../adr/025-capability-discovery-api.md) | Gate (Accepted) |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | What was built |
| [TESTING.md](TESTING.md) | Verification evidence |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Does not implement agent runtime.*
