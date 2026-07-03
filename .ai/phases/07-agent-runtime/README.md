# Phase 7 — Agent Runtime

**Status:** Ready  
**Roadmap:** Next
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Single entry point for Phase 7 governance artifacts. Summarizes scope, links all phase documents, and records status relative to [09-ROADMAP.md](../../roadmap/09-ROADMAP.md).

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Phase folder scaffolded at roadmap definition or Readiness PASS |
| **Updated by** | Maintainer until gate PASS; then append-only |
| **Read-only when** | Phase gate PASS and status synced to roadmap |
| **Roadmap relation** | Canonical index for Phase 7 row in roadmap |

---

## Scope summary

See [09-ROADMAP.md — Phase 7](../../roadmap/09-ROADMAP.md).

No external design archive.

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | Reserved |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | Reserved |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | Reserved |
| [TESTING.md](TESTING.md) | Verification strategy | Reserved |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | Reserved |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | Reserved |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | Reserved |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | Reserved |
| [RISKS.md](RISKS.md) | Risk register | Reserved |

---

## Notes

Phase 7 is primarily a **documentation phase** - defining the agent integration boundary. No new implementation in `src/`.

**Key Scope:**
- Agent loops consume MCP/REST externally (outside repo)
- Foundation may add scope hooks per ADR-002
- MCP tool contracts stable for agent consumers
- Optional: `agentId` in `MemoryScope` types (Phase 9)

**Dependencies:** Phase 4 context API ✅, Phase 6 hybrid ✅

---

*Subordinate to [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) and [review/](../review/README.md).*
