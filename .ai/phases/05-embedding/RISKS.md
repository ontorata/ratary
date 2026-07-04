# Phase 5 — Embedding — RISKS

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

| ID | Risk | Status | Mitigation / resolution |
|----|------|--------|-------------------------|
| R-05-1 | Sync embed blocks CRUD latency | Mitigated | Async `EmbeddingJobRunner` + backfill script only |
| R-05-2 | Vector SQL leaks into `MemoryRepository` | Mitigated | `D1EmbeddingStore` owns vector persistence (ADR-003) |
| R-05-3 | MVP vector scale ceiling (~5–10k/owner on D1 JSON) | **Resolved** | Documented in ADR-003; **swap path landed Phase 10** — `PgVectorStoreAdapter` (ADR-011), `VECTOR_PROVIDER=pgvector`, `scripts/backfill-pgvector.ts` |
| R-05-4 | Provider vendor lock-in | Mitigated | `IEmbeddingProvider` port; noop + OpenAI behind env |

Audit cross-ref: [O-05-3](../audits/phase-05.md) — closed 2026-07-04.

---

## Deferred (not Phase 5 scope)

| Risk | Owner phase | Notes |
|------|-------------|-------|
| Cloudflare Vectorize adapter | Future ADR | pgvector covers Postgres path; Vectorize optional |
| Embed-on-create webhook/cron | Ops | Backfill script sufficient for MVP |

---

## Realized risks

_None at Phase 5 gate._

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
