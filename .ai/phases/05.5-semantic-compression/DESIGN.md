# Phase 5.5 — Semantic Compression — DESIGN

**Document:** DESIGN  
**Phase status:** Implemented (2026-07-04) · ADR-023 Accepted  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Roadmap placement:** Extension track **05.5** — semantic compression after Phase 4 consolidator  
**ADR gate:** [ADR-023](../../adr/023-semantic-compression-policy.md) — **Accepted** (Implemented 2026-07-04)

---

## Purpose

Define **semantic compression** as an additive memory-foundation capability that reduces stored and retrieved token volume while preserving audit trails, owner scope, and referential integrity.

Phase 5.5 extends — does not replace — existing Phase 4 artifacts:

- `generateSummary()` (rule-based, ≤300 chars)
- `MemoryConsolidator` (duplicate detection, summary memory creation)
- `memory.level` (`raw` | `note` | `summary` | `canonical`)
- MCP/REST `content_mode: summary` (token-efficient context)

Phase 5.5 adds:

- Formal **compression policy** port and metadata contract
- **Hierarchical summary** via relations (not a parallel memory store)
- **Compression versioning** and optional **async scheduler** (job port)
- Optional **LLM summarization adapter** (async only, behind port)

Phase 5.5 does **not** add agent reasoning, autonomous summarization loops, or destructive deletion of user memories.

---

## Scope

### Inside this repository

| Capability | Status |
|------------|--------|
| `ICompressionPolicy` port | New |
| `ICompressionScheduler` port (job) | New |
| `CompressionMetadata` contract | New (additive JSON on `memories`) |
| Extend `MemoryConsolidator` | Extend existing module |
| Extend `generateSummary` / enrichment path | Extend existing |
| Compression backfill / dry-run script | New script (pattern: `consolidate-memories`) |
| Re-embed hook after summary creation | Extend embedding job runner |

### Outside this repository

| Capability | Location |
|------------|----------|
| LLM inference provider choice | External adapter wired at composition root |
| Agent-driven “reflect and compress” | External agent runtime (Phase 7 boundary) |
| Transport-level gzip/brotli | CDN / reverse proxy (not domain) |

### Non-goals

- New top-level `compressed_memories` table as primary model
- Hard delete of raw content to save space
- Synchronous LLM calls on CRUD hot path
- Changing `MemoryService` public method signatures
- Replacing `ContextBuilder` or `Retriever`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Application (unchanged signatures)                   │
│  MemoryService.create/update · ContextService.buildContext              │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│ Knowledge     │     │ MemoryConsolidator│     │ CompressionJobRunner │
│ enrich path   │     │ (extend)          │     │ (new, async)         │
└───────┬───────┘     └────────┬─────────┘     └──────────┬──────────┘
        │                      │                            │
        └──────────────────────┼────────────────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │  ICompressionPolicy   │  ← port (pure decision)
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ IMemoryRepository     │  ← existing; additive columns
                    │ IMemoryRelationRepo   │  ← derived_from / consolidates
                    │ IEmbeddingStore       │  ← re-index summary (async)
                    │ IObjectStorage        │  ← ADR-005 large body offload
                    └──────────────────────┘
```

### Design invariants

1. **Single canonical memory row** — compression produces new `memories` rows or enriches metadata; no forked store.
2. **Archive, never destroy** — raw sources archived (`archived=1`) or referenced via relations; Constitution data law.
3. **Scope enforced** — all compression operations include `MemoryScope` (`ownerId` + optional workspace/org).
4. **Async by default** — LLM or heavy compression runs in job port; CRUD path unchanged in latency profile.
5. **Additive contracts** — REST/MCP response fields additive; existing clients unaffected when compression disabled.

---

## Boundary

| Inside Phase 5.5 | Outside (forbidden in repo) |
|----------------|----------------------------|
| Policy: when / what level to compress | Agent decides “what to remember” |
| Rule-based + port-based semantic summary | Planner / reflection loop |
| Hierarchical memory via `level` + relations | Separate compressed-memory microservice |
| Metadata + version tracking | Opaque blob without codename trace |
| Scheduler triggers batch compression | Cron that mutates scope without auth |

**Constitution alignment:** Memory foundation only; context efficiency (§32); port before implementation (§23); additive first (§21).

---

## Data Flow

### Write path (unchanged hot path)

```
save_memory / POST /memory
  → MemoryService.createMemory(scope, input)
  → KnowledgeService.enrich (summary ≤300 chars)
  → repository.insert
  → [async] embedding job if enabled
```

### Compression path (new, async)

```
CompressionJobRunner / npm run compress:memories
  → load candidates (scope, project, semantic_hash groups)
  → ICompressionPolicy.shouldCompress(each)
  → if duplicate cluster:
       archive duplicates (soft)
       create summary memory (level=summary|canonical)
       link relation type consolidates / derived_from
       write compression_meta JSON
  → [async] embedding backfill for new summary rows
  → [optional] object_key migration for large bodies (Phase 13 coordination)
```

### Read path (context)

```
get_context (summary default)
  → retrieval candidates WITHOUT body (O-04-2)
  → ContextBuilder title + summary only
get_context (content_mode=full)
  → findByIdsWithContent hydration (existing)
```

---

## Module Structure

```
src/
  memory/
    consolidator.ts              # extend — hierarchical summary actions
    compression/
      compression.types.ts       # CompressionMetadata, CompressionContext
      compression-policy.interface.ts   # ICompressionPolicy
      rule-based-compression-policy.ts  # default adapter (pure rules)
  ports/
    compression/
      icompression-scheduler.port.ts    # ICompressionScheduler
  jobs/
    compression-job-runner.ts    # async batch (mirror embedding runner pattern)
scripts/
  compress-memories.ts           # CLI — dry-run default
```

**Canonical owners:** extend `MemoryConsolidator`; do not create `MemoryConsolidatorV2`.

---

## Interfaces

```typescript
/** Pure policy — no I/O */
interface ICompressionPolicy {
  shouldCompress(input: CompressionCandidate, ctx: CompressionContext): boolean;
  targetLevel(input: CompressionCandidate): MemoryLevel; // summary | canonical
  algorithmId(): string; // e.g. rule_v1, llm_v1
}

interface CompressionCandidate {
  memory: Pick<Memory, 'id' | 'title' | 'content' | 'summary' | 'level' | 'semanticHash'>;
  duplicateClusterSize?: number;
  totalChars?: number;
}

interface CompressionContext {
  scope: MemoryScope;
  deploymentLimits: { maxMemoryContentBytes: number };
}

interface CompressionMetadata {
  algorithm: string;
  version: number;
  sourceMemoryIds: string[];
  charRatio?: number;
  tokenEstimateBefore?: number;
  tokenEstimateAfter?: number;
  compressedAt: string; // ISO 8601
}

/** Job port — wired at composition root */
interface ICompressionScheduler {
  enqueue(scope: MemoryScope, options?: CompressionJobOptions): Promise<string>;
  runPending(limit: number): Promise<CompressionJobReport>;
}

interface ICompressionSummarizer {
  /** Async only — invoked from job runner, not CRUD */
  summarize(content: string, ctx: { title: string; project?: string }): Promise<string>;
}
```

### Compression policy matrix (default rule-based)

| Trigger | Action | Target level |
|---------|--------|--------------|
| `semantic_hash` duplicate cluster ≥2 | Archive extras; create summary | `summary` |
| Content chars > policy threshold | Keep raw; ensure summary refreshed | `note` |
| Stale + high access (consolidator) | Promote importance; optional summary | `note` → `summary` |
| Manual canonical promotion (future) | Single source of truth row | `canonical` |

---

## Storage Impact

### `memories` table (additive)

| Column | Type | Purpose |
|--------|------|---------|
| `compression_meta` | TEXT NULL (JSON) | `CompressionMetadata` |
| `compression_version` | INTEGER NULL | Policy version applied |

**No new primary table.** Use existing:

| Existing | Use in 5.5 |
|----------|------------|
| `level` | `summary`, `canonical` |
| `semantic_hash` | Duplicate detection |
| `object_key` | Large body offload (coordination with Phase 13) |
| `archived` | Soft-hide compressed sources |

### `memory_relations` (additive relation types)

| Relation | Semantics |
|----------|-----------|
| `consolidates` | Summary memory → source memory |
| `derived_from` | Alternate alias; pick one in ADR-023 |

### Migration strategy

1. Add columns (idempotent migration)
2. Backfill `compression_meta` null for all existing rows
3. Index optional on `(owner_id, level)` if list-by-level queries added
4. No data destruction

---

## API Impact

| Method | Endpoint | Change |
|--------|----------|--------|
| — | All existing | **Unchanged** required fields |
| `GET` | `/api/v1/memory/:id` | Optional `compressionMeta` in response when present |
| `POST` | `/api/v1/memory` | No new required fields |
| `POST` | `/api/v1/context` | No change (uses existing `context.includeSummaryOnly`) |
| `POST` | `/api/v1/admin/compress` | **Optional** — owner-only batch trigger (Phase 5.5 optional track) |

All changes **additive**. Default deploy: compression job disabled; behavior identical to pre-5.5.

---

## MCP Impact

| Tool | Change |
|------|--------|
| All 19 existing tools | Signatures **unchanged** |
| `get_compression_status` | **Optional** — owner-scoped compression counts, pending duplicates, env flags |
| `save_memory` | Response may include optional `compressionMeta` when populated |
| `get_context` | No change (`content_mode`, `summary_only` already token-efficient) |
| `get_memory` | Optional `compressionMeta` field in JSON |

**No new MCP tools required** for gate PASS. Optional: `get_compression_status` — **Implemented** (tool #22; `ICompressionStatusReader`).

Env flags (composition root):

| Env | Default | Purpose |
|-----|---------|---------|
| `COMPRESSION_ENABLED` | `false` | Master switch |
| `COMPRESSION_POLICY` | `rule` | `rule` \| `llm` (llm requires adapter) |
| `COMPRESSION_SCHEDULER` | `none` | Job driver selection |

---

## Testing

| Layer | Tests |
|-------|-------|
| Pure policy | Unit: `ICompressionPolicy` decisions, version bumps |
| Consolidator extend | Integration: duplicate → summary + relation + archive |
| Scope | Cross-owner / cross-workspace — compression cannot touch foreign rows |
| Token regression | `benchmark:context-tokens` — median ≥80% savings vs naive dump on fixture |
| Migration | Idempotent add-column migration test |
| Dry-run CLI | `compress-memories --dry-run` produces report without writes |

**Non-regression:** existing `consolidator.test.ts`, `context.service.test.ts` must pass unchanged behavior when `COMPRESSION_ENABLED=false`.

---

## Success Criteria

- [x] ADR-023 **Accepted** and linked
- [x] `ICompressionPolicy` + rule-based adapter implemented behind flag
- [x] Hierarchical summary creates `level=summary` memory with `consolidates` relation
- [x] Raw sources archived, not deleted
- [x] `compression_meta` + `compression_version` populated on compressed rows
- [x] Dry-run script default; execute path documented
- [x] Zero changes to `MemoryService` method signatures
- [x] All existing tests green with compression disabled
- [x] Token benchmark documents ≥80% median savings (summary path vs full dump) — optional evidence via `benchmark:context-tokens`; archived [COMPLETION.md](COMPLETION.md) (summary-only **85.5%**, 2026-07-04)

---

## Future Phase

| Phase | Interaction |
|-------|-------------|
| **Phase 11** | Postgres migrations include new columns |
| **Phase 12** | Publish `memory.compressed` domain event (optional) |
| **Phase 13** | Large body → `object_key`; compress metadata references blob |
| **Phase 6.5** | Progressive retrieval prefers `summary`/`canonical` levels in policy |
| **Phase 8.5** | Access signals inform compression triggers (importance) |
| **Phase 10** | Org-level compression quotas (future ADR) |

---

## References

| Document | Relevance |
|----------|-----------|
| [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) | Boundary, data law, context efficiency |
| [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) | Memory domain ownership |
| [09-ROADMAP.md](../roadmap/09-ROADMAP.md) | Phase 4 consolidator baseline |
| [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) | Phase 13 content scale |
| [Phase 4 DESIGN](../04-memory-intelligence/DESIGN.md) | Retriever, consolidator |
| [Phase 5 DESIGN](../05-embedding/DESIGN.md) | Re-embed after summary |
| [ADR-005](../../adr/005-content-object-store.md) | Blob offload |
| [ADR-023](../../adr/023-semantic-compression-policy.md) | Structural gate (Accepted) |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | What was built |
| [TESTING.md](TESTING.md) | Verification evidence |

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Do not contradict Approved ADRs.*
