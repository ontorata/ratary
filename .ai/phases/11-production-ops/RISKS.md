# Phase 11 — Production Ops — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Postgres cutover data loss | Medium | Critical | S0–S4 runbook; parity scripts; rollback | Mitigated |
| Default D1 deploy broken | Low | Critical | SQL_PROVIDER=d1 unchanged default | Mitigated |
| Staging harness false positive | Medium | High | postgres-staging.integration.test.ts (skipped CI) | Mitigated |
| Repository split scope creep | Medium | Medium | 11C deferred optional ADR-019 | Deferred |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
