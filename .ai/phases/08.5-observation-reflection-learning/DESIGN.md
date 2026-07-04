# Phase 8.5 — Observation, Reflection & Learning — DESIGN

**Document:** DESIGN  
**Phase status:** Ready (Architecture Review approved 2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) · [Phase 7 Boundary](../07-agent-runtime/DESIGN.md)  
**Roadmap placement:** Track absorbed into **Phase 12 Event Pipeline** + memory domain extensions  
**ADR gate (draft):** [ADR-026](../../../docs/adr/026-memory-quality-signals.md) — **Proposed**

---

## Purpose

Define an **observation and quality-signal pipeline** that ingests usage data, normalizes it, and influences memory metadata and ranking **deterministically** — without implementing agent reflection, autonomous learning loops, or reasoning inside the memory foundation.

**Naming note:** This phase retains the stakeholder label *Observation, Reflection & Learning* but **redefines** terms per Constitution:

| Term in phase name | Meaning in AI Brain | Forbidden meaning |
|--------------------|---------------------|-------------------|
| **Observation** | Ingest scoped signals (access, explicit feedback, ingest events) | Agent self-observation loops |
| **Reflection** | *Structured replay* of signals into rank weights (pure function) | LLM reflection / chain-of-thought |
| **Learning** | *Bounded adaptation* of ranking weights and importance from signals | Online ML training / model updates |

Phase 8.5 adds:

- **`IMemorySignalIngestor`** port — accept normalized signals
- **`ISignalNormalizer`** — map external events → `MemoryQualitySignal`
- **Importance scoring extensions** — feed `Ranker` inputs (pure)
- **Memory lifecycle hooks** — coordinate with consolidator (Phase 4/5.5)
- **Optional signal audit store** — append-only (Phase 12 alignment)

Phase 8.5 does **not** add planner, executor, goal stack, or autonomous memory mutation.

---

## Scope

### Inside this repository

| Capability | Status |
|------------|--------|
| `IMemorySignalIngestor` port | New |
| `ISignalNormalizer` + adapters | New |
| `MemoryQualitySignal` contract | New |
| Extend `Ranker` inputs (importance delta) | Extend pure ranker |
| Extend access tracking path | `recordAccess` / audit |
| Lifecycle state hints on `memories` | Additive metadata optional |
| Event publish on signal ingest | Via `IEventBus` (Phase 12, optional) |

### Outside this repository

| Capability | Location |
|------------|----------|
| Agent reflection sessions | External runtime |
| LLM “learn from mistakes” | External agent |
| BI dashboards | External analytics |
| Model fine-tuning | External MLOps |

### Non-goals

- Autonomous memory rewrite based on LLM inference
- Feedback loops that call MCP tools without user/auth context
- Storing agent chain-of-thought
- Cross-owner signal aggregation
- Real-time CRDT sync

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│ External Observers: REST clients · CI · Webhooks · Agent (via API only) │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Edge: POST /api/v1/signals (optional) · MCP ingest tool (optional)       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ISignalNormalizer (pure mapping)                                        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ IMemorySignalIngestor (application — scope validated)                   │
│   → dedupe by signal id / hash                                          │
│   → append audit row (optional)                                         │
│   → apply ImportanceScoringPolicy (pure)                                │
│   → repository.bumpImportance (existing)                                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   Ranker weights          Consolidator triggers    IEventBus (Phase 12)
   (ranking.config)        (Phase 5.5 policy)       memory.signal.received
```

### Pipeline stages (approved stack)

```
Observation → Normalization → Deduplication → Importance Scoring → Memory
     → [Compression] → [Embedding] → [Knowledge Graph]
```

| Stage | Owner module | Phase |
|-------|--------------|-------|
| Observation | Edge ingest | **8.5** |
| Normalization | `ingest/` pure | **8.5** |
| Deduplication | `semantic_hash` / signal id | **8.5** |
| Importance scoring | Pure policy → `Ranker` | **8.5** |
| Memory CRUD | `MemoryService` | Existing |
| Compression | Consolidator / 5.5 | Existing / 5.5 |
| Embedding | Embedding job | Phase 5 |
| Graph | `IGraphProvider` | Phase 8 |

### Design invariants

1. **Signals are inputs, not commands** — ingest cannot delete memories or bypass auth.
2. **Scope mandatory** — every signal carries `ownerId`; workspace/org when active.
3. **Pure ranking adaptation** — weight changes are config tables applied by pure functions.
4. **Idempotent ingest** — duplicate `signalId` ignored.
5. **Agent boundary** — no ingest handler invokes external LLM or agent planner.

---

## Boundary

| Inside Phase 8.5 | Outside |
|------------------|---------|
| Record access patterns | Interpret intent |
| Accept explicit thumbs-up/down on memory | Infer user goals |
| Bump importance within caps | Unbounded self-modification |
| Emit domain events | Subscribe handlers that run agent code in repo |
| Suggest consolidation candidates (flag) | Auto-run consolidator without job auth |

**Constitution §55:** Memory foundation only. **Phase 7:** Agent runtime external.

### Reflection (constrained definition)

**Reflection** = deterministic recomputation of ranking weights from accumulated signals in a batch job — **not** LLM introspection.

### Learning (constrained definition)

**Learning** = updating bounded parameters in `ranking.config.ts` or importance deltas from rules — **not** gradient descent or model training in this repository.

---

## Data Flow

### Hot path (existing — extended metadata)

```
ContextService.buildContext
  → recordAccessBatch (existing)
  → [optional] MemoryAccessAuditor (ADR-017)
  → implicit observation signal (internal, no new endpoint required)
```

### Explicit feedback path (new, optional)

```
POST /api/v1/signals
  { type: 'explicit_feedback', memoryId, value: 'helpful'|'not_helpful', scope }
  → auth + scope check
  → ISignalNormalizer
  → IMemorySignalIngestor.ingest
  → bumpImportance (±delta per policy)
  → [async] IEventBus.publish('memory.signal.received')
```

### Batch reflection job (new, optional)

```
npm run reflect:signals --dry-run
  → load signals in scope since T
  → ImportanceScoringPolicy.recalculateWeights (pure)
  → write weight snapshot to config store or env-backed file
  → Ranker reads weights on next request (no mid-request mutation)
```

---

## Module Structure

```
src/
  ingest/
    memory-quality-signal.types.ts
    isignal-normalizer.interface.ts
    imemory-signal-ingestor.interface.ts
    default-signal-normalizer.ts
    importance-scoring-policy.ts      # pure
  memory/
    ranker.ts                         # extend inputs — importance delta
  ports/
    audit/
      imemory-signal-store.port.ts    # optional append-only
  routes/v1/
    signals.routes.ts                 # optional REST ingest
  mcp/
    server.ts                         # optional: submit_signal tool

scripts/
  reflect-signals.ts                  # batch weight recompute — dry-run default
```

**Canonical owner:** extend `Ranker` / `ranking.config.ts`; do not create `RankerV2`.

---

## Interfaces

```typescript
interface MemoryQualitySignal {
  signalId: string;           // UUID — idempotency key
  signalType: 'access' | 'explicit_feedback' | 'consolidation_hint' | 'ingest';
  memoryId?: string;
  ownerId: string;
  workspaceId?: string;
  organizationId?: string;
  agentId?: string;
  deltaImportance?: number;   // bounded [-10, +10] default policy
  payload?: Record<string, unknown>;
  observedAt: string;         // ISO 8601
}

interface ISignalNormalizer {
  normalize(raw: unknown, ctx: AuthContext): MemoryQualitySignal | null;
}

interface IMemorySignalIngestor {
  ingest(scope: MemoryScope, signal: MemoryQualitySignal): Promise<IngestResult>;
}

interface ImportanceScoringPolicy {
  /** Pure — returns delta, does not I/O */
  score(signal: MemoryQualitySignal, memory: MemorySnapshot): number;
}

interface IngestResult {
  accepted: boolean;
  duplicate: boolean;
  appliedDelta?: number;
}
```

### Feedback → ranking adaptation (rule-based)

| Signal | Default effect |
|--------|----------------|
| `access` via context | Increment `access_count` (existing) |
| `explicit_feedback: helpful` | +5 importance (cap 100) |
| `explicit_feedback: not_helpful` | −5 importance (floor 0) |
| `consolidation_hint` | Flag for consolidator job only |

**Ranking adaptation:** rolling window of signals may adjust keyword weights in `ranking.config.ts` — owner-approved tables only.

---

## Storage Impact

### Optional: `memory_signals` table (append-only)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | TEXT PK | signalId |
| `owner_id` | TEXT | scope |
| `workspace_id` | TEXT NULL | scope |
| `memory_id` | TEXT NULL | target |
| `signal_type` | TEXT | enum |
| `payload` | TEXT JSON | raw normalized |
| `created_at` | TEXT | audit |

**Alternative (Phase 12):** signals only in analytics store via event bus — table optional per deployment.

### `memories` table (additive, optional)

| Column | Type | Purpose |
|--------|------|---------|
| `lifecycle_state` | TEXT NULL | `active` \| `stale` \| `candidate_compress` |

No change to required columns. Existing `importance`, `access_count`, `last_accessed` **retained**.

---

## API Impact

| Method | Endpoint | Change |
|--------|----------|--------|
| `POST` | `/api/v1/signals` | **New (optional track)** — explicit feedback ingest |
| `GET` | `/api/v1/memory/:id` | Optional `lifecycleState` when set |
| All existing | — | **Unchanged** required behavior |

Auth: signals endpoint requires same permissions as memory write in scope.

---

## MCP Impact

| Tool | Change |
|------|--------|
| All 19 existing | **Unchanged** |
| `submit_signal` | **Optional new** — explicit feedback; gated by env |
| `get_context` | Emits internal access signals (existing path) |

Env:

| Env | Default | Purpose |
|-----|---------|---------|
| `SIGNAL_INGEST_ENABLED` | `false` | Master switch |
| `SIGNAL_STORE_PROVIDER` | `none` | `sql` \| `analytics` \| `none` |
| `RANKING_ADAPTATION_ENABLED` | `false` | Batch reflection job |

---

## Testing

| Test | Purpose |
|------|---------|
| `importance-scoring-policy.test.ts` | Pure scoring bounds |
| `signal-ingest.test.ts` | Idempotency, scope isolation |
| `cross-owner-leak.test.ts` extend | Signal cannot cross owner |
| `ranker.test.ts` extend | Delta importance affects order deterministically |
| Forbidden scan | No `reflection`/`learning` agent loops in `src/services` |
| Batch job dry-run | `reflect-signals --dry-run` produces report only |

---

## Success Criteria

- [ ] ADR-026 **Approved** with explicit non-goals signed
- [ ] `IMemorySignalIngestor` + normalizer implemented behind flag
- [ ] Explicit feedback changes importance within bounded deltas
- [ ] Idempotent ingest verified
- [ ] Ranker behavior unchanged when `SIGNAL_INGEST_ENABLED=false`
- [ ] No agent planner / reflection LLM code in repository
- [ ] Constitution boundary review PASS
- [ ] Phase 12 event schema documented for `memory.signal.received`
- [ ] All existing tests green with flags off

---

## Future Phase

| Phase | Interaction |
|-------|-------------|
| **5.5** | `consolidation_hint` triggers compression policy |
| **6.5** | Access signals adjust progressive retrieval caps |
| **7.5** | Manifest `supportsQualitySignals` |
| **12** | Event bus fan-out to analytics |
| **13** | Signal volume at scale — batch only |
| **10** | Org-scoped signal quotas |

---

## References

| Document | Relevance |
|----------|-----------|
| [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) | §32 context efficiency; agent exclusion |
| [Phase 7 DESIGN](../07-agent-runtime/DESIGN.md) | Agent boundary §7 |
| [Phase 4 DESIGN](../04-memory-intelligence/DESIGN.md) | Access tracking, Ranker |
| [ADR-017](../../../docs/adr/017-memory-access-audit.md) | Audit port |
| [ADR-016](../../../docs/adr/016-redis-streams-event-bus.md) | Event bus |
| [ADR-026](../../../docs/adr/026-memory-quality-signals.md) | Gate (Proposed) |
| [10-POST-ROADMAP.md §Phase 12](../roadmap/10-POST-ROADMAP.md) | Event pipeline |
| [GLOSSARY.md](../../core/glossary/GLOSSARY.md) | Access count, importance |
| Architecture Review 2026-07-04 | Constrained reflection/learning |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). **Reflection** and **learning** in this document mean deterministic signal processing only — not agent cognition. Implementation deferred until ADR-026 Approved.*
