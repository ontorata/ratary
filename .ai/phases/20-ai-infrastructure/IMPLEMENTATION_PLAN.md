# Phase 20 — IMPLEMENTATION_PLAN

**Principle:** One concern per commit. Capstone layer only — MemoryService untouched. Plugins implement ADR-008 ports.

| # | Commit | Scope |
|---|--------|-------|
| 1 | `docs(adr): approve ADR-035` | ADR status → Approved |
| 2 | `feat(infra): IPluginRegistry port + env-only adapter` | Phase 10 compat default |
| 3 | `feat(infra): IPluginManifestValidator port` | ed25519 + JSON Schema |
| 4 | `feat(infra): IProviderMarketplace port + local catalog` | `infrastructure/marketplace/` |
| 5 | `feat(infra): extend CapabilityManifestBuilder` | Infrastructure section |
| 6 | `feat(infra): REST /capabilities extension` | Additive JSON fields |
| 7 | `feat(infra): gRPC GetCapabilities extension` | Additive proto fields |
| 8 | `feat(infra): MCP capability snapshot update` | Non-breaking metadata |
| 9 | `feat(infra): admin plugin REST routes` | Register/enable/disable; Phase 17 auth |
| 10 | `feat(infra): admin plugin gRPC service` | Additive |
| 11 | `feat(infra): IPluginAllowList + Phase 18 hook` | Tenant allow-list |
| 12 | `feat(infra): composition root plugin resolution` | Enable overrides env per type |
| 13 | `feat(infra): reference storage plugin package` | Signed manifest example |
| 14 | `feat(infra): reference embedding/vector/graph/llm plugins` | One per type |
| 15 | `feat(infra): federation catalog sync hook` | Phase 14 optional |
| 16 | `feat(infra): plugin lifecycle metrics` | Phase 19 registrars |
| 17 | `chore(env): PLUGIN_MARKETPLACE_ENABLED flag` | `.env.example` |
| 18 | `docs(infra): plugin authoring guide` | Manifest + ports |
| 19 | `docs(sdk): Phase 16 admin capability methods` | Additive SDK docs |
| 20 | `test(infra): registry, validator, manifest, protocol parity` | Per TESTING_PLAN |
| 21 | `docs(phase): gate evidence` | TESTING, COMPLETION |

## Composition root wiring

```
PLUGIN_MARKETPLACE_ENABLED=true  → IPluginRegistry resolves enabled plugins
PLUGIN_MARKETPLACE_ENABLED=false → env vars only (Phase 10)
```

## Plugin resolution order (when enabled)

1. Tenant allow-list (Phase 18) — filter available plugins
2. Phase 17 policy — deny blocked ids
3. Enabled plugin in registry — per type
4. Fallback — env var adapter name (Phase 10)

## Blockers

- ADR-035 Approved before commit 2
- Phase 17 auth for admin routes (minimum)
- Phase 18 allow-list — noop adapter acceptable for initial merge if 18 pending

## Post-capstone

Phases 21 (Search & Graph Production) and 22 (Content & Vector Scale) build on stable infrastructure surface — no Phase 20 scope change required.
