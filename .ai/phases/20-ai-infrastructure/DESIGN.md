# Phase 20 — AI Infrastructure Platform — DESIGN

**Document:** DESIGN · **ADR:** [ADR-035](../../adr/035-ai-infrastructure-platform.md) · **Status:** Awaiting approval

---

## 1. Mengapa phase ini diperlukan?

Phases 1–19 establish memory services, protocols, federation, developer tooling, enterprise security, cloud operations, and observability. Ports for storage, embedding, vector, graph, and LLM inference exist (ADR-008) but **provider selection remains env-driven** — operators must know adapter names, config keys, and compatibility matrices.

Enterprise buyers expect **AI Memory Infrastructure**: discoverable provider plugins, signed manifests, tenant allow-lists, a curated marketplace catalog, and a **single capability surface** across REST, gRPC, MCP, WebSocket, SSE, SDK, CLI, and Dashboard — without duplicating business logic.

Without Phase 20:

- Provider swap requires deployment expertise — not self-service.
- No signed plugin lifecycle (register → enable → disable → audit).
- "Memory API" positioning gap vs **infrastructure platform** narrative.
- Federation, security, and cloud policies don't uniformly govern provider installs.

Phase 20 is the **capstone**: `IPluginRegistry` + `IProviderMarketplace` + extended capability manifest — minimal new runtime surface, maximum enterprise clarity.

---

## 2. Mengapa tidak digabung dengan phase lain?

| Phase | Why separate |
|-------|--------------|
| 10 Adapters | Env-selected adapters — **no** discoverable registry or marketplace |
| 13 Protocol | Transport adapters — not provider plugin lifecycle |
| 14 Federation | Peer sync — marketplace **metadata** may federate, not plugin runtime |
| 16 Developer Platform | Client SDK/CLI — **consumes** infrastructure manifest, doesn't register plugins |
| 17 Enterprise Security | Policy/SSO — **governs** plugin allow-list, doesn't host catalog |
| 18 Cloud Platform | Tenant provisioning — **allow-list** per tenant via control plane |
| 19 Observability | Monitors plugin health — doesn't register providers |

**Coupling avoided:** Plugin registry ≠ SDK generation ≠ SSO ≠ cloud provisioning ≠ metrics export.

---

## 3. Scope

### In scope

| Deliverable | Detail |
|-------------|--------|
| **`IPluginRegistry` port** | Register, enable, disable, list provider plugins (signed manifest) |
| **`IProviderMarketplace` port** | Curated catalog metadata (no payments in v1) |
| **Plugin types** | Storage, Embedding, Vector, Graph, LLM inference — each implements **existing** port interfaces |
| **`CapabilityManifestBuilder` extension** | Infrastructure platform manifest: installed plugins, marketplace entries, protocol matrix |
| **Tenant plugin allow-list** | Governed by Phase 18 control plane + Phase 17 policy |
| **Federation integration** | Optional catalog metadata sync across peers (read-only) |
| **All protocols** | REST, gRPC, MCP, WS, SSE expose unified infrastructure/capabilities surface |
| **Feature flag** | `PLUGIN_MARKETPLACE_ENABLED=false` default → Phase 10 env adapter behavior |

### Out of scope

- Plugin code that bypasses MemoryService / service layer
- Agent runtime / planner / tool execution loop
- In-process arbitrary code execution (plugins = adapter factories + manifest, not untrusted WASM in v1)
- App store payments / billing (marketplace = metadata catalog only in v1)
- MemoryService business logic changes
- New retrieval/ranking algorithms inside plugins

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Protocol adapters (Phase 13) + clients (Phase 16)                       │
│  REST │ gRPC │ MCP │ WS │ SSE │ SDK │ CLI │ Dashboard                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ GET /capabilities / infrastructure
┌───────────────────────────────▼─────────────────────────────────────────┐
│  AI Infrastructure Platform (Phase 20)                                   │
│  IPluginRegistry │ IProviderMarketplace │ CapabilityManifestBuilder+     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ resolves active adapter per type
┌───────────────────────────────▼─────────────────────────────────────────┐
│  Composition root (ADR-008 — unchanged service layer)                    │
│  MemoryService │ ContextService │ …                                      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   IStorageProvider      IEmbeddingProvider       IVectorStore / IGraphStore
   (plugin adapter)      (plugin adapter)         (plugin adapters)
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                    ILLMInferenceProvider (embedding/completion boundary)
```

### Plugin model

```
Plugin Manifest (signed JSON)
├── id, version, type: storage|embedding|vector|graph|llm
├── implements: IStorageProvider | … (port name)
├── config schema (JSON Schema — no secrets)
├── compatibility: minProtocolVersion, regions
└── signature: ed25519 (Phase 17 key material)

Lifecycle: register → validate → enable (per tenant allow-list) → active at composition root
           disable → fallback to env default adapter (Phase 10)
```

**Rule:** Plugins **wrap or replace** adapter implementations at composition root — they do **not** inject logic into MemoryService.

### Marketplace vs registry

| Concern | Owner | Purpose |
|---------|-------|---------|
| **Registry** | Operator / tenant admin | What is **installed and enabled** on this node |
| **Marketplace** | Curated catalog (repo + optional remote index) | What is **available to install** — metadata only |

v1 marketplace: static JSON catalog in repo; optional remote index URL (unsigned fetch + signature verify on install).

---

## 5. Extension points & interfaces

| Port / Contract | Location | Purpose | Default adapter |
|-----------------|----------|---------|-----------------|
| `IPluginRegistry` | `src/ports/infrastructure/` | Plugin CRUD, enable/disable | Env-only (Phase 10 compat) |
| `IProviderMarketplace` | `src/ports/infrastructure/` | Catalog browse, search | Local JSON catalog |
| `IPluginManifestValidator` | `src/ports/infrastructure/` | Signature + schema validation | Ed25519 + JSON Schema |
| `IPluginAllowList` | `src/ports/infrastructure/` | Tenant-scoped enabled set | Phase 18 control plane |
| `CapabilityManifestBuilder` | Existing + extend | Infrastructure section | Existing builder |

### Plugin types → existing ports (ADR-008)

| Plugin type | Must implement | MemoryService impact |
|-------------|----------------|----------------------|
| Storage | `IStorageProvider` | None — injected at compose |
| Embedding | `IEmbeddingProvider` | None |
| Vector | `IVectorStore` | None |
| Graph | `IGraphStore` | None |
| LLM | `ILLMInferenceProvider` | None — inference boundary only |

**LLM boundary:** Completion/chat for **embedding and inference ports only** — not agent planning, not tool loop.

### Capability / infrastructure manifest (extended)

```json
{
  "protocolVersion": "…",
  "protocols": ["rest", "grpc", "mcp", "ws", "sse"],
  "infrastructure": {
    "platform": "ai-memory-infrastructure",
    "plugins": {
      "storage": { "active": "…", "available": ["…"] },
      "embedding": { "active": "…", "available": ["…"] },
      "vector": { "…" },
      "graph": { "…" },
      "llm": { "…" }
    },
    "marketplace": { "catalogVersion": "…", "source": "local|remote" },
    "federation": { "catalogSync": false }
  }
}
```

Exposed consistently on REST `/capabilities`, gRPC capability RPC, MCP tool metadata, SDK `getCapabilities()`.

---

## 6. Cross-phase integration

```
Phase 17 IPolicyEngine  → deny plugin enable if policy blocks provider id
Phase 18 IControlPlane  → tenant allow-list for marketplace installs
Phase 14 Federation     → optional read-only catalog metadata sync
Phase 19 Observability  → plugin enable/disable audit metrics + traces
Phase 16 SDK/CLI        → browse marketplace, list plugins (admin scope)
```

### Federation integration

- **Optional:** Peer publishes catalog version + public plugin ids (no secrets)
- **Not in v1:** Cross-node plugin binary sync — operators install per node
- Conflict: local allow-list wins; federation metadata is informational

### All protocols

| Protocol | Infrastructure surface |
|----------|------------------------|
| REST | `GET /capabilities`, admin plugin routes (additive) |
| gRPC | `GetCapabilities`, admin plugin service (additive) |
| MCP | Tool schema includes capability snapshot |
| WS / SSE | Capability event on connect (optional) |
| SDK / CLI | `getCapabilities()`, `listPlugins()` admin |
| Dashboard | Infrastructure view via SDK (Phase 16) |

---

## 7. Migration strategy

| Step | Action | Server impact |
|------|--------|---------------|
| M1 | Add ports + env-only registry (Phase 10 behavior) | None when flag OFF |
| M2 | Manifest validator + local marketplace JSON | Additive |
| M3 | Extend CapabilityManifestBuilder | Additive fields only |
| M4 | Admin plugin routes (REST/gRPC) | Gated Phase 17 + 18 |
| M5 | Reference plugin packages (1 per type) | `plugins/` or external repo pattern |
| M6 | Federation catalog sync hook (optional) | Flag-gated |
| M7 | Observability labels for plugin lifecycle | Phase 19 metrics |

**Compatibility:**

- `PLUGIN_MARKETPLACE_ENABLED=false` → composition root uses env vars exactly as Phase 10
- Existing adapter env keys: **deprecated but functional** — documented migration path
- REST v1 memory routes: **unchanged**
- MCP memory tools: **unchanged**

**Backfill:**

- Running deployments: synthetic manifest entries for current env-selected adapters (auto-register on first boot, disabled marketplace features)

---

## 8. Impact summary

| Dimension | Impact |
|-----------|--------|
| Scalability | Provider swap without code deploy (enable plugin + restart compose) |
| Enterprise | **Primary capstone beneficiary** — infrastructure positioning |
| Security | Signed manifests; allow-list; Phase 17 policy on enable |
| Developer | SDK surfaces capabilities + admin plugin APIs |
| Cloud | Phase 18 tenant allow-list governs installs |
| Observability | Plugin health metrics in Phase 19 dashboards |
| Federation | Catalog visibility across peers (optional) |
| Governance | Auditable plugin lifecycle |
| AI ecosystem | Clear boundary: infrastructure vs external agent runtime |

---

## 9. Rollback

| Flag | Effect |
|------|--------|
| `PLUGIN_MARKETPLACE_ENABLED=false` | Env-selected adapters only — Phase 10 behavior |
| Disable admin plugin routes | No register/enable API; running adapters unchanged until restart |
| Remove marketplace catalog | Registry falls back to env defaults |

**MemoryService:** no rollback needed — never modified.

**Running plugins:** restart with flag OFF → composition root reads env vars only.

---

## 10. References

- [ADR-035](../../adr/035-ai-infrastructure-platform.md) — AI Infrastructure Platform decision
- [ADR-008](../../adr/008-ports-and-adapters.md) — Provider ports
- Phase 13 — Protocols
- Phase 14 — Federation
- Phases 16–19 — Enterprise stack
- [11-ENTERPRISE-ROADMAP.md](../roadmap/11-ENTERPRISE-ROADMAP.md)

*No implementation until ADR-035 Approved.*
