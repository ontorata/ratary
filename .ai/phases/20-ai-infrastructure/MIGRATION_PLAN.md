# Phase 20 — MIGRATION_PLAN

## Compatibility matrix

| Deployment | Before Phase 20 | After (flag OFF) | After (flag ON) |
|------------|-----------------|------------------|-----------------|
| Env adapter selection | Phase 10 `STORAGE_ADAPTER=…` | **Identical** | Env fallback if no plugin enabled |
| REST v1 memory | Frozen | **Unchanged** | Unchanged |
| MCP memory tools | Frozen | **Unchanged** | Unchanged |
| `/capabilities` | Phase 7.5 manifest | Same + ignored infra fields | Full infrastructure section |
| Single-node dev | Works | **Identical** | + marketplace admin (optional) |

## Rollout phases

### R1 — Manifest extension only

- Ship extended `/capabilities` with infrastructure section (empty/plugins from env)
- `PLUGIN_MARKETPLACE_ENABLED=false`
- SDK/CLI parse new fields — backward compatible

### R2 — Registry dark launch

- Enable registry internally; auto-register current env adapters as manifests
- No marketplace UI/API for tenants yet

### R3 — Marketplace beta

- Enable flag for pilot tenants
- Local catalog + signed reference plugins
- Phase 17 policy + Phase 18 allow-list enforced

### R4 — GA capstone

- Document plugin authoring guide
- Federation catalog sync optional
- Enterprise positioning docs updated

## Env → plugin migration path

| Step | Operator action |
|------|-----------------|
| EP1 | Document mapping: `STORAGE_ADAPTER=sqlite` → plugin id `storage-sqlite` |
| EP2 | Auto-register running env adapters on first boot (synthetic manifest) |
| EP3 | Operator enables plugin via admin API — same adapter, auditable lifecycle |
| EP4 | Deprecation notice for direct env selection (semver major future — not Phase 20 breaking) |

**Phase 20 does NOT remove env vars** — they remain fallback.

## Data migration

| Step | Action | Reversible |
|------|--------|------------|
| DM1 | Additive tables: `plugin_registry`, `plugin_enablements`, `marketplace_cache` | Yes |
| DM2 | Backfill: register env-selected adapters | Yes |
| DM3 | No MemoryService data migration | N/A |

## Rollback procedure

1. Set `PLUGIN_MARKETPLACE_ENABLED=false`
2. Restart — composition root uses env vars only
3. Admin plugin routes disabled
4. Extended capability fields may remain (ignored by old clients) — non-breaking
5. Optional: truncate plugin tables

## Federation migration

- Default: `FEDERATION_CATALOG_SYNC=false`
- Enable per peer when operators want cross-node catalog visibility
- No automatic plugin install across peers in v1

## Downstream (Phase 21/22)

- Search/graph production plugins appear in marketplace catalog as they ship
- Content scale plugins register under vector/storage types
- No Phase 20 redesign required

## No migration required for

- Memory records
- Agent runtime (external)
- Client SDK memory CRUD (unchanged)
