# ADR-059: Inspection Pattern Ledger (Phase 08.8)

**Status:** Implemented  
**Date:** 2026-07-05  
**Approved:** 2026-07-05 (owner — wave 8.8A–E)  
**Implemented:** 2026-07-05 — signals, ledger store, miner, confidence, REST, Forge hooks, Charter promoter  
**Deciders:** Project owner  

---

## Context

Stakeholders want **evidence-based institutional memory** from inspection workflows (Agent Forge Inspect, CI, MCP signals) — similar in *intent* to external PR review learning products, but implemented as Ratary memory-cloud + learning pipeline extensions.

Phase 08.5 ingests quality signals; Phase 08.6 defines learning engines with **L23 Pattern Mining** and **L27 Feedback Learning** still stubbed. Phase 07.1 Agent Forge defines Inspect/Remember stages without persistent pattern extraction.

Design: [.ai/phases/08.8-inspection-pattern-ledger/DESIGN.md](../phases/08.8-inspection-pattern-ledger/DESIGN.md)

## Problem

- Repeated inspection failures are not systematically captured as scoped patterns with confidence
- Handoff memories are session-oriented, not diff-trigger oriented
- Generic learning stubs do not define inspection-specific acted-upon rules or Charter promotion

## Constraints

- Constitution: no agent runtime in `src/`; no autonomous loops
- MemoryService CRUD signatures unchanged when `INSPECTION_LEDGER_ENABLED=false`
- Hot path: signal append only; miner runs batch/stewardship
- Knowledge content mutation only via orchestrator creating typed memory rows — not inline CRUD rewrite
- Original vocabulary — do not replicate external product naming or docs

## Decision

Adopt **Phase 08.8 Inspection Pattern Ledger**:

1. New signal type `inspection_outcome` (Phase 8.5 extension)
2. Side-store `inspection_patterns` + deterministic `IInspectionPatternMiner` (implements L23 specialization)
3. `IInspectionConfidencePolicy` + feedback hook (L27 specialization)
4. Consumption via MCP recall + Forge skills — patterns inform, never replace constitutional blockers
5. Optional **Charter Pattern** promotion via Phase 14 Federation (`INSPECTION_CHARTER_ENABLED`)

Default: `INSPECTION_LEDGER_ENABLED=false`.

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Fold entirely into 8.6 without new phase | Loses governance clarity; L23/L27 scope too broad |
| LLM extraction on every inspect | Violates hot-path + constitution boundaries |
| Store patterns only as untyped handoff notes | No confidence, decay, or contradiction model |
| Built-in GitHub PR review bot | Out of scope — external agents consume MCP |

## Consequences

**Positive**

- Closes D86-02 / D86-03 inspection slice with explicit phase gate
- Forge Inspect becomes memory-informed over time
- Federation path for org-wide engineering charters

**Negative**

- Additional side-store and migration
- Operators must understand flag combo: 8.5 + 8.6 + 8.8

## Rollback

Disable `INSPECTION_LEDGER_ENABLED`; miner and recall hooks no-op; tables dormant.

## References

- ADR-026 (Phase 8.5 signals)
- ADR-057 (Phase 8.6 learning)
- ADR-029 (Federation — Charter Patterns)
- Phase 07.1 Agent Forge
- External inspiration (not implementation): [Optimal Review Memory](https://getoptimal.ai/docs/agentic-code-reviews/review-memory)

## Implementation

**Shipped (2026-07-05):**

| Wave | Deliverable |
|------|-------------|
| 8.8A | `inspection_outcome` signal, normalizers, `signal.inspection_outcome` events |
| 8.8B | `inspection_patterns` side-store, `DefaultInspectionPatternMiner`, CLI `inspection:mine` |
| 8.8C | Confidence decay, `inspection_pattern_contradictions` |
| 8.8D | `GET /api/v1/inspection-patterns`, Forge skill hooks, recall memories |
| 8.8E | `CharterPatternPromoter` (gated) |

Tests: 783 passed (default env regression 0). See [COMPLETION.md](../phases/08.8-inspection-pattern-ledger/COMPLETION.md).
