# Phase 20 — CHECKLIST

## ADR & design

- [ ] ADR-035 Approved
- [ ] DESIGN reviewed — plugin ≠ business logic boundary clear
- [ ] MemoryService unchanged confirmed in code review
- [ ] Agent runtime remains external — documented

## Ports & adapters

- [ ] `IPluginRegistry` port + env-only adapter (default, Phase 10 compat)
- [ ] `IProviderMarketplace` port + local JSON catalog adapter
- [ ] `IPluginManifestValidator` port + ed25519 + JSON Schema validation
- [ ] `IPluginAllowList` port + Phase 18 integration (noop if unavailable)
- [ ] `CapabilityManifestBuilder` extended with infrastructure section

## Plugin types (existing port interfaces)

- [ ] Storage plugin implements `IStorageProvider`
- [ ] Embedding plugin implements `IEmbeddingProvider`
- [ ] Vector plugin implements `IVectorStore`
- [ ] Graph plugin implements `IGraphStore`
- [ ] LLM plugin implements `ILLMInferenceProvider` (inference boundary only)

## Marketplace & registry

- [ ] Local curated catalog JSON in repo
- [ ] Signed manifest format documented
- [ ] Reference plugin per type (or external package pattern)
- [ ] Enable/disable lifecycle audited

## Cross-phase integration

- [ ] Phase 17 policy denies blocked plugin ids
- [ ] Phase 18 tenant allow-list governs enable
- [ ] Phase 14 optional catalog metadata federation sync
- [ ] Phase 19 plugin lifecycle metrics
- [ ] Phase 16 SDK admin methods documented (additive)

## All protocols

- [ ] REST `/capabilities` includes infrastructure section
- [ ] gRPC GetCapabilities extended (additive)
- [ ] MCP capability snapshot updated (non-breaking)
- [ ] WS/SSE optional capability on connect
- [ ] SDK/CLI `getCapabilities()` reflects manifest

## Feature flags & compatibility

- [ ] `PLUGIN_MARKETPLACE_ENABLED=false` default — Phase 10 env adapter behavior
- [ ] Existing env adapter keys still functional
- [ ] REST v1 memory routes unchanged
- [ ] MCP memory tools unchanged

## Documentation & gate

- [ ] Plugin authoring guide (manifest + port implementation)
- [ ] `.env.example` updated
- [ ] [TESTING_PLAN.md](TESTING_PLAN.md) executed
- [ ] [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) PASS
