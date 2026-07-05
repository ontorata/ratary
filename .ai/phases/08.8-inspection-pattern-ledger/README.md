# Phase 8.8 — Inspection Pattern Ledger

**Status:** ✅ Implemented (2026-07-05) · ADR-059 Accepted  
**Capability:** Evidence-based institutional memory from inspection outcomes — workspace patterns, confidence lifecycle, Charter Patterns (optional). **Informs** Agent Forge Inspect and MCP recall.

**Flags:** `INSPECTION_LEDGER_ENABLED=false` · `INSPECTION_LEDGER_STORE_PROVIDER=sql` · `INSPECTION_CHARTER_ENABLED=false` (default)

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ Complete |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ PASS |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |
| [DELIVERY-TRACK.md](DELIVERY-TRACK.md) | Incremental ship order | ✅ Complete |

*Gate PASS 2026-07-05 · 804 tests (default env regression 0).*

---

## Quick start

```bash
# Enable signal + learning + ledger
SIGNAL_INGEST_ENABLED=true
SIGNAL_STORE_PROVIDER=sql
LEARNING_ENGINE_ENABLED=true
LEARNING_STORE_PROVIDER=sql
INSPECTION_LEDGER_ENABLED=true
INSPECTION_LEDGER_STORE_PROVIDER=sql

# Dry-run miner
npm run inspection:mine

# Execute — upsert patterns, refresh confidence, link recall memories
npm run inspection:mine:execute

# List patterns (REST, auth required)
GET /api/v1/inspection-patterns?path=src/ingest/
```

MCP: `submit_signal` with `type: inspection_outcome` · recall: `search_memory` tag `inspection-pattern`

---

## Related

- Phase 8.5 signals: [08.5-observation-reflection-learning](../08.5-observation-reflection-learning/README.md)
- Phase 8.6 learning: [08.6-learning-intelligence](../08.6-learning-intelligence/README.md)
- Phase 7.1 Forge: [07.1-agent-forge](../07.1-agent-forge/README.md)
- ADR: [ADR-059](../../adr/059-inspection-pattern-ledger.md)
