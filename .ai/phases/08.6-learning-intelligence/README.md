# Phase 8.6 — Learning Intelligence Engine

**Status:** ✅ Implemented (2026-07-04) · ADR-057 Accepted  
**Capability:** Async policy learning from signals — ranking snapshots, behavior analytics, component engine stubs. **No SSOT mutation on hot path.**

**Flag:** `LEARNING_ENGINE_ENABLED=false` (default)

### Platform snapshot (post-gate — 2026-07-04)

| Surface | Status | Reference |
|---------|--------|-----------|
| Orchestrator | `LearningOrchestrator` (L21) | `src/learning/learning-orchestrator.ts` |
| Behavior analytics | L22 | `DefaultBehaviorAnalyticsEngine` |
| Adaptive ranking | L26 snapshot → Ranker | `DefaultRankingLearningEngine` + `rankingSnapshotLoader` |
| Event feed | From Phase 8.5 signals | `LearningEventRecorder` when both flags ON |
| Stewardship | `RankingRefreshTask` | Phase 04.7 stage `ranking-refresh` |
| Stores | `learning_events`, `learning_policy_snapshots` | ADR-057 migration |
| Manifest | `supportsLearningEngine` | capability builder |
| Regression suite | **722 passed** \| 3 skipped | `npm test` |

*Gate (2026-07-04): **689 tests**, W1 + L26. L23–L25 / L24 / L27–L30 remain stubs — see CHECKLIST D86-xx.*

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
# Enable in .env (requires Phase 8.5 signals for event feed)
SIGNAL_INGEST_ENABLED=true
SIGNAL_STORE_PROVIDER=sql
LEARNING_ENGINE_ENABLED=true
LEARNING_STORE_PROVIDER=sql

# Dry-run — reports analytics + would-be snapshot
npm run learning:run

# Execute — persists ranking policy snapshot
npm run learning:run:execute

# Per owner
npm run learning:run -- --owner=<ownerId>
```

Manifest reports `capabilities.supportsLearningEngine: true` when flag enabled. Active ranking snapshots adjust retrieval boosts in `ContextService` (bounded 0.8–1.2×).

---

## Implemented waves

| Wave | Tracks | Status |
|------|--------|--------|
| W1 | L21 foundation, L22 behavior analytics | ✅ |
| W2 | L23, L25 pattern/discovery | 🔲 Stub (D86-02) → **08.8** owns L23 inspection miner |
| W3 | L26 adaptive ranking | ✅ |
| W3 | L24 recommendation, L27 feedback | 🔲 Deferred (D86-01, D86-03) · **L27 inspection → 08.8** |
| W4–W5 | L28–L30 dataset / ML / eval | 🔲 Deferred (D86-03) |

---

## Related

- Phase 8.5 signal ingest: [08.5-observation-reflection-learning](../08.5-observation-reflection-learning/README.md) — ✅ event feed
- Phase 04.7 stewardship: [04.7-memory-stewardship](../04.7-memory-stewardship/README.md) — ✅ `RankingRefreshTask`
- Phase 6.5 retrieval policy: [06.5-progressive-retrieval](../06.5-progressive-retrieval/README.md) — Ranker consumer
- Roadmap L21–L30: [15-LEARNING-TRACK-L21-L30.md](../roadmap/15-LEARNING-TRACK-L21-L30.md)
- Phase 8.8 inspection ledger: [08.8-inspection-pattern-ledger](../08.8-inspection-pattern-ledger/README.md) — 🔲 Design
