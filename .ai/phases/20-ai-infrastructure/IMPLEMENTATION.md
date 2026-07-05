# Phase 20 — AI Infrastructure Platform — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-035 Implemented](../../adr/035-ai-infrastructure-platform.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 20A | `IPluginRegistry` port + SQL / in-memory adapters | ✅ |
| 20B | `IProviderMarketplace` + local JSON catalog | ✅ |
| 20C | `IPluginManifestValidator` + schema validation | ✅ |
| 20D | `IPluginAllowList` + Phase 18 SQL hook | ✅ |
| 20E | `InfrastructureManifestBuilder` + capabilities merge | ✅ |
| 20F | REST `/infrastructure/*` admin API | ✅ |
| 20G | Curated provider catalog (9 plugins) | ✅ |
| 20H | Plugin lifecycle metric (`ratary_plugin_lifecycle_total`) | ✅ |

---

## File map

```
src/infrastructure-platform/
  types/           plugin + marketplace types
  ports/           IPluginRegistry, IProviderMarketplace, …
  adapters/        schema validator, local marketplace, noop allow-list
  catalog/         provider-plugin-catalog.ts (SSOT manifests)
  builders/        infrastructure-manifest-builder.ts
src/infrastructure/infrastructure-platform/
  sql-plugin-registry.ts
  sql-plugin-allow-list.ts
src/composition/create-infrastructure-platform-ports.ts
src/controllers/infrastructure.controller.ts
src/routes/v1/infrastructure.routes.ts
infrastructure/marketplace/catalog.json
tests/infrastructure-platform/
tests/api/infrastructure.test.ts
tests/db/infrastructure-platform-migration.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `PLUGIN_MARKETPLACE_ENABLED` | `false` | Master gate — off preserves Phase 10 env adapters |
| `PLUGIN_SIGNATURE_REQUIRED` | `false` | Require manifest signature + Ed25519 verify when trusted keys set |
| `PLUGIN_TRUSTED_PUBLIC_KEYS` | _(empty)_ | Comma-separated base64 raw Ed25519 public keys (32 bytes) |
| `PLUGIN_MARKETPLACE_SOURCE` | `local` | Catalog source (`local` / `remote` reserved) |
| `PLUGIN_FEDERATION_CATALOG_SYNC` | `false` | Publish catalog metadata to federation peers |

---

## REST endpoints (when enabled)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/infrastructure/status` | Bearer | Platform status |
| GET | `/api/v1/infrastructure/manifest` | Bearer | Infrastructure manifest |
| GET | `/api/v1/infrastructure/marketplace` | Public | Browse catalog |
| GET | `/api/v1/infrastructure/marketplace/:pluginId` | Public | Catalog entry |
| GET | `/api/v1/infrastructure/plugins` | Bearer | Registered plugins |
| POST | `/api/v1/infrastructure/plugins/register` | Bearer | Register manifest |
| POST | `/api/v1/infrastructure/plugins/:id/enable` | Bearer | Enable plugin (one per type) |
| POST | `/api/v1/infrastructure/plugins/:id/disable` | Bearer | Disable plugin |

---

## Plugin types (ADR-008 ports)

| Type | Port interface | Catalog examples |
|------|----------------|------------------|
| storage | `ISqlDatabase` | storage-d1, storage-postgres |
| embedding | `IEmbeddingProvider` | embedding-noop, embedding-openai |
| vector | `IVectorStore` | vector-d1, vector-pgvector |
| graph | `IGraphStore` | graph-d1, graph-neo4j |
| llm | `ILLMInferenceProvider` | llm-openai-inference (inference boundary only) |

---

## Deferred (documented)

- Ed25519 signature verification via `SignedPluginManifestValidator` + `PLUGIN_TRUSTED_PUBLIC_KEYS` (D20-01, 2026-07-05)
- Runtime adapter hot-swap — enable applies on process restart
- gRPC admin surface for plugin lifecycle
- Plugin authoring guide (external package pattern)

---

## Invariants

- `MemoryService` unchanged
- Default env (`PLUGIN_MARKETPLACE_ENABLED=false`) → Phase 10 env adapter selection
- LLM plugins = inference ports only — agent runtime remains external
- Phase 12 business event bus: no plugin handlers registered
