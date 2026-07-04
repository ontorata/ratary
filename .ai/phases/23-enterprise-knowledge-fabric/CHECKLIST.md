# Phase 23 — CHECKLIST

## ADR & design

- [x] ADR-047 Approved / Implemented
- [x] DESIGN reviewed — writes via MemoryService only
- [x] Distinct from Phase 14 federation confirmed

## Ports & adapters

- [x] `IKnowledgeConnector` + registry (10 connector types)
- [x] `IFabricNormalizer` + `DefaultFabricNormalizer`
- [x] `IFabricPolicy` + `RuleBasedFabricPolicy`
- [x] `IFabricExternalRefStore` + SQL tables
- [x] `KnowledgeFabricOrchestrator`
- [x] `CapabilityManifestBuilder` extended with `knowledgeFabric` section

## Production validation

- [x] Catalog JSON ingest path validated in tests
- [x] Env token presence check for connectors
- [ ] Live Slack/GitHub/Notion API smoke — deferred (vendor SDK)

## Feature flags

- [x] `KNOWLEDGE_FABRIC_ENABLED=false` default
- [x] `KNOWLEDGE_FABRIC_CATALOG_JSON={}` default

## Documentation & gate

- [x] `.env.example` updated
- [x] [TESTING.md](TESTING.md) executed
