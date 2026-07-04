# Phase 12 — Event Pipeline — TESTING

**Status:** Implemented (2026-07-04)

---

## Test coverage

| Area | File | Notes |
|------|------|-------|
| Composition root | `tests/composition/event-pipeline-ports.test.ts` | Default off; enabled wiring; auditor wrap |
| Publisher | `tests/events/domain-event-publisher.test.ts` | Publish + error isolation |
| Analytics consumer | `tests/events/memory-access-analytics.consumer.test.ts` | Idempotent insert |
| Manifest | `tests/capabilities/manifest-builder.test.ts` | `supportsEventConsumers` |

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
