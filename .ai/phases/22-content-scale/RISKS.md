# Phase 22 — Content Scale — RISKS

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
| R2 offload orphan inline content | Medium | Medium | CONTENT_OFFLOAD_CLEAR_INLINE opt-in | Accepted |
| pgvector sync partial failure | Medium | High | Watermark + dry-run backfill scripts | Mitigated |
| Embedding job overload | Medium | Medium | EMBEDDING_JOB_MAX_MEMORIES + EMBEDDING_BATCH_SIZE caps; batch runner | Mitigated |
| Object storage credentials exposure | Low | Critical | Env-only secrets; never in manifest | Mitigated |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
