# Phase 24 — AI-Brain Platform — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Composition gate | `tests/ai-brain-platform/ai-brain-platform-ports.test.ts` | enabled/disabled, webhook consumer |
| Manifest builder | `tests/ai-brain-platform/manifest-builder.test.ts` | planes + edition |
| Migration | `tests/db/ai-brain-platform-migration.test.ts` | webhook table |
| Admin REST | `tests/api/ai-brain-platform.test.ts` | status, manifest, webhook CRUD |
| Server regression | full `npm test` (673 tests) | MemoryService unchanged |

---

## Manual smoke

```bash
AI_BRAIN_PLATFORM_ENABLED=true \
PLATFORM_WEBHOOKS_ENABLED=true \
AI_BRAIN_PLATFORM_EDITION=enterprise \
EVENT_CONSUMERS_ENABLED=true EVENT_BUS_PROVIDER=redis \
npm run dev

curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/platform/manifest
curl -H "Authorization: Bearer aic_..." -X POST http://localhost:3000/api/v1/platform/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/hook","topics":["memory.created"]}'
```

---

## Quality gate

- [x] Default regression (`AI_BRAIN_PLATFORM_ENABLED=false`)
- [x] Webhook CRUD via REST when enabled
- [x] Capabilities `aiBrainPlatform` section when enabled
