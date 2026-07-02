# 10 — Phase Status

**Status:** Living operational snapshot (mutable).  
**Audience:** AI assistants and maintainers.  
**Authority:** Subordinate to [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) (structural law) and [09-ROADMAP.md](../roadmap/09-ROADMAP.md) (phase narratives).

**Last updated:** Phase 5 complete Â· Next: Phase 6 (blocked: ADR-001 Approved)

---

# Purpose

Record **live** project metrics, deployment facts, and documented technical debt.

**Not covered here:** layer boundaries, ports, dependency graphs, or capability stack — see [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md). Phase plans and narratives — see [09-ROADMAP.md](../roadmap/09-ROADMAP.md). Gate evidence — see `.ai/phases/NN-name/`.

---

# Live metrics

| Metric | Value |
|--------|-------|
| Tests passing | 152 |
| MCP tools | 14 |
| REST deploy | Vercel (`api/index.ts`) |
| MCP entry | `npm run mcp` / `npm run setup` |
| Storage | Cloudflare D1 (HTTP API) |
| Local dev | `npm run dev` â†’ `dev-server.ts` |

---

# Current phase pointer

| Item | Value |
|------|-------|
| Active task | [TASK_PROMPT.md](../TASK_PROMPT.md) |
| Next phase | 6 — Hybrid Retrieval |
| Blocker | [adr/001-multi-source-retrieval.md](../../docs/adr/001-multi-source-retrieval.md) status **Proposed** |
| Phase 6 ops folder | [.ai/phases/06-hybrid-retrieval/](../phases/06-hybrid-retrieval/README.md) |

Strategic phase status (completed / next / future): [09-ROADMAP.md](../roadmap/09-ROADMAP.md) Â§Summary.

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

| ID | Item | Mitigation path |
|----|------|-----------------|
| D-01 | API cross-owner leak E2E tests missing | Phase 6 or hardening sprint |
| D-02 | Duplicate `MemoryRepository` in composition roots | Phase 6 wiring |
| D-03 | `schema.sql` drift from `migrations.ts` | Maintenance PR |
| D-04 | ADR-001 merge policy must be unit-tested | Phase 6 |
| — | `MemoryRepository` ~729 lines | Additive methods only; split when Postgres adapter lands |
| — | `MemoryRelationRepository` no interface | `IMemoryRelationRepository` before Phase 8 |
| — | Search uses `SELECT *` | Projection refactor (perf) |
| — | NÃ— `recordAccess` on context build | Batch update (perf) |
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
