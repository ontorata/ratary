# Phase 5 — Embedding — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-07-01  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Sync embed blocks CRUD hot path | Medium | Critical | Async job runner only; ADR-003 | Mitigated |
| Vector SQL in MemoryRepository | Medium | High | IEmbeddingStore port boundary | Mitigated |
| OpenAI cost runaway | Medium | Medium | noop default; backfill dry-run | Mitigated |
| D1 vector scale ceiling | High | Medium | Document MVP limit; pgvector path Phase 10 | Deferred — ADR-011 |

---

*Gate PASS 2026-07-01 — realized risks locked; deferred items tracked above or in CHECKLIST.*
