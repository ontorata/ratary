# Phase 6 — Hybrid Retrieval — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Within 7 days after phase gate PASS |
| **Updated by** | Owner + assistant; maintainer files |
| **Read-only when** | Next phase Readiness PASS — then append-only |
| **Roadmap relation** | Informs future phase risks and process improvements |

---

## Summary

Phase 6 delivered hybrid SQL + vector retrieval behind a feature flag without rewriting `Retriever` or `ContextService`. The port-extension pattern (ADR-001 Option B) proved correct: Phase 8 later added `GraphRetrievalCandidateSource` to the same composite array with no core refactor.

Gate PASS recorded 2026-07-03 — 192 tests at close (196 cited in COMPLETION after follow-up commits).

---

## What worked well

| Area | Outcome |
|------|---------|
| **Port extension over rewrite** | `CompositeRetrievalCandidateSource` wrapped existing sources; `Retriever` and `ContextService` unchanged — validated in REVIEW and reused in Phase 8 graph wiring |
| **Feature flag default-off** | `HYBRID_RETRIEVAL=false` preserved backward compatibility; zero risk to existing SQL-only deployments |
| **RRF merge policy** | ADR-001 + 13 unit tests on dedupe, cap, empty sources, and weighted fusion removed ambiguity before production |
| **Incremental commits** | Per-commit audit in COMPLETION showed monotonic test growth (172 → 192) with no gate regressions |
| **No DDL** | Reused Phase 5 embedding store; MIGRATION.md correctly N/A — faster gate, no production backfill dependency for hybrid path itself |
| **Owner isolation** | Cross-owner E2E regression suite caught scope leaks early; vector source filters `ownerId` consistently |

---

## What was harder than expected

| Area | Note |
|------|------|
| **Embedding provider coupling** | Hybrid mode requires real embeddings (`EMBEDDING_PROVIDER=openai`); `noop` produces tie scores and arbitrary ranking — documented in COMPLETION usage section but easy to misconfigure |
| **Composition root wiring** | Duplicate `MemoryRepository` instances in server/MCP roots were audit debt (resolved later in Phase 9 stabilization) |
| **Scale ceiling** | D1 in-process vector search (~5–10k embeddings/owner MVP) was known from Phase 5 but became visible once hybrid was enabled in production-like tests |

---

## Accepted debt (carried forward)

| ID | Item | Mitigation path | Resolved in |
|----|------|-----------------|-------------|
| T-04 | D1 in-process vector search | Vectorize / pgvector when scale exceeds MVP | Open — Phase 10+ |
| — | `HYBRID_RETRIEVAL` off by default | Ops must opt in + backfill embeddings | By design |
| — | Duplicate `MemoryRepository` in composition roots | Unify factory wiring | ✅ Phase 9 (D-02) |
| — | ADR-001 merge policy unit tests | 13 tests in `composite-retrieval-candidate-source.test.ts` | ✅ Phase 6 close |

---

## Risks — final disposition

| Risk (from RISKS.md) | Outcome |
|----------------------|---------|
| ADR-001 not Approved before code | **Mitigated** — ADR Approved; implementation followed Option B |
| Latency from parallel SQL + vector | **Accepted** — per-source caps; no timeout breach in gate tests |
| Merge policy ambiguity | **Resolved** — RRF documented + unit tested |
| Owner scope leak in vector candidates | **Resolved** — filter + E2E regression |
| MVP vector scale ceiling | **Deferred** — documented; adapter swap path in Phase 5/10 |
| Composition root duplicate repository | **Deferred** → resolved Phase 9 |

---

## Recommendations for later phases

1. **Keep composite array extensible** — Phase 8 graph source plugged in cleanly; future sources (org-scoped, reranker) should follow same `IRetrievalCandidateSource` contract.
2. **Test merge policy when adding a source** — Each new candidate source should extend composite unit tests (dedupe, cap, weight interaction).
3. **Document env prerequisites at gate** — Hybrid retrieval ops checklist (embeddings backfill, provider ≠ noop) belongs in TESTING.md / PANDUAN, not only COMPLETION.
4. **Fill RETROSPECTIVE at gate close** — This document was scaffolded at phase open but left Reserved until post–Phase 9 audit hygiene; future phases should write retrospective within 7 days of PASS.
5. **N/A migration is valid** — Phases that only compose existing persistence need explicit MIGRATION.md note ("no DDL") rather than leaving placeholder text.

---

## Impact on downstream phases

| Phase | How Phase 6 enabled it |
|-------|------------------------|
| **7 Agent Runtime** | Context API unchanged; external agents consume same retrieval stack |
| **8 Knowledge Graph** | `GraphRetrievalCandidateSource` added to composite; RRF merge reused |
| **9 Multi-AI** | Workspace filters added to retrieval sources without Retriever rewrite |
| **10 Enterprise** | Vector scale path (T-04) and optional reranking remain open |

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
