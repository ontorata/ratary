# Phase 20 — ARCHITECTURE_UPDATE

**Target document:** [.ai/core/architecture/04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Apply when:** ADR-035 **Approved**.

---

## Sections to add or extend

### 1. AI Infrastructure capstone

Replace "planned" enterprise table row for Phase 20 with **implemented design**:

> AI Brain = **AI Memory Infrastructure** — unified entry via REST, gRPC, MCP, WebSocket, SSE, SDK, CLI, Dashboard, Federation.

### 2. Plugin registry ports

| Port | Location | Default |
|------|----------|---------|
| `IPluginRegistry` | `src/ports/infrastructure/` | Env-only (Phase 10 compat) |
| `IProviderMarketplace` | `src/ports/infrastructure/` | Local JSON catalog |
| `IPluginManifestValidator` | `src/ports/infrastructure/` | Ed25519 + JSON Schema |
| `IPluginAllowList` | `src/ports/infrastructure/` | Phase 18 control plane |

### 3. Provider port matrix (existing — formalize)

| Category | Port | Plugin manifest field |
|----------|------|----------------------|
| Storage | `IStorageProvider` | `storage` |
| Embedding | `IEmbeddingProvider` | `embedding` |
| Vector | `IVectorStore` | `vector` |
| Graph | `IGraphStore` | `graph` |
| LLM | `ILLMInferenceProvider` | `llm` |

### 4. Composition root wiring

Document: `PLUGIN_MARKETPLACE_ENABLED=false` → env-selected adapters (Phase 10 behavior preserved).

### 5. Cross-phase integration diagram

```
Phase 17 IPolicyEngine → plugin enable deny
Phase 18 IControlPlane → tenant allow-list
Phase 16 SDK → marketplace browse API
Phase 19 observability → per-provider metrics
```

---

## Sections unchanged

- All provider implementations remain **adapters** (ADR-008)
- Agent runtime **forbidden in repo**
- MemoryService unchanged

---

## Verification checklist

- [ ] Capstone language: "Infrastructure not API-only"
- [ ] Rollback = flag off → Phase 10 env adapters
- [ ] Link ADR-035
