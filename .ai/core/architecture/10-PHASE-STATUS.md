# 10 — Phase Status

**Status:** Living operational snapshot (mutable).  
**Audience:** AI assistants and maintainers.  
**Authority:** Subordinate to [04-ARCHITECTURE.md](../04-ARCHITECTURE.md) (structural law) and [09-ROADMAP.md](../../phases/roadmap/09-ROADMAP.md) (phase narratives).

**Last updated:** Phase governance doc sync (2026-07-04)

---

# Purpose

Record **live** project metrics, deployment facts, and documented technical debt.

**Not covered here:** layer boundaries, ports, dependency graphs, or capability stack — see [04-ARCHITECTURE.md](../04-ARCHITECTURE.md). Phase plans and narratives — see [09-ROADMAP.md](../../phases/roadmap/09-ROADMAP.md). Gate evidence — see `.ai/phases/NN-name/`.

---

# Live metrics

| Metric | Value |
|--------|-------|
| Tests passing | 689 (692 total, 3 skipped) |
| MCP tools | 20 |
| REST deploy | Vercel (`api/index.ts`) |
| MCP entry | `npm run mcp` / `npm run setup` |
| Remote MCP | `REMOTE_MCP_ENABLED` → `/mcp` (Phase 13.1) |
| Storage (default) | Cloudflare D1 (HTTP API) |
| Local dev | `npm run dev` → `dev-server.ts` |
| Platform adapters | Opt-in via env — see [ADR-008–048](../../../docs/adr/README.md) |

---

# Current phase pointer

| Item | Value |
|------|-------|
| **Core memory path** | Phases 1–11 ✅ — default deploy unchanged |
| **Enterprise platform** | Phases 10.5–25 ✅ Implemented — **all default OFF** |
| **Extension tracks** | 04.7, 05.5–09.8 ✅ Implemented — opt-in |
| **Last platform gate** | Phase 25 Global Intelligence (2026-07-04) |
| **Active task** | Maintenance / POST-ROADMAP — see [TASK_PROMPT.md](../../TASK_PROMPT.md) |
| **Governance index** | [phases/README.md](../../phases/README.md) — phases 1–25 |
| **Blocker** | None |

Strategic phase status: [09-ROADMAP.md](../../phases/roadmap/09-ROADMAP.md) · POST-ROADMAP: [10-POST-ROADMAP.md](../../phases/roadmap/10-POST-ROADMAP.md).

---

# Deployment and ops commands

| Command | Purpose |
|---------|---------|
| `npm run db:migrate` | Apply D1 migrations |
| `npm run db:backfill-memory-intelligence` | Phase 4 intelligence backfill |
| `npm run db:backfill-embeddings` | Embedding backfill (dry-run default) |
| `npm run db:backfill-workspaces` | Phase 9 default workspace backfill |
| `npm run db:backfill-organizations` | Phase 10 organization backfill |
| `npm run db:backfill-pgvector` | D1 embeddings → pgvector (dry-run default) |
| `npm run db:backfill-meilisearch` | Memories → Meilisearch index |
| `npm run db:backfill-neo4j` | Relations → Neo4j graph |
| `npm run consolidate:memories` | Memory consolidation (dry-run default) |

User onboarding: [PANDUAN.md](../../../docs/PANDUAN.md).  
New dev environment: [README.md § Instalasi](../../../README.md#instalasi-pada-lingkungan-pengembangan-baru).

---

# Known technical debt

| ID | Item | Mitigation path | Status |
|----|------|-----------------|--------|
| ~~D-01~~ | ~~API cross-owner leak E2E tests missing~~ | ✅ **Resolved** — 20 security tests in `tests/api/cross-owner-leak.test.ts` (2026-07-03) |
| ~~D-02~~ | ~~Duplicate `MemoryRepository` in composition roots~~ | ✅ **Resolved** — shared repository instance (2026-07-03) |
| ~~D-03~~ | ~~`schema.sql` drift from `migrations.ts`~~ | ✅ **Resolved** — schema.sql synced (2026-07-03) |
| ~~D-04~~ | ~~ADR-001 merge policy must be unit-tested~~ | ✅ **Resolved** — 13 unit tests (2026-07-03) |
| — | `MemoryRepository` ~622 lines | Additive methods only; split when Postgres adapter lands |
| ~~O-04-2~~ | ~~Retrieval projection content exclusion~~ | ✅ **Resolved** — regression test (2026-07-03) |
| ~~—~~ | ~~N× `recordAccess` on context build~~ | ✅ **Resolved** — `recordAccessBatch` (2026-07-03) |
| ~~—~~ | ~~D1 vector search in-process~~ | ✅ **Mitigated** — pgvector adapter (ADR-011) |
| D-GOV | Phase governance scaffolds (Reserved/N/A) | ✅ **Mitigated** — backfill script + manual close 2026-07-04 |

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

*Operational snapshot only. Historical full architecture doc: [archive/ARCHITECTURE.md](../../../docs/archive/ARCHITECTURE.md).*
