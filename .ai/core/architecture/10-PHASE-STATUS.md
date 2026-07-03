# 10 — Phase Status

**Status:** Living operational snapshot (mutable).  
**Audience:** AI assistants and maintainers.  
**Authority:** Subordinate to [04-ARCHITECTURE.md](../04-ARCHITECTURE.md) (structural law) and [09-ROADMAP.md](../../phases/roadmap/09-ROADMAP.md) (phase narratives).

**Last updated:** Phase 8 Knowledge Graph implementation complete (2026-07-03) · ADR-006 Implemented · Next: Phase 8 gate review

---

# Purpose

Record **live** project metrics, deployment facts, and documented technical debt.

**Not covered here:** layer boundaries, ports, dependency graphs, or capability stack — see [04-ARCHITECTURE.md](../04-ARCHITECTURE.md). Phase plans and narratives — see [09-ROADMAP.md](../../phases/roadmap/09-ROADMAP.md). Gate evidence — see `.ai/phases/NN-name/`.

---

# Live metrics

| Metric | Value |
|--------|-------|
| Tests passing | 227 |
| MCP tools | 16 |
| REST deploy | Vercel (`api/index.ts`) |
| MCP entry | `npm run mcp` / `npm run setup` |
| Storage | Cloudflare D1 (HTTP API) |
| Local dev | `npm run dev` → `dev-server.ts` |

---

# Current phase pointer

| Item | Value |
|------|-------|
| Active task | [TASK_PROMPT.md](../../TASK_PROMPT.md) |
| Next phase | **8 — Knowledge Graph** (gate review) |
| Blocker | None — ADR-006 Approved; implementation steps 1–6 complete |
| Last completed | Phase 7 — [.ai/phases/07-agent-runtime/](../07-agent-runtime/README.md) |
| In progress | Phase 8 — [.ai/phases/08-knowledge-graph/](../08-knowledge-graph/README.md) |

Strategic phase status (completed / next / future): [09-ROADMAP.md](../../phases/roadmap/09-ROADMAP.md) §Summary.

---

# Deployment and ops commands

| Command | Purpose |
|---------|---------|
| `npm run db:migrate` | Apply D1 migrations |
| `npm run db:backfill-memory-intelligence` | Phase 4 intelligence backfill |
| `npm run db:backfill-embeddings` | Embedding backfill (dry-run default) |
| `npm run consolidate:memories` | Memory consolidation (dry-run default) |

User onboarding: [PANDUAN.md](../../docs/PANDUAN.md).

---

# Known technical debt

| ID | Item | Mitigation path | Status |
|----|------|-----------------|--------|
| ~~D-01~~ | ~~API cross-owner leak E2E tests missing~~ | ✅ **Resolved** — 20 security tests in `tests/api/cross-owner-leak.test.ts` (2026-07-03) |
| ~~D-02~~ | ~~Duplicate `MemoryRepository` in composition roots~~ | ✅ **Resolved** — Refactored `createMemoryService/createMemoryRelationService` to accept shared repository instance (2026-07-03) |
| ~~D-03~~ | ~~`schema.sql` drift from `migrations.ts`~~ | ✅ **Resolved** — schema.sql synced with all Phase 4 indexes (2026-07-03) |
| ~~D-04~~ | ~~ADR-001 merge policy must be unit-tested~~ | ✅ **Resolved** — 13 unit tests for `CompositeRetrievalCandidateSource` (2026-07-03) |
| — | `MemoryRepository` ~622 lines | Additive methods only; split when Postgres adapter lands |
| ~~—~~ | ~~`MemoryRelationRepository` no interface~~ | ✅ **Resolved** — `IMemoryRelationRepository` created (2026-07-03) |
| ~~O-04-2~~ | ~~Retrieval projection content exclusion — verify all paths~~ | ✅ **Resolved** — regression test in `tests/repositories/memory.repository.test.ts` (2026-07-03) |
| — | `SELECT *` in non-retrieval repository queries | **Investigated (2026-07-03)** — postponed; retrieval paths use `RETRIEVAL_MEMORY_SELECT`; revisit with Postgres adapter |
| — | N× `recordAccess` on context build | Batch update (perf) — low-medium effort |
| — | D1 vector search in-process | Vectorize/pgvector when scale exceeds MVP ceiling |

Aggregate audit: [.ai/phases/audits/latest.md](../../phases/audits/latest.md).

---

# Update triggers

Update this file when:

- Phase gate PASS or release ships
- Test count or MCP tool count changes materially
- Deployment target changes
- New cross-phase debt is documented

Do **not** duplicate structural architecture from [04-ARCHITECTURE.md](../04-ARCHITECTURE.md) here.

---

*Operational snapshot only. Historical full architecture doc: [archive/ARCHITECTURE.md](../../docs/archive/ARCHITECTURE.md).*
