# Phase 7.5 — Runtime Compatibility — DESIGN

**Document:** DESIGN  
**Phase status:** Ready (Architecture Review approved 2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [Phase 7 Agent Runtime DESIGN](../07-agent-runtime/DESIGN.md) · [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md)  
**Roadmap placement:** **Gap closure** for Phase 7 — may ship independently before Phase 12  
**ADR gate (draft):** [ADR-025](../../../docs/adr/025-capability-discovery-api.md) — **Proposed**

---

## Purpose

Close the **capability discovery gap** left by Phase 7 design approval: external agent runtimes MUST discover AI Brain limits, feature flags, and protocol versions **without** trial-and-error or reading source code.

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
| Official SDK (npm `@ai-brain/client`) | External package (optional) |
| Agent orchestration | External runtime |
| Cursor / Claude MCP config | User environment |

### Non-goals

- Breaking MCP tool renames
- Versioned duplicate endpoints (`/api/v2` not required)
- Embedding agent health checks
- Remote capability negotiation handshake (future)

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
| `GET` | `/api/v1/capabilities` | Public (recommended) or optional | Full manifest |
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
| **`get_capabilities`** | **New** — returns manifest JSON |
| All 19 existing tools | **Unchanged** |
| `get_context` params | Documented in manifest limits |
| `list_tools` | Count must match manifest.mcp.toolCount |

**Tool registry test:** `tests/mcp/tools.test.ts` `EXPECTED_TOOLS` ↔ manifest parity.

Optional: embed condensed manifest in MCP `serverInfo` during `initialize` (additive metadata).

---

## Testing

| Test | Purpose |
|------|---------|
| `manifest-builder.test.ts` | Env combinations → correct flags |
| `manifest-contract.test.ts` | toolCount === 19; required fields present |
| `capabilities.routes.test.ts` | GET 200, schema validation |
| MCP integration | `get_capabilities` returns parseable JSON |
| Snapshot optional | Manifest shape regression (additive fields OK) |

**Non-regression:** all existing API/MCP tests unchanged.

---

## Success Criteria

- [ ] ADR-025 **Approved**
- [ ] `GET /api/v1/capabilities` implemented and in OpenAPI
- [ ] MCP `get_capabilities` tool implemented
- [ ] Manifest `toolNames` matches `EXPECTED_TOOLS` exactly
- [ ] `errorCodes` and `rateLimits` populated per Phase 7 DESIGN §10
- [ ] `supportsHybridRetrieval` reflects `HYBRID_RETRIEVAL` env
- [ ] Default D1 deploy manifest accurate with all flags off
- [ ] Phase 7 DESIGN §10 endpoint table marked implemented
- [ ] No changes to `MemoryService` or retrieval logic

---

## Future Phase

| Phase | Interaction |
|-------|-------------|
| **6.5** | Manifest includes `retrievalPolicyVersion` |
| **5.5** | `supportsSemanticCompression` flag |
| **8.5** | `supportsQualitySignals` flag |
| **12** | `supportsEventSubscription` scoped flags |
| **External SDK** | Consumes manifest; not in repo |

---

## References

| Document | Relevance |
|----------|-----------|
| [Phase 7 DESIGN](../07-agent-runtime/DESIGN.md) | §10 Capability manifest, §11 MCP, §12 OpenAPI |
| [ADR-025](../../../docs/adr/025-capability-discovery-api.md) | Gate (Proposed) |
| [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) | MCP + REST share services |
| `src/plugins/swagger.ts` | OpenAPI host |
| `tests/mcp/tools.test.ts` | Tool registry contract |
| Architecture Review 2026-07-04 | 7.5 = gap closure, not new phase |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Does not implement agent runtime. Implementation deferred until ADR-025 Approved.*
