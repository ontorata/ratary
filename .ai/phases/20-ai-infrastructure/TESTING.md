# Phase 20 — AI Infrastructure Platform — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Composition gate | `tests/infrastructure-platform/infrastructure-ports.test.ts` | enabled/disabled ports |
| Manifest validator | `tests/infrastructure-platform/manifest-validator.test.ts` | schema + signature gate |
| Plugin registry | `tests/infrastructure-platform/plugin-registry.test.ts` | register/enable/bootstrap |
| Marketplace | `tests/infrastructure-platform/marketplace.test.ts` | catalog.json load/search |
| Migration | `tests/db/infrastructure-platform-migration.test.ts` | plugin_registry tables |
| Admin REST | `tests/api/infrastructure.test.ts` | marketplace, lifecycle, capabilities |
| Server regression | full `npm test` | MemoryService unchanged |

---

## Manual smoke

```bash
PLUGIN_MARKETPLACE_ENABLED=true npm run dev

curl http://localhost:3000/api/v1/infrastructure/marketplace
curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/infrastructure/plugins
curl -H "Authorization: Bearer aic_..." -X POST http://localhost:3000/api/v1/infrastructure/plugins/storage-postgres/enable
curl http://localhost:3000/api/v1/capabilities
```

With tenant allow-list (Phase 18):

```bash
PLUGIN_MARKETPLACE_ENABLED=true CONTROL_PLANE_ENABLED=true npm run dev
```

---

## Quality gate

- [x] Default regression (`PLUGIN_MARKETPLACE_ENABLED=false`)
- [x] Infrastructure API subset with flags ON
- [x] Public marketplace browse without auth
- [x] Capabilities infrastructure section when enabled
- [x] Allow-list deny path when `CONTROL_PLANE_ENABLED=true`
