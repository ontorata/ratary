# Phase 09.8 — Multi-Client Sync — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04 · MCP surface verified 2026-07-05

---

## Unit tests

| File | Coverage |
|------|----------|
| `tests/client-sync/conflict-aware-sync-manager.test.ts` | LWW reject, field merge accept, manual queue |
| `tests/client-sync/platform-registry.test.ts` | Known platforms, validation |
| `tests/sync/accept-sync-manager.test.ts` | Accept-all baseline (via SyncStaleDetector) |
| `tests/db/extension-tracks-migration.test.ts` | Phase 5 tables |
| `tests/capabilities/manifest-builder.test.ts` | `supportsMultiClientSync` |

---

## Integration tests

| File | Coverage |
|------|----------|
| `tests/api/client-sync.test.ts` | REST pull → push round-trip (`field_merge`) |
| `tests/mcp/sync-tools.test.ts` | MCP `sync_status`, `sync_pull`, `sync_push`; flag-off guard |

---

## Manual verification

```bash
MULTI_CLIENT_SYNC_ENABLED=true MULTI_CLIENT_SYNC_STORE_PROVIDER=sql npm run sync:status -- --platform=cursor --owner=<ownerId>
```

REST pull/push with `X-API-Key` + optional `X-Workspace-Id` when enterprise RBAC enabled.

MCP (stdio): `sync_status`, `sync_pull`, `sync_push` when `MULTI_CLIENT_SYNC_ENABLED=true`.

---

## Deferred

- Branch merge via 09.7 evolution on conflict

## Current regression

825+ passed at default env (2026-07-05); sync suites require `MULTI_CLIENT_SYNC_ENABLED=true` in test env.
