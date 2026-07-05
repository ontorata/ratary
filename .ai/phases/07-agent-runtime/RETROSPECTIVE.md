# Phase 7 — Agent Runtime — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for the next phase.

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

Phase 7 closed as a **documentation-only boundary phase**: agent planning and execution remain external; Ratary exposes stable MCP/REST contracts only. Gate PASS 2026-07-03 with 196 tests and no `src/` changes. Successor phases 7.5, 8, 9, and 10 landed without breaking the boundary; MCP SSOT is **22 tools** (`MCP_TOOL_NAMES`, 2026-07-04).

---

## What worked well

| Area | Outcome |
|------|---------|
| **Constitution clarity** | Explicit “no agent in repo” rule prevented scope creep before Phase 8 graph and Phase 9 multi-AI |
| **Protocol-first boundary** | MCP + REST tables in DESIGN §10–12 gave external runtimes a stable integration surface without new code |
| **Architecture review loop** | S1–S4 (error codes, rate limits, JSON-RPC examples, OpenAPI refs) improved DESIGN before gate |
| **Zero migration risk** | No DDL — gate fast; MIGRATION correctly N/A |
| **Downstream reuse** | Phase 8 graph, Phase 9 `agentId`, Phase 15 ecosystem catalog all reference Phase 7 DESIGN without rewrite |

---

## What was harder than expected

| Area | Note |
|------|------|
| **Capability discovery gap** | Agents still needed trial-and-error for limits/flags until **Phase 7.5** added `GET /api/v1/capabilities` (ADR-025) |
| **Document schema vs doc-only phases** | IMPLEMENTATION/TESTING/RETROSPECTIVE scaffolds stayed “Reserved” until explicitly closed — process debt for governance hygiene |
| **Tool count drift** | Gate cited 19 tools; early COMPLETION said 14 — resolved via `MCP_TOOL_NAMES` SSOT (22 post-gate, additive) |

---

## Accepted debt (carried forward)

| ID | Item | Mitigation path | Resolved in |
|----|------|-----------------|-------------|
| D7-01 | No runtime capability manifest | Phase 7.5 extension track | ✅ Phase 7.5 |
| D7-02 | `agentId` not on scope types | Optional hook documented | ✅ Phase 9 |
| D7-03 | Event subscription contract only | No bus until async pipeline | ✅ Phase 12 |
| D7-04 | `organizationId` actor rules documented but not enforced | Enterprise RBAC | ✅ Phase 10 (opt-in) |

---

## Recommendations for subsequent phases

1. **Close all ten phase documents at gate** — even documentation-only phases should mark IMPLEMENTATION/TESTING/MIGRATION/RETROSPECTIVE Complete or N/A, not Reserved.
2. **Split “boundary” from “discovery”** — boundary phases define what agents may call; compatibility phases (7.5) define how they learn limits.
3. **Keep agent orchestration out of `MemoryService`** — Phase 15 ecosystem catalog extends metadata, not execution.
4. **Reference Phase 7 DESIGN §10** when adding new protocol surfaces — preserve additive MCP/REST changes only.

---

## Successor closure (2026-07-04)

| Phase | Debt / plan from Phase 7 | Outcome |
|-------|--------------------------|---------|
| **7.5** | D7-01 capability discovery | ✅ `get_capabilities` (ADR-025) |
| **8** | Graph readiness §19 | ✅ Graph MCP + composite leg |
| **9** | D7-02 `agentId` scope | ✅ Multi-AI tools + scope resolver |
| **10** | D7-04 org actor rules | ✅ Org RBAC adapters (opt-in) |
| **12** | D7-03 event bus §17 | ✅ Event pipeline ADR-020 (opt-in bus) |
| **04.7 / 5.5** | — | ✅ Additive `run_stewardship`, `get_compression_status` |

Regression at platform snapshot: **722 passed** | 3 skipped. Phase 7 boundary unchanged — no planner in `src/services/` or `src/memory/`.

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
