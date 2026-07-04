# Phase 5 — Embedding — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-01  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record verification strategy and evidence: unit, integration, E2E, fixtures, quality gate.

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

| Metric | Value |
|--------|-------|
| Phase gate (2026-07-01) | 152 tests green |
| Current regression | 689 passed | 3 skipped (default env, 2026-07-04) |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/embedding/noop-embedding.provider.test.ts` | Default noop provider |
| `tests/embedding/create-embedding-provider.test.ts` | Factory wiring |
| `tests/embedding/d1-embedding.store.test.ts` | Vector storage + searchSimilar |
| `tests/embedding/cosine-similarity.test.ts` | Similarity math |
| `tests/db/embedding-migration.test.ts` | Embedding table DDL |

---

## Scenarios verified

- [x] No sync embed on MemoryService CRUD hot path
- [x] No vector SQL inside `MemoryRepository` — ADR-003 boundary
- [x] `EMBEDDING_PROVIDER=noop` default unchanged
- [x] Backfill skips unchanged `content_hash`

## Manual verification

```bash
`EMBEDDING_PROVIDER=openai npm run db:backfill-embeddings` on staging sample
```

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
