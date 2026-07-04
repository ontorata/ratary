# Phase 18 — Cloud Platform — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Composition gate | `tests/cloud/cloud-ports.test.ts` | enabled/disabled ports, event consumer |
| Control plane unit | `tests/cloud/control-plane.service.test.ts` | provision, deprovision, topology |
| Usage consumer | `tests/cloud/usage-meter.consumer.test.ts` | Phase 12 → meter |
| Migration | `tests/db/cloud-platform-migration.test.ts` | Phase 18 tables |
| Admin REST | `tests/api/cloud.test.ts` | status, provision, topology, disabled 404 |
| Server regression | full `npm test` (599 tests) | MemoryService unchanged |

---

## Manual smoke

```bash
CONTROL_PLANE_ENABLED=true USAGE_METER_ENABLED=true DR_PLATFORM_ENABLED=true npm run dev

curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/cloud/status
curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/cloud/regions
curl -X POST -H "Authorization: Bearer aic_..." -H "Content-Type: application/json" \
  -d '{"organizationId":"org-1","workspaceId":"ws-1","ownerId":"..."}' \
  http://localhost:3000/api/v1/cloud/workspaces/provision
```

---

## Quality gate

- [x] Default regression (`CONTROL_PLANE_ENABLED=false`) — 599 tests green
- [x] Cloud API subset with flags ON
- [x] No MemoryService diff in `src/services/`
