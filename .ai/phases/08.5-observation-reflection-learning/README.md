# Phase 8.5 — Quality Signals (Observation, Reflection & Learning)

**Status:** ✅ Implemented (2026-07-04) · ADR-026 Accepted · **D85-01–06 open with mitigations**  
**Capability:** Scoped signal ingest, deterministic importance scoring, optional audit store. **No agent reflection loops in repo.**

**Flag:** `SIGNAL_INGEST_ENABLED=false` (default)

### Platform snapshot (2026-07-05)

| Surface | Status | Reference |
|---------|--------|-----------|
| REST ingest | `POST /api/v1/signals` (gated) | **Mitigates D85-01** until MCP tool |
| Signal store | `memory_signals` (SQL opt-in) | ADR-026 migration |
| Importance deltas | Bounded pure policy + `bumpImportance` | **Mitigates D85-03** hot path |
| Manifest | `supportsQualitySignals` | Phase 7.5 capability builder |
| Learning bridge | `LearningEventRecorder` when **8.6** also ON | **Mitigates D85-02** partial |
| Regression suite | **736 passed** \| 3 skipped | `npm test` |

*Deferred: MCP `submit_signal` (D85-01), bus publish (D85-02), batch rank weights (D85-03) — see [DESIGN.md § Compatibility](DESIGN.md).*

### Successor phases

| Phase | Relationship |
|-------|--------------|
| **8.6** | Async learning events from signal ingest (`LearningEventRecorder`) |
| **12** | Domain topic `memory.signal.received` — bus publisher deferred |
| **13.1** | Target for MCP `submit_signal` (remote clients) |

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ Complete |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04.*


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
- Phase 8.6 learning intelligence: [08.6-learning-intelligence](../08.6-learning-intelligence/README.md) — ✅ `LearningEventRecorder` bridge
- Phase 12 event bus: [12-event-pipeline](../12-event-pipeline/README.md) — `memory.signal.received` publisher deferred
