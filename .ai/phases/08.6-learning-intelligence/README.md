# Phase 8.6 — Learning Intelligence Engine

**Status:** ✅ Implemented (2026-07-04) · ADR-057 Accepted  
**Capability:** Async policy learning from signals — ranking snapshots, behavior analytics, component engine stubs. **No SSOT mutation on hot path.**

**Flag:** `LEARNING_ENGINE_ENABLED=false` (default)

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Architecture, ports, Constitution boundaries |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification strategy and evidence |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist — W1–W3 ✅ |
| [DELIVERY-TRACK.md](DELIVERY-TRACK.md) | L21–L30 incremental waves |

**ADR:** [ADR-057](../../../docs/adr/057-learning-intelligence-engine.md)

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
| W2 | L23, L25 pattern/discovery stubs | 🔲 Stub |
| W3 | L26 adaptive ranking snapshot | ✅ |
| W4–W5 | L24, L27–L30 | 🔲 Deferred |

---

## Related

- Phase 8.5 signal ingest: [08.5-observation-reflection-learning](../08.5-observation-reflection-learning/README.md)
- Phase 6.5 retrieval policy consumer: [06.5-progressive-retrieval](../06.5-progressive-retrieval/README.md)
- Roadmap L21–L30: [15-LEARNING-TRACK-L21-L30.md](../roadmap/15-LEARNING-TRACK-L21-L30.md)
