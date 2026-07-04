# Phase 20 — CHECKLIST

## ADR & design

- [x] ADR-035 Approved / Implemented
- [x] DESIGN reviewed — plugin ≠ business logic boundary clear
- [x] MemoryService unchanged confirmed in code review
- [x] Agent runtime remains external — documented

## Ports & adapters

- [x] `IPluginRegistry` port + SQL / in-memory adapters
- [x] `IProviderMarketplace` port + local JSON catalog adapter
- [x] `IPluginManifestValidator` port + JSON schema validation
- [x] `IPluginAllowList` port + Phase 18 SQL integration (noop when control plane off)
- [x] `CapabilityManifestBuilder` extended with infrastructure section

## Plugin types (existing port interfaces)

- [x] Storage plugin maps to `ISqlDatabase`
- [x] Embedding plugin maps to `IEmbeddingProvider`
- [x] Vector plugin maps to `IVectorStore`
- [x] Graph plugin maps to `IGraphStore`
- [x] LLM plugin maps to `ILLMInferenceProvider` (inference boundary only)

## Marketplace & registry

- [x] Local curated catalog JSON in repo
- [x] Manifest schema validation documented in IMPLEMENTATION
- [x] Reference plugin per type in catalog
- [x] Enable/disable lifecycle + metric hook

## Cross-phase integration

- [ ] Phase 17 policy denies blocked plugin ids — deferred (allow-list covers tenant scope)
- [x] Phase 18 tenant allow-list governs enable
- [x] Phase 14 optional catalog metadata federation sync flag
- [x] Phase 19 plugin lifecycle metrics
- [ ] Phase 16 SDK admin methods — deferred (REST available)

## All protocols

- [x] REST `/capabilities` includes infrastructure section
- [ ] gRPC GetCapabilities extended — deferred (REST parity via shared handler deps)
- [ ] MCP capability snapshot updated — deferred
- [ ] WS/SSE optional capability on connect — deferred
- [ ] SDK/CLI `getCapabilities()` reflects manifest — deferred (Phase 16)

## Feature flags & compatibility

- [x] `PLUGIN_MARKETPLACE_ENABLED=false` default — Phase 10 env adapter behavior
- [x] Existing env adapter keys still functional
- [x] REST v1 memory routes unchanged
- [x] MCP memory tools unchanged

## Documentation & gate

- [ ] Plugin authoring guide (manifest + port implementation) — deferred
- [x] `.env.example` updated
- [x] [TESTING_PLAN.md](TESTING_PLAN.md) executed
- [x] [REVIEW.md](REVIEW.md) PASS — 2026-07-04

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — 2026-07-04 |
| **ADR** | ADR-035 |
| **Master flag** | `PLUGIN_MARKETPLACE_ENABLED=false` (default OFF) |
| **Regression** | 689 passed, 3 skipped (default env) |
| **Review** | [REVIEW.md](REVIEW.md) PASS |

---

*Frozen at gate PASS. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*