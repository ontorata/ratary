# Phase 2.6 — Knowledge Foundation — RISKS

**Document:** RISKS  
**Phase status:** Closed  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Design phase — initial risk register |
| **Updated by** | Assistant during phase; owner validates at gate |
| **Read-only when** | Gate PASS — realized risks locked; deferred risks noted |
| **Roadmap relation** | Phase slice of roadmap cross-phase and phase-specific risks |

---

## Risk register

| Risk | Status | Mitigation |
|------|--------|------------|
| Codename race under concurrent create | Mitigated | W7: `allocateCodename` + UNIQUE index + retry (max 3) in `MemoryRepository` |
| UNIQUE index migration fails on duplicates | Mitigated | W5: `scripts/backfill-knowledge.ts` before `migrateKnowledgeFoundationPhase3()` |
| FK not enforced on D1 | Mitigated | W10: app-level cascade + E2E leak tests; Postgres staging for FK proof (Phase 11) |
| Search slow at scale | Deferred | Candidate cap in search; full FTS/hybrid in Phase 6 |
| MockD1 drift from production D1 | Mitigated | E2E API tests + `tests/api/knowledge.test.ts`; integration harness Phase 11 |

---

## Realized risks

_None recorded at gate._

---

## Deferred risks

| Risk | Owner phase | Notes |
|------|-------------|-------|
| Search relevance at large corpus | Phase 6 | Hybrid retrieval + vector ranking |
| Enterprise tenant boundary | Resolved Phase 10 | `organizations` + `organization_id` on workspaces; no `tenant_id` column |

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
