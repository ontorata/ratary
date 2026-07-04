# Phase 23 — Enterprise Knowledge Fabric — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Orchestrator | `tests/knowledge-fabric-platform/orchestrator.test.ts` | dry-run ingest lifecycle |
| Composition gate | `tests/knowledge-fabric-platform/knowledge-fabric-ports.test.ts` | enabled/disabled |
| Migration | `tests/db/knowledge-fabric-platform-migration.test.ts` | fabric tables |
| Admin REST | `tests/api/knowledge-fabric.test.ts` | status, manifest, dry-run ingest |
| Server regression | full `npm test` (664 tests) | MemoryService unchanged |

---

## Manual smoke

```bash
KNOWLEDGE_FABRIC_ENABLED=true \
KNOWLEDGE_FABRIC_CATALOG_JSON='{"notion":[{"externalId":"p1","title":"Doc","body":"Hello","updatedAt":"2026-07-04T00:00:00.000Z","metadata":{}}]}' \
npm run dev

curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/knowledge-fabric/status
curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/knowledge-fabric/connectors
curl -H "Authorization: Bearer aic_..." -X POST http://localhost:3000/api/v1/knowledge-fabric/ingest/notion \
  -H "Content-Type: application/json" -d '{"mode":"full","dryRun":true}'
```

---

## Quality gate

- [x] Default regression (`KNOWLEDGE_FABRIC_ENABLED=false`)
- [x] Dry-run ingest via catalog JSON without external API
- [x] Capabilities `knowledgeFabric` section when enabled
