# Phase 21 — Search & Graph Production — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Orchestrator | `tests/search-graph-platform/orchestrator.test.ts` | run lifecycle, watermark |
| Composition gate | `tests/search-graph-platform/search-graph-ports.test.ts` | enabled/disabled |
| Migration | `tests/db/search-graph-platform-migration.test.ts` | sync tables |
| Admin REST | `tests/api/search-graph.test.ts` | status, manifest, dry-run sync |
| Server regression | full `npm test` (644 tests) | MemoryService unchanged |

---

## Manual smoke

```bash
SEARCH_GRAPH_PLATFORM_ENABLED=true \
MEILISEARCH_HOST=http://127.0.0.1:7700 MEILISEARCH_INDEX=memories \
NEO4J_URI=bolt://localhost:7687 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=secret \
npm run dev

curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/search-graph/status
curl -H "Authorization: Bearer aic_..." -X POST http://localhost:3000/api/v1/search-graph/sync/search \
  -H "Content-Type: application/json" -d '{"mode":"full","dryRun":true}'
```

CLI backfill still available:

```bash
npm run db:backfill-meilisearch:execute
npm run db:backfill-neo4j:execute
```

---

## Quality gate

- [x] Default regression (`SEARCH_GRAPH_PLATFORM_ENABLED=false`)
- [x] Dry-run search sync without external Meilisearch call
- [x] Capabilities `searchGraph` section when enabled
