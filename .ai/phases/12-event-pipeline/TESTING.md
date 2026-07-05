# Phase 12 — Event Pipeline — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04

---

## Test coverage

| Area | File | Notes |
|------|------|-------|
| Composition root | `tests/composition/event-pipeline-ports.test.ts` | Default off; enabled wiring; auditor wrap |
| Publisher | `tests/events/domain-event-publisher.test.ts` | Publish + error isolation |
| Analytics consumer | `tests/events/memory-access-analytics.consumer.test.ts` | Idempotent insert |
| Manifest | `tests/capabilities/manifest-builder.test.ts` | `supportsEventConsumers` |
| Context audit fields | `tests/transport/context-audit-fields.test.ts` | D12-01 identity/IP → `buildContext` audit |

---

## Manual staging checklist

1. Set `EVENT_CONSUMERS_ENABLED=true`, `EVENT_BUS_PROVIDER=redis`, `REDIS_URL=...`
2. Optional: `ANALYTICS_PROVIDER=duckdb`, `MEMORY_ACCESS_AUDIT=true`
3. Start server → `EventConsumerRunner.start()` on REST boot
4. Create memory → verify `memory.created` on Redis stream
5. Build context → verify `memory.accessed` fan-out to DuckDB when analytics ON

---

## Default regression

Default env (`EVENT_CONSUMERS_ENABLED=false`) must pass full suite with no Redis dependency.

---

## Quality gate

```bash
npm run typecheck && npm run lint && npm test
```
## Current regression

840 passed | 3 skipped (default env, 2026-07-05) (full suite, all master flags OFF)
