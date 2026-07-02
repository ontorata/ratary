# Task Prompt — Phase 5 Embedding

**Status:** Active (replace entire file when moving to next phase).  
**Template:** [TASK_PROMPT.template.md](TASK_PROMPT.template.md)

**Before coding:** [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [ENGINEERING.md](ENGINEERING.md) — complete pre-code analysis per ENGINEERING first.

---

# TASK

Implement: **Phase 5 — Embedding Layer**

Async embedding generation and vector storage behind ports (`IEmbeddingProvider`, `IEmbeddingStore`), wiring `memories.embedding_id` via backfill job only — no sync embed on CRUD, no vector SQL in `MemoryRepository`, no REST/MCP contract changes.

---

## Requirements

- `IEmbeddingProvider` with `NoopEmbeddingProvider` (tests)
- `memory_embeddings` table (D1 MVP per ADR-003)
- `IEmbeddingStore` with `D1EmbeddingStore` including owner-scoped `searchSimilar` (MVP scale)
- `IMemoryWriter.applyEmbeddingBackfill` + `IMemoryReader.findWithoutEmbedding` (or equivalent)
- `EmbeddingJobRunner` — batch, idempotent, `content_hash` skip
- `npm run db:backfill-embeddings` — dry-run default
- Optional: `OpenAIEmbeddingProvider` behind `EMBEDDING_PROVIDER=openai`
- ADR-004 first: extract persistence types to `src/types/memory-persistence.ts` (zero behavior change)
- One concern per commit; quality gate after each commit
- 110+ tests passing at completion

### ADR gates (stop if not Approved)

| ADR | Title | Status |
|-----|-------|--------|
| [002](adr/002-workspace-identity-model.md) | Workspace & identity | **Approved** |
| [003](adr/003-embedding-storage-mvp.md) | Embedding storage MVP | **Proposed → approve** |
| [004](adr/004-repository-port-types.md) | Repository port types | **Proposed → approve** |

### Future compatibility (must remain ✓)

| Phase | Requirement |
|-------|-------------|
| 6 Hybrid | `VectorRetrievalCandidateSource` uses `IEmbeddingStore.searchSimilar` |
| 7–10 | No API breakage; store ops scoped `ownerId` (ADR-002) |

---

## Constraints

- Follow [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md)
- Preserve architecture — extend ports, do not bypass layers
- Backward compatible — no breaking REST/MCP responses or tool schemas
- No shortcuts — no `*V2`, no `TODO`/`FIXME`, no stubs
- No `embed()` in `insert()` / `update()`
- No vector/similarity SQL in `MemoryRepository`
- No org/workspace schema (ADR-002 contract only)
- Do not modify: `routes/`, MCP tool schemas, `RankingEngine`, `Retriever` (Phase 6)
- Update tests (unit, repository, mock D1 on schema change)
- Update documentation when architecture or phase status changes

---

## Expected deliverables

| Deliverable | Detail |
|-------------|--------|
| **Code** | `src/embedding/*`, repository port extensions, `config/env.ts` if needed |
| **Tests** | `tests/embedding/*`, repository tests, mock D1 updates |
| **Migration** | `memory_embeddings` in `migrations.ts` (idempotent `ALTER` / `CREATE IF NOT EXISTS`) |
| **Scripts** | `scripts/backfill-embeddings.ts`, `package.json` script |
| **Documentation** | `ARCHITECTURE.md` phase row; ADR-003 → Implemented in `adr/README.md` |
| **Final completion report** | Per [ENGINEERING.md](ENGINEERING.md) output format + definition of done checklist below |

---

## Implementation plan (commits)

| # | Commit | Scope |
|---|--------|--------|
| 0 | Governance docs | ADR policy + adr index (if not on main) |
| 1 | ADR-004 types | `src/types/memory-persistence.ts` — imports only |
| 2 | Provider port | `IEmbeddingProvider` + `NoopEmbeddingProvider` + tests |
| 3 | Schema | `memory_embeddings` + mock D1 |
| 4 | Store port | `IEmbeddingStore` + `D1EmbeddingStore` + repo methods |
| 5 | Job runner | `EmbeddingJobRunner` + backfill script |
| 6 | OpenAI (opt) | `OpenAIEmbeddingProvider` behind env |
| 7 | Docs | ARCHITECTURE + ADR status |

**Files (summary):** `src/embedding/*`, `memory.repository*.ts`, `migrations.ts`, `scripts/backfill-embeddings.ts`

**Quality gate (every commit):**

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

---

## Definition of done

- [ ] ADR-003 & ADR-004 Approved
- [ ] `IEmbeddingProvider` + noop with tests
- [ ] `memory_embeddings` + `D1EmbeddingStore`
- [ ] `EmbeddingJobRunner` + backfill (dry-run default, idempotent)
- [ ] `embedding_id` via `applyEmbeddingBackfill` only — not sync CRUD
- [ ] 110+ tests green; no TODO/FIXME
- [ ] Docs updated; **final completion report** delivered

---

## When Phase 5 completes

Copy [TASK_PROMPT.template.md](TASK_PROMPT.template.md) → replace this file for **Phase 6 Hybrid Retrieval** (after ADR-001 Approved).

---

## References

- [archive/PHASE-5-EMBEDDING-DESIGN.md](archive/PHASE-5-EMBEDDING-DESIGN.md)
- [adr/003-embedding-storage-mvp.md](adr/003-embedding-storage-mvp.md)
- [adr/004-repository-port-types.md](adr/004-repository-port-types.md)
- [adr/002-workspace-identity-model.md](adr/002-workspace-identity-model.md)
