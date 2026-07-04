# ADR-026: Memory Quality Signals (Ingest, Not Agent Learning)

**Status:** Implemented  
**Approved:** 2026-07-04 (owner — DESIGN + implementation plan)  
**Implemented:** 2026-07-04 — `IMemorySignalIngestor`, `POST /api/v1/signals`, `reflect:signals` CLI  

---

## Context

Phase 4 added access tracking (`recordAccess`, `access_count`, `last_accessed`). ADR-017 defines opt-in memory access audit. Phase 12 (post-roadmap) plans event fan-out. Architecture Review (2026-07-04) approved **Phase 8.5** under the label *Observation, Reflection & Learning* with **Constitution-constrained definitions**:

- **Observation** = scoped signal ingest  
- **Reflection** = deterministic batch recompute of ranking weights (pure)  
- **Learning** = bounded importance/weight adaptation — **not** ML training or agent loops  

Design reference: [.ai/phases/08.5-observation-reflection-learning/DESIGN.md](../../.ai/phases/08.5-observation-reflection-learning/DESIGN.md)

Related: [ADR-016](016-redis-streams-event-bus.md), [ADR-017](017-memory-access-audit.md), Phase 7 boundary.

---

## Problem

| Gap today | Need |
|-----------|------|
| Access counted but underused for ranking | **MemoryQualitySignal** contract |
| No explicit user feedback channel | Optional `POST /api/v1/signals` |
| Ranking weights static in config | Rule-based **ImportanceScoringPolicy** (pure) |
| Consolidation triggers manual | Signal type `consolidation_hint` |
| Audit events partial (ADR-017) | Align with Phase 12 event schema |

Risk if unnamed: implement agent reflection, LLM self-correction, or autonomous memory rewrite inside repo — **Constitution violation**.

---

## Constraints

- **Explicit non-goals:** agent reflection loops, LLM introspection, online model training, goal stacks, autonomous MCP self-calls.
- Signals are **inputs**, not commands — cannot delete memories or bypass auth.
- Every signal scoped by `ownerId`; workspace/org when active (ADR-002/007/010).
- Idempotent ingest by `signalId`.
- `SIGNAL_INGEST_ENABLED=false` → no behavior change vs today.
- Extend `Ranker` inputs only — no `RankerV2`.
- Implementation blocked until **Approved**.

---

## Alternatives

### Option A — `IMemorySignalIngestor` port + pure scoring policy + optional append-only store

- Pros: Clear boundary; aligns with Phase 12 events; testable.
- Cons: Optional schema for `memory_signals` table.

### Option B — Full agent reflection pipeline in repo

- Pros: Rich adaptive memory.
- Cons: **Rejected** — Phase 7 externalizes agent runtime; Constitution §55.

### Option C — External analytics only (no in-repo ingest)

- Pros: Zero foundation code.
- Cons: Cannot affect ranking/importance in product; fails Phase 8.5 goal.

---

## Decision

**Adopt Option A** (pending owner Approval):

1. **Ports:** `ISignalNormalizer`, `IMemorySignalIngestor`, pure `ImportanceScoringPolicy`.
2. **Signal types:** `access` (internal), `explicit_feedback`, `consolidation_hint`, `ingest`.
3. **Effects:** bounded `bumpImportance` (±5 default); access via existing path; consolidation hint flags job only.
4. **Reflection job:** `npm run reflect:signals --dry-run` — batch weight recompute; **pure config output**, no LLM.
5. **Optional REST:** `POST /api/v1/signals`; optional MCP `submit_signal` — env-gated.
6. **Optional storage:** append-only `memory_signals` table OR analytics via `IEventBus` (Phase 12).
7. **Env:** `SIGNAL_INGEST_ENABLED=false`, `RANKING_ADAPTATION_ENABLED=false` defaults.

---

## Tradeoffs

- Bounded adaptation may miss nuanced feedback vs ML — acceptable; external agents handle reasoning.
- Optional table adds ops surface — mitigated by event-only deployment mode.
- Terminology "reflection/learning" requires doc discipline to avoid scope creep.

---

## Migration

1. Optional idempotent migration: `memory_signals` table, `memories.lifecycle_state` nullable.
2. Ship ingest behind master flag.
3. Document `memory.signal.received` event shape for Phase 12.
4. No change to existing CRUD when disabled.

---

## Rollback

1. Disable env flags.
2. Signals table append-only — no rollback of ingested audit required for product function.

---

## Impact on future phases

| Phase / track | Impact |
|---------------|--------|
| 5.5 Compression | `consolidation_hint` triggers policy |
| 6.5 Progressive Retrieval | Access signals adjust adaptive caps |
| 7.5 Manifest | `supportsQualitySignals` |
| 12 Event Pipeline | Primary fan-out for signals/analytics |
| 13 Scale | Batch reflection at volume |

---

## References

- [.ai/phases/08.5-observation-reflection-learning/DESIGN.md](../../.ai/phases/08.5-observation-reflection-learning/DESIGN.md)
- [ADR-016](016-redis-streams-event-bus.md)
- [ADR-017](017-memory-access-audit.md)
- [.ai/phases/07-agent-runtime/DESIGN.md](../../.ai/phases/07-agent-runtime/DESIGN.md) §7
- [00-CONSTITUTION.md](../../.ai/core/constitution/00-CONSTITUTION.md)
- [POLICY.md](POLICY.md)
