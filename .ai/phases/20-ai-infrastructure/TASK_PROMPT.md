# Phase 20 — TASK_PROMPT

**Blocked until ADR-035 Approved.**

Implement AI Infrastructure Platform as **capstone registry + marketplace + extended capability manifest** — plugins implement existing ADR-008 ports only; no MemoryService changes; agent runtime external.

## Deliverables

1. **`IPluginRegistry`** — register, enable, disable, list; env-only default (Phase 10 compat)
2. **`IProviderMarketplace`** — curated local JSON catalog; optional remote index
3. **`IPluginManifestValidator`** — signed manifest validation (ed25519)
4. **`IPluginAllowList`** — tenant-scoped enable set via Phase 18 control plane
5. **Extend `CapabilityManifestBuilder`** — infrastructure section across all protocols
6. **Plugin types:** Storage, Embedding, Vector, Graph, LLM — each wraps existing port interface
7. **Admin routes** (REST/gRPC additive) — gated Phase 17 policy + Phase 18 allow-list
8. **Federation hook** — optional read-only catalog metadata sync (Phase 14)
9. **Reference plugins** — one signed example per type (external or `plugins/` pattern)
10. Feature flag `PLUGIN_MARKETPLACE_ENABLED=false` default

## Constraints

- Clean Architecture: ports in `src/ports/infrastructure/`, adapters at composition root
- Plugins MUST NOT bypass MemoryService or embed business logic
- LLM plugins = inference ports only — not agent runtime
- No breaking REST v1 / MCP memory tool schemas
- No in-process untrusted code execution in v1
- Depends on Phases 16–19 for full enterprise integration (implement allow-list hooks as noop if 18 pending)

## Read first

- [DESIGN.md](DESIGN.md)
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- [MIGRATION_PLAN.md](MIGRATION_PLAN.md)
- [ADR-035](../../adr/035-ai-infrastructure-platform.md)
- [ADR-008](../../adr/008-ports-and-adapters.md)

## Gate

All [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) PASS · [CHECKLIST.md](CHECKLIST.md) complete · `npm test` green with flag OFF.
