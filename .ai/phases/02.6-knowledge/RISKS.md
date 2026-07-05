# Phase 2.6 — Knowledge Foundation — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-06-30  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Slug/codename collision | Medium | Medium | Unique constraints; generator unit tests | Mitigated |
| Summary quality variance | Medium | Low | Rule-based on CRUD; async LLM via `COMPRESSION_POLICY=llm` + `npm run enrich:summaries` / consolidation jobs; OpenAI fallback to rule | Mitigated |
| Keyword normalization false positives | Low | Low | Normalizer tests; manual review path | Mitigated |

---

*Gate PASS 2026-06-30 — realized risks locked; deferred items tracked above or in CHECKLIST.*
