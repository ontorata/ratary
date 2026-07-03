# Phase 11 — Production Operations — RISKS

**Document:** RISKS  
**Phase status:** Initial register (scaffold)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register for Postgres production cutover. Updated during design and implementation; frozen at gate PASS.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Phase folder scaffolded (2026-07-03) |
| **Updated by** | Assistant during phase; owner at gate |
| **Read-only when** | Phase gate PASS — deferred risks carry to Phase 12+ |
| **Roadmap relation** | [DESIGN.md](DESIGN.md) §2, [10-POST-ROADMAP.md](../../roadmap/10-POST-ROADMAP.md) |

---

## Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|----|------|------------|--------|------------|--------|
| R11-01 | Schema drift D1 ↔ Postgres | Medium | High | Shared `migrations.ts`; contract tests on both providers | Open |
| R11-02 | Cutover downtime / data loss | Medium | Critical | ADR-018 rollback; dry-run migration scripts | Open |
| R11-03 | Staging Postgres not representative of prod | Medium | High | Document prod sizing; run full E2E on staging | Open |
| R11-04 | Secrets / `DATABASE_URL` leakage | Low | Critical | [11-SECURITY-STANDARD.md](../../core/supplementary/SECURITY.md); no secrets in repo | Open |
| R11-05 | Default D1 regression | Medium | High | Keep `SQL_PROVIDER=d1` default; CI always runs default env first | Open |
| R11-06 | Repository split scope creep (11C) | Medium | Medium | Defer 11C unless ADR-019 Approved; incremental commits | Open |
| R11-07 | SQL dialect edge cases (placeholders, types) | Medium | Medium | Existing `postgres-sql-database.adapter` tests; expand in 11B | Open |
| R11-08 | Owner cutover without backfill | Low | High | Runbook requires data parity check before flip | Open |

---

## Cross-phase deferred risks

| ID | Risk | Carried to |
|----|------|------------|
| T-01 | `MemoryRepository` ~622 lines | Phase 11C or defer |
| — | pgvector / R2 production | Phase 13 |
| — | Event/analytics pipeline | Phase 12 |

---

## Pre-implementation checklist

- [x] ADR-018 **Approved**
- [x] Readiness Review PASS ([CHECKLIST.md](CHECKLIST.md) — conditional 2026-07-03)
- [ ] Staging Postgres instance available (non-production credentials)
- [ ] Rollback owner identified

---

*Initial register 2026-07-03. Verify against DESIGN before gate.*

---

*Do not contradict [10-POST-ROADMAP.md](../../roadmap/10-POST-ROADMAP.md) or Approved ADRs.*
