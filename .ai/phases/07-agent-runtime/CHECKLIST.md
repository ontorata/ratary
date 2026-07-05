# Phase 7 — Agent Runtime — CHECKLIST

**Document:** CHECKLIST  
**Phase status:** Complete (gate PASS 2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Executable gate checklist instance — one item per milestone or success criterion.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Phase open (Readiness PASS) from [review/01-PHASE-CHECKLIST.md](../review/01-PHASE-CHECKLIST.md) |
| **Updated by** | Assistant during phase; owner signs at gate |
| **Read-only when** | Phase gate PASS — frozen snapshot |
| **Roadmap relation** | Each item traces to milestone or success criterion |

---

## Phase checklist

### Milestones

- [x] Agent runtime ADR (external system) — No internal ADR needed
- [x] MCP tool contracts stable for agent consumers — 19 at gate (`tests/mcp/tools.test.ts`); SSOT 22 post-gate (`MCP_TOOL_NAMES`)
- [x] Optional: `agentId` in `MemoryScope` types — ✅ Phase 9 landed
- [x] Documentation for agent integration boundary — DESIGN.md created

### Success criteria

- [x] External agent can complete save → context → act loop via MCP
- [x] No agent planner code in `src/services/` or `src/memory/`
- [x] Constitution boundary preserved

### Quality gate

- [x] `npm run lint && npm run format:check && npm run typecheck && npm test` — green (196 tests)
- [x] [08-REVIEW-CHECKLIST.md](../../core/standards/08-REVIEW.md) satisfied — No code changes
- [x] ARCHITECTURE.md Phase 7 row updated
### Architecture review suggestions (S1–S4)

- [x] S1 — Standard error codes in CapabilityManifest (`DESIGN.md` §10)
- [x] S2 — Rate limiting expectations per capability (`DESIGN.md` §10)
- [x] S3 — JSON-RPC examples per MCP tool (`DESIGN.md` §11)
- [x] S4 — OpenAPI schema reference (`DESIGN.md` §12)

### Architecture review optional items (P1–P2)

- [x] P1 — `organizationId` actor rules (`DESIGN.md` §14)
- [x] P1 — Expanded constitutional + ADR checklists (`DESIGN.md` §20)
- [x] P2 — Event subscription scope matrix (`DESIGN.md` §17)
- [x] P2 — Future phase links Phases 8–11 (`DESIGN.md` §23)

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
