# Phase 22 — Content & Vector Scale — TESTING

**Status:** Implemented (2026-07-04)

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Orchestrator | `tests/content-scale-platform/orchestrator.test.ts` | run lifecycle, watermark |
| Composition gate | `tests/content-scale-platform/content-scale-ports.test.ts` | enabled/disabled |
| Backfill lib | `tests/content-scale-platform/content-offload-backfill.test.ts` | dry-run offload count |
| Migration | `tests/db/content-scale-platform-migration.test.ts` | sync tables |
| Admin REST | `tests/api/content-scale.test.ts` | status, manifest, dry-run sync |
| Server regression | full `npm test` (655 tests) | MemoryService unchanged |

---

## Manual smoke

```bash
CONTENT_SCALE_PLATFORM_ENABLED=true \
OBJECT_STORAGE_PROVIDER=r2 R2_BUCKET=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
VECTOR_PROVIDER=pgvector PGVECTOR_DATABASE_URL=postgresql://... \
EMBEDDING_PROVIDER=openai EMBEDDING_API_KEY=sk-... \
npm run dev

curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/content-scale/status
curl -H "Authorization: Bearer aic_..." -X POST http://localhost:3000/api/v1/content-scale/sync/content \
  -H "Content-Type: application/json" -d '{"mode":"full","dryRun":true}'
```

CLI backfill still available:

```bash
npm run db:backfill-pgvector:execute
npm run db:backfill-embeddings:execute
```

---

## Quality gate

- [x] Default regression (`CONTENT_SCALE_PLATFORM_ENABLED=false`)
- [x] Dry-run content sync without external R2 call (orchestrator + API)
- [x] Capabilities `contentScale` section when enabled
