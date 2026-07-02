# 12 — Performance Standard

**Status:** Permanent project standard.  
**Audience:** AI assistants and human maintainers.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [supplementary/SECURITY.md](supplementary/SECURITY.md).

---

# Purpose

Define measurable performance engineering standards for the AI Brain memory foundation from Phase 1 through Phase 10.

Establish budgets, limits, and decision criteria so latency, throughput, resource use, and scale remain predictable as retrieval, embedding, vector, graph, and enterprise capabilities are added.

Prevent unbounded work on request paths and undocumented MVP scale ceilings.

---

# Scope

## Covered

- Performance philosophy and budgets (latency, memory, context, token, CPU, database)
- Query, index, pagination, batch, async, and concurrency rules
- Phase-specific preparation: search, retrieval, embedding, vector, graph, agent, enterprise
- Observability, benchmarking, testing, and performance checklist

## Not Covered

- Security rules → [supplementary/SECURITY.md](supplementary/SECURITY.md)
- Layer architecture → [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md)
- Coding style → [02-CODING.md](../standards/02-CODING.md)
- Exact config file names in repository (budgets live in configuration modules)

---

# Performance Philosophy

1. **Bound work** — Every request path has explicit caps. Unbounded loops, queries, and payloads are defects.

2. **Measure before optimize** — Change performance only with profiling data, failing test, or explicit non-functional requirement in task.

3. **Hot path minimalism** — Synchronous CRUD and read paths exclude inference, bulk I/O, and unbounded scans.

4. **Async enrichment** — Embedding, consolidation, and bulk backfill run in background jobs with configurable batch size.

5. **Pure ranking in memory** — Scoring operates on bounded candidate sets loaded in one or few queries.

6. **Scale via adapters** — Exceeding MVP ceiling triggers adapter swap (vector engine, read replica), not repository rewrite.

7. **Fail fast** — Timeouts and retry limits prevent hung requests and retry storms.

8. **Observability by default** — Latency, error rate, and saturation are measurable per request and per job.

---

# Performance Budget

Global budgets apply unless task ADR defines stricter NFR. Values are defaults; tunable only via configuration modules or environment schema — never inline magic numbers.

| Budget | Default cap | Hard ceiling | Applies to |
|--------|-------------|--------------|------------|
| SQL queries per REST/MCP request | ≤ 5 | ≤ 10 | Synchronous request path |
| `recordAccess` writes per context build | ≤ 20 | ≤ 50 | Context endpoint (batch refactor target) |
| REST search p95 latency (local) | ≤ 300 ms | ≤ 800 ms | Excluding cold start |
| Context build p95 latency (local) | ≤ 500 ms | ≤ 1500 ms | SQL retrieval only |
| Context character budget | 12 000 | 24 000 | LLM context output |
| Retrieval ranked results | 10 default | 20 max | Retriever pipeline |
| Search candidate fetch | 500 | 500 | Before in-memory rank |
| Retrieval SQL candidates | 60 | 100 | Per source pre-rank |
| Pagination page size default | 50 | 100 | REST list/search |
| Embedding batch size | 32 | 128 | Background job |
| Embedding job retries per item | 3 | 5 | With backoff |
| HTTP client timeout (external inference) | 30 s | 60 s | Provider calls |
| MCP tool response payload | ≤ 1 MB | ≤ 2 MB | JSON text |
| In-process vector scan per owner | ≤ 10 000 vectors | ≤ 10 000 | MVP; exceed → external vector engine |

**Rule:** Exceeding hard ceiling requires ADR and owner approval.

---

# Latency Budget

| Path | Target p95 | Components counted |
|------|------------|----------------------|
| Health | ≤ 50 ms | DB ping only |
| Memory CRUD (single) | ≤ 200 ms | Auth + 1–3 queries |
| REST search | ≤ 300 ms | Auth + candidate query + rank + paginate |
| Context / retrieval | ≤ 500 ms | Auth + retrieve + rank + build (no embed) |
| Auth bootstrap | ≤ 400 ms | One-time setup |
| Background backfill item | N/A | Not on request path |

| Rule | Level |
|------|-------|
| No synchronous embedding on CRUD path | Required |
| No unbounded candidate fetch | Required |
| Parallel independent I/O only when capped | Required |
| Blocking request on full corpus scan | Forbidden |

**Reason:** Predictable UX for interactive REST and MCP.  
**Tradeoff:** Lower caps may reduce recall — compensated by hybrid retrieval in Phase 6.  
**Future Compatibility:** Composite retrieval adds parallel sources with per-source caps per ADR-001.

---

# Memory Budget

| Context | Cap |
|---------|-----|
| Candidate array in ranking | ≤ search candidate cap (500 rows metadata) |
| Ranked output | ≤ retrieval max ranked (20) |
| Context assembly buffer | ≤ max context chars (24 000) |
| Backfill job in-flight rows | ≤ batch size (32–128) |
| Process heap for vector cosine scan | Proportional to owner vector count; MVP ≤ 10k × dimensions |

| Rule | Level |
|------|-------|
| Stream or chunk when processing full owner corpus | Required |
| Load entire owner table into memory on request | Forbidden |

**Reason:** Serverless and small-instance deploy targets.  
**Tradeoff:** Chunking adds job duration.  
**Future Compatibility:** Vector adapter offloads scan to external engine.

---

# Context Budget

| Parameter | Default | Maximum |
|-----------|---------|---------|
| Context characters | 12 000 | 24 000 |
| Memories in context | Derived from char budget | — |
| Full `content` per memory | Truncated by builder | — |

| Rule | Level |
|------|-------|
| Context builder enforces char budget before response | Required |
| Unbounded memory dump to LLM | Forbidden |

**Reason:** Token cost and model context limits.  
**Tradeoff:** May omit lower-ranked memories.  
**Future Compatibility:** Summary-only projection and object store offload reduce bytes per memory.

---

# Token Budget

| Rule | Level |
|------|-------|
| Context output sized in characters with documented char-to-token ratio assumption | Required |
| Expose unbounded text fields in context endpoint | Forbidden |

**Recommended:** Document assumed ~4 chars per token for planning; do not hard-bind billing to this ratio.

**Reason:** LLM providers bill by token.  
**Tradeoff:** Character budget is approximate.  
**Future Compatibility:** Optional token estimator port in enterprise phase.

---

# CPU Budget

| Path | Rule |
|------|------|
| Ranking engine | In-memory on ≤ 500 candidates |
| Cosine similarity (MVP) | In-process on ≤ 10k vectors per owner per query |
| Consolidation | Background script only |
| JSON parse per request | Single body; size-limited |

| Rule | Level |
|------|-------|
| O(n²) comparison across full corpus on request path | Forbidden |
| CPU-heavy work without cap | Forbidden |

**Reason:** Single-threaded Node event loop and serverless CPU limits.  
**Tradeoff:** MVP vector scan does not scale past ceiling.  
**Future Compatibility:** External vector index reduces CPU per query.

---

# Database Budget

| Metric | Cap |
|--------|-----|
| Queries per synchronous request | ≤ 5 target, ≤ 10 hard |
| Rows scanned per search (effective) | ≤ candidate cap with index support |
| Write statements per CRUD | ≤ 3 |
| Transaction scope | Single use case; no long-held transactions |

| Rule | Level |
|------|-------|
| `SELECT *` on hot paths when projection suffices | Not recommended |
| N+1 query pattern | Forbidden |
| Full table scan without owner filter | Forbidden |

**Reason:** D1/SQLite latency and lock behavior.  
**Tradeoff:** Projection queries require maintenance.  
**Future Compatibility:** Postgres adapter may enable richer indexes; port boundary unchanged.

---

# Query Budget

| Operation | Max queries | Notes |
|-----------|-------------|-------|
| getById | 1 | |
| list (paginated) | 1–2 | count optional |
| search | 1–2 | candidates + optional count |
| context build | 2–4 | retrieve + access updates |
| create memory | 2–4 | insert + uniqueness checks |
| delete memory | 2–3 | memory + embedding cleanup |

| Rule | Level |
|------|-------|
| Batch fetch when loading N related rows | Required |
| Per-item query in loop over candidates | Forbidden |

---

# Index Strategy

| Pattern | Index |
|---------|-------|
| Owner-scoped lists | `(owner_id, …)` |
| Owner + codename / slug | UNIQUE composite |
| Owner + project filter | `(owner_id, project)` |
| Relations by source/target | `(source_memory_id)`, `(target_memory_id)` |
| Embeddings by owner + memory | `(owner_id, memory_id)` |
| Time-range audit | `(created_at)` with owner when scoped |

| Rule | Level |
|------|-------|
| New hot query path includes index plan | Required |
| Index after large backfill on big tables | Required |
| Full scan as permanent strategy for owner-scoped search | Forbidden |

**Reason:** Row growth per owner degrades latency without indexes.  
**Tradeoff:** Indexes increase write cost and storage.  
**Future Compatibility:** External engines bring native ANN indexes in Phase 6+.

---

# Pagination Rules

| Parameter | Default | Max |
|-----------|---------|-----|
| `limit` | 50 | 100 |
| `offset` | 0 | — |

| Rule | Level |
|------|-------|
| Enforce max limit at edge | Required |
| Unbounded list endpoints | Forbidden |
| Offset pagination documented for large offsets degradation | Recommended |

**Reason:** Protect DB and response size.  
**Tradeoff:** Deep offset slow at scale — cursor pagination future option.  
**Future Compatibility:** Keyset pagination ADR in enterprise phase if needed.

---

# Batch Processing

| Job type | Default batch | Max batch | Dry-run default |
|----------|---------------|-----------|-----------------|
| Embedding backfill | 32 | 128 | Yes |
| Memory intelligence backfill | 50 | 200 | Yes |
| Consolidation | 50 | 200 | Yes |
| Backup import | 100 | 500 | — |

| Rule | Level |
|------|-------|
| Backfill idempotent and resumable | Required |
| Unbounded single-transaction full corpus update | Forbidden |

**Reason:** Memory and lock bounds.  
**Tradeoff:** Smaller batches increase total job time.  
**Future Compatibility:** Job runner port unchanged; adapter scales horizontally.

---

# Streaming

| Rule | Level |
|------|-------|
| MCP and REST responses fit in memory under payload cap | Required |
| Stream large export if size exceeds 1 MB | Recommended |
| Load multi-GB export into single string | Forbidden |

**Reason:** Serverless memory limits.  
**Tradeoff:** Streaming complicates clients.  
**Future Compatibility:** Object store streaming for blobs per ADR-005.

---

# Caching Strategy

| Data | Cache | TTL |
|------|-------|-----|
| Environment config | Process memory | Lifetime of process |
| Ranking weights | Module load | Deploy cycle |
| Memory records | No default cache | — |
| Embedding vectors | Store only — no app cache default | — |

| Rule | Level |
|------|-------|
| Cache invalidation defined if cache introduced | Required |
| Cross-request mutable cache without owner scope key | Forbidden |

**Reason:** Correctness over stale reads for mutable memory.  
**Tradeoff:** Repeat reads hit DB.  
**Future Compatibility:** Read-through cache at adapter in Postgres phase optional.

---

# Connection Management

| Rule | Level |
|------|-------|
| Single client instance per process at composition root | Required |
| New connection per request | Forbidden |
| Connection pool sizing documented for multi-instance deploy | Recommended |

**Reason:** Handshake cost and connection limits.  
**Tradeoff:** Pool size ties to concurrency model.  
**Future Compatibility:** Pool in adapter swap for Postgres.

---

# Background Jobs

| Rule | Level |
|------|-------|
| Inference and bulk migration off request path | Required |
| Job progress logged with batch counts | Required |
| User-triggered wait on full corpus embed | Forbidden |

**Reason:** CRUD latency SLO.  
**Tradeoff:** Stale embedding until backfill completes.  
**Future Compatibility:** Queue port for distributed workers in enterprise phase.

---

# Retry Strategy

| Context | Max retries | Idempotent only |
|---------|-------------|-----------------|
| External embedding API | 3 | Yes |
| D1 transient error | 2 | Yes |
| REST client request | 0 (server) | — |

| Rule | Level |
|------|-------|
| Retry only idempotent operations | Required |
| Unlimited retries | Forbidden |

**Reason:** Retry storms amplify outages.  
**Tradeoff:** Transient failures may fail job item.  
**Future Compatibility:** Dead-letter queue in enterprise ops.

---

# Backoff Strategy

| Rule | Level |
|------|-------|
| Exponential backoff with jitter for provider retries | Required |
| Fixed immediate retry loop | Forbidden |

**Default:** base 500 ms, max 8 s, jitter ±25%.

**Reason:** Protect provider and self from thundering herd.  
**Tradeoff:** Increases job latency on failure.  
**Future Compatibility:** Configurable per provider adapter.

---

# Timeout Strategy

| Operation | Timeout |
|-----------|---------|
| External inference HTTP | 30 s |
| Database query (single) | 10 s |
| Health check | 3 s |
| MCP tool handler (total) | 60 s |

| Rule | Level |
|------|-------|
| Every outbound HTTP client has timeout | Required |
| No timeout on external call | Forbidden |

**Reason:** Prevent hung requests.  
**Tradeoff:** Long embeddings may fail — reduce batch size.  
**Future Compatibility:** Per-provider timeout in config.

---

# Concurrency

| Rule | Level |
|------|-------|
| Bounded concurrency for background batch (configurable) | Recommended |
| Unbounded parallel embedding of full corpus | Forbidden |

**Recommended default:** ≤ 4 parallel provider requests per job process.

---

# Parallelism

| Scenario | Pattern |
|----------|---------|
| Independent reads (health + metadata) | Parallel with cap |
| Dependent pipeline (retrieve → rank → build) | Sequential |
| Multi-source retrieval (Phase 6) | Parallel sources; merge; cap per source |

**Reason:** Latency vs resource contention.  
**Tradeoff:** Phase 6 parallel sources increase p95 — per-source caps mitigate.  
**Future Compatibility:** ADR-001 composite merge policy.

---

# Async Processing

| Rule | Level |
|------|-------|
| I/O-bound operations async | Required |
| CPU-bound ranking on bounded set sync | Required |
| Blocking event loop with sync network I/O | Forbidden |

---

# Large Dataset Handling

| Scale | Strategy |
|-------|----------|
| ≤ 10k vectors / owner | In-process scan MVP |
| \> 10k vectors / owner | External vector engine adapter |
| Large `content` bodies | Object store (ADR-005) |
| Full owner backup | Stream export |

| Rule | Level |
|------|-------|
| Document scale ceiling when introducing MVP shortcut | Required |
| Silent degradation beyond ceiling | Forbidden |

---

# Search Optimization

| Rule | Level |
|------|-------|
| Candidate cap before rank (500) | Required |
| Rank in pure engine on capped set | Required |
| Full table scan + rank all rows | Forbidden |

**Reason:** Search is paginated browse — not full corpus scoring.  
**Tradeoff:** Memories outside cap invisible to search rank.  
**Future Compatibility:** FTS or index engine adapter Phase 6+.

---

# Ranking Optimization

| Rule | Level |
|------|-------|
| Weights in configuration module | Required |
| O(n) rank on capped n only | Required |
| Dynamic per-request weight mutation without config | Forbidden |

**Reason:** Predictable cost and testability.  
**Tradeoff:** Fusion weights (Phase 6) add compute — still bounded n.  
**Future Compatibility:** Fusion in pure engine — no I/O.

---

# Retriever Optimization

| Rule | Level |
|------|-------|
| SQL candidate cap (60) before rank | Required |
| Retriever does not call search service | Required |
| Retriever loads full memory content for all candidates when projection suffices | Not recommended |

**Reason:** Context path separate from search.  
**Tradeoff:** Projection may omit fields needed for rank — document fields.  
**Future Compatibility:** Composite source adds candidates; Retriever unchanged.

---

# Embedding Preparation

| Rule | Level |
|------|-------|
| Async backfill only | Required |
| Content hash skip unchanged | Required |
| Sync embed on write | Forbidden |

**Reason:** Inference latency unacceptable on CRUD.  
**Tradeoff:** Vectors lag content changes.  
**Future Compatibility:** Incremental queue on change event optional.

---

# Vector Search Preparation

| MVP ceiling | 10 000 vectors / owner |
|-------------|----------------------|
| Similarity | Owner-scoped |
| Engine | In-process cosine |

| Phase 6+ | External ANN adapter; same `IEmbeddingStore` port |

**Reason:** D1 row scan does not scale infinitely.  
**Tradeoff:** MVP simplicity vs scale.  
**Future Compatibility:** Adapter swap without MemoryRepository change.

---

# Knowledge Graph Preparation

| Phase 8 | Graph candidate source with hop limit |
|---------|---------------------------------------|
| Hop cap | ≤ 2 recommended |
| Nodes expanded per request | ≤ 50 |

**Reason:** Graph explosion without bounds.  
**Tradeoff:** Limited neighborhood recall.  
**Future Compatibility:** `IGraphProvider` native traversal.

---

# Agent Runtime Preparation

| Rule | Level |
|------|-------|
| Agent loops external; context via bounded endpoint | Required |
| Agent polls unbounded full memory | Forbidden |

**Reason:** Constitution boundary Phase 7.  
**Tradeoff:** Multiple round trips.  
**Future Compatibility:** Scoped workspace reduces payload per agent.

---

# Multi-Agent Preparation

| Phase 9 | Workspace-scoped queries reduce dataset per agent |
|---------|---------------------------------------------------|
| Sync storm | Rate limit per workspace |

**Reason:** Shared brain multiplies read load.  
**Tradeoff:** Coordination complexity.  
**Future Compatibility:** `ISyncManager` deduplication.

---

# Enterprise Scaling

| Phase 10 | Postgres metadata, read replicas, object store, RBAC audit |
|----------|--------------------------------------------------------------|
| SLO | Define per-tenant p95 under ADR |

**Reason:** D1 MVP not enterprise multi-tenant scale.  
**Tradeoff:** Operational complexity.  
**Future Compatibility:** Ports enable gradual migration.

---

# Observability

| Signal | Required |
|--------|----------|
| Request correlation id | Yes |
| Request duration logged at edge | Yes |
| Error code on failure | Yes |
| Per-layer timing (retrieve, rank, build) | Recommended |

---

# Metrics

| Metric | Type |
|--------|------|
| Request latency histogram | Required (when APM available) |
| Error rate by route | Required |
| Backfill items processed / failed | Required for jobs |
| Candidate count per retrieval | Recommended |
| Embedding provider latency | Recommended |

---

# Logging

| Rule | Level |
|------|-------|
| Log slow requests above p95 threshold | Recommended |
| Log full candidate payloads | Forbidden |
| Log vectors at info level | Forbidden |

---

# Tracing

| Rule | Level |
|------|-------|
| Propagate correlation id across layers | Required |
| Distributed trace spans for multi-source retrieval (Phase 6) | Recommended |

---

# Profiling

| Rule | Level |
|------|-------|
| Profile before optimization PR | Required |
| Optimization without baseline measurement | Forbidden |

---

# Benchmarking

| Rule | Level |
|------|-------|
| Fixture dataset for retrieval and search benchmarks | Recommended |
| Benchmark in CI gate default | Not required |
| Regress p95 \> 20% without justification | Forbidden |

---

# Load Testing

| When | Action |
|------|--------|
| New NFR in task | Load test before release |
| Default phase work | Not required |

**Target:** Sustain 50 concurrent search requests at p95 within latency budget on reference hardware.

---

# Stress Testing

| When | Action |
|------|--------|
| Pre-enterprise phase | Find breaking point |
| Document max RPS and corpus size at failure |

---

# Regression Testing

| Rule | Level |
|------|-------|
| Full test suite on every commit | Required |
| Performance fixture test when changing rank/retrieve | Recommended |
| Remove perf regression test to pass CI | Forbidden |

---

# Required

1. All caps in configuration modules — not inline.
2. Request paths bounded by performance budget table.
3. No synchronous inference on CRUD.
4. No unbounded queries or pagination.
5. Owner-scoped queries with index plan for new hot paths.
6. Background jobs batched and idempotent.
7. Retries idempotent with backoff and max count.
8. Outbound HTTP timeouts set.
9. Context char budget enforced.
10. Document MVP scale ceiling when adding scan-based algorithms.
11. Profile before optimization.
12. Phase 6+ parallel sources use per-source caps.

---

# Recommended

1. Projection queries on hot read paths.
2. Batch `recordAccess` when N \> 5.
3. Keyset pagination for deep lists (future).
4. Read replica for search (enterprise).
5. CI benchmark smoke on ranking engine.
6. Slow-request logging.

---

# Forbidden

1. Unbounded `Promise.all` on full dataset.
2. Full corpus load on request path.
3. Sync embedding on insert/update.
4. N+1 queries.
5. Missing timeout on external calls.
6. Magic numbers in business logic.
7. Optimization without measurement.
8. Vector SQL in metadata repository.
9. Retrying non-idempotent writes blindly.
10. Exceeding hard budget without ADR.

---

# Decision Rules

| Question | Decision |
|----------|----------|
| Sync or async? | Async for I/O and inference; sync for bounded pure rank |
| Raise cap? | ADR + benchmark justification |
| Add cache? | Invalidation plan + owner scope key |
| In-process or external vector? | ≤10k owner vectors in-process; above → adapter |
| Parallel sources? | Yes Phase 6 with per-source cap |
| Optimize now? | Only if budget violated or NFR in task |

---

# Examples

## Good

- Search fetches 500 candidates, ranks in memory, returns page of 50.
- Embedding job processes 32 memories per batch with dry-run default.
- Context response truncated at 12 000 characters.
- New list query adds `(owner_id, updated_at)` index.

## Bad

- `SELECT * FROM memories` without owner filter for search.
- Embed on every `updateMemory` call synchronously.
- `Promise.all(memories.map(m => repository.findById(m.id)))` — N+1.
- Raise `SEARCH_CANDIDATE_CAP` to 100 000 without ADR.

---

# Performance Checklist

- [ ] Work bounded by budget table
- [ ] Caps in config module
- [ ] Queries ≤ query budget for path
- [ ] Indexes for new hot queries
- [ ] Pagination max enforced
- [ ] No sync inference on CRUD
- [ ] Batch jobs idempotent with dry-run
- [ ] Retries capped with backoff
- [ ] HTTP timeouts configured
- [ ] Context budget enforced
- [ ] MVP ceiling documented if scan-based
- [ ] No N+1 introduced
- [ ] Profiled if optimization claimed
- [ ] Future phase compatibility stated

---

*Inherits from [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md). Cross-reference [08-REVIEW.md](../standards/08-REVIEW.md) Performance section. Amend only with project owner approval.*
