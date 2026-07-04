# Phase 8.5 — Quality Signals (Observation, Reflection & Learning)

**Status:** ✅ Implemented (2026-07-04) · ADR-026 Accepted  
**Capability:** Scoped signal ingest, deterministic importance scoring, optional audit store. **No agent reflection loops in repo.**

**Flag:** `SIGNAL_INGEST_ENABLED=false` (default)

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Observation pipeline, ports, Constitution boundaries |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification strategy and evidence |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist — all tracks ✅ |

**ADR:** [ADR-026](../../../docs/adr/026-memory-quality-signals.md)

---

## Quick start

```bash
# Enable in .env
SIGNAL_INGEST_ENABLED=true
SIGNAL_STORE_PROVIDER=sql

# Submit explicit feedback (REST)
curl -X POST http://localhost:3000/api/v1/signals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"signalId":"...","signalType":"explicit_feedback","memoryId":"...","payload":{"value":"helpful"}}'

# Batch reflection (advisory-only, dry-run default)
npm run reflect:signals
npm run reflect:signals -- --execute
```

Manifest reports `capabilities.supportsQualitySignals: true` when ingest enabled.

---

## Related

- Phase 4 access tracking baseline: [04-memory-intelligence](../04-memory-intelligence/README.md)
- Phase 5.5 `consolidation_hint` consumer: [05.5-semantic-compression](../05.5-semantic-compression/README.md)
- Phase 7.5 manifest flag: [07.5-runtime-compatibility](../07.5-runtime-compatibility/README.md)
- Phase 8.6 learning intelligence (future): [08.6-learning-intelligence](../08.6-learning-intelligence/README.md)
