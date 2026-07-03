# 10 — Phase Status

**Status:** Living operational snapshot (mutable).  
**Audience:** AI assistants and maintainers.  
**Authority:** Subordinate to [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) (structural law) and [09-ROADMAP.md](../roadmap/09-ROADMAP.md) (phase narratives).

**Last updated:** D-01, D-02, D-03 resolved (2026-07-03) · Phase 5 complete · Next: Phase 6 (blocked: ADR-001 Approved)

---

# Purpose

Record **live** project metrics, deployment facts, and documented technical debt.

**Not covered here:** layer boundaries, ports, dependency graphs, or capability stack — see [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md). Phase plans and narratives — see [09-ROADMAP.md](../roadmap/09-ROADMAP.md). Gate evidence — see `.ai/phases/NN-name/`.

---

# Live metrics

| Metric | Value |
|--------|-------|
| Tests passing | 172 |
| MCP tools | 14 |
| REST deploy | Vercel (`api/index.ts`) |
| MCP entry | `npm run mcp` / `npm run setup` |
| Storage | Cloudflare D1 (HTTP API) |
| Local dev | `npm run dev` → `dev-server.ts` |

---

# Current phase pointer

| Item | Value |
|------|-------|
| Active task | [TASK_PROMPT.md](../TASK_PROMPT.md) |
| Next phase | 6 — Hybrid Retrieval |
| Blocker | ~~ADR-001 Proposed~~ ✅ **Approved** (2026-07-03) |
| Phase 6 ops folder | [.ai/phases/06-hybrid-retrieval/](../phases/06-hybrid-retrieval/README.md) |

Strategic phase status (completed / next / future): [09-ROADMAP.md](../roadmap/09-ROADMAP.md) §Summary.

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
| D-04 | ADR-001 merge policy must be unit-tested | Phase 6 (in progress) | In progress |
| — | `MemoryRepository` ~692 lines | Additive methods only; split when Postgres adapter lands |
| ~~—~~ | ~~`MemoryRelationRepository` no interface~~ | ✅ **Resolved** — `IMemoryRelationRepository` created (2026-07-03) |
| — | `SELECT *` in repositories | **Investigated (2026-07-03)** — postponed; benefit minimal without content projection; revisit after Phase 6 |
| — | N× `recordAccess` on context build | Batch update (perf) — low-medium effort |
| — | D1 vector search in-process | Vectorize/pgvector when scale exceeds MVP ceiling |

Aggregate audit: [.ai/audits/latest.md](../audits/latest.md).

---

# Update triggers

Update this file when:

- Phase gate PASS or release ships
- Test count or MCP tool count changes materially
- Deployment target changes
- New cross-phase debt is documented

Do **not** duplicate structural architecture from [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) here.

---

*Operational snapshot only. Historical full architecture doc: [archive/ARCHITECTURE.md](../../docs/archive/ARCHITECTURE.md).*
