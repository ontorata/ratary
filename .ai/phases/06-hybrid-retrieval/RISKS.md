# Phase 6 — Hybrid Retrieval — RISKS

**Document:** RISKS  
**Phase status:** Active  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks for hybrid retrieval.

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

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| ADR-001 not Approved before code | High | Blocker | Halt implementation; owner approves ADR | **Open** |
| Latency from parallel SQL + vector sources | Medium | Medium | Per-source caps; parallel fetch with timeout | Identified |
| Merge policy ambiguity | Medium | High | Document in ADR-001; unit test dedupe/cap | Identified |
| Ranking engine coupling | Low | Medium | Fusion in pure `RankingEngine`; no service logic | Identified |
| Owner scope leak in vector candidates | Low | Critical | Filter `ownerId` in `VectorRetrievalCandidateSource`; E2E tests | Identified |
| MVP vector scale ceiling (~5–10k/owner) | Medium | Medium | Documented in Phase 5; adapter swap path | Deferred to Phase 8+ |
| Composition root duplicate `MemoryRepository` | Medium | Medium | Unify during Phase 6 wiring (audit debt) | Identified |

---

*Cross-phase risks: [09-ROADMAP.md — Risks](../../../roadmap/09-ROADMAP.md#risks-cross-phase).*
