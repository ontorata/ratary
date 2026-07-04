# Phase 7 — Agent Runtime

**Status:** ✅ Completed (documentation boundary — agent runtime external)
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
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ N/A (no DDL) or prior phase |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-03.*


---

## Notes

**Phase 7 Gate: PASS** (2026-07-03)

Phase 7 is a **documentation-only boundary phase** — agent runtime external; no new implementation in `src/`. All ten governance documents closed (IMPLEMENTATION/TESTING complete; MIGRATION N/A).

**Key Scope:**
- Agent loops consume MCP/REST externally (outside repo)
- Foundation may add scope hooks per ADR-002
- MCP tool contracts stable for agent consumers
- Optional: `agentId` in `MemoryScope` types — ✅ Phase 9

**Dependencies:** Phase 4 context API ✅ · Phase 6 hybrid ✅ · Post-gate: Phase 7.5 capabilities ✅ · Phase 8 graph ✅ · Phase 9 multi-AI ✅

### Platform snapshot (post-gate — agent integration surface)

| Surface | Status | Reference |
|---------|--------|-----------|
| MCP tools | **22** (SSOT `MCP_TOOL_NAMES`) | `src/capabilities/mcp-tool-names.ts` |
| Capability manifest | `get_capabilities` + REST | Phase 7.5 (ADR-025) |
| Graph | `traverse_relations`, `get_graph_capabilities` | Phase 8 |
| Workspace / agents | `list_workspaces`, `list_agents`, `register_agent` | Phase 9 |
| Stewardship / compression | `run_stewardship`, `get_compression_status` | Phase 04.7 / 5.5 |
| Regression suite | 722 passed \| 3 skipped (2026-07-04) | `npm test` |

*Phase 7 gate (2026-07-03) verified **19 MCP tools** and **196 tests** with zero `src/` changes. Additive tools above preserve Phase 7 boundary — no agent planner in repo.*

---

*Subordinate to [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) and [review/](../review/README.md).*
