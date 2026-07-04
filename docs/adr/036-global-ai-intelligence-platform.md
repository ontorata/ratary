# ADR-036: Global AI Intelligence Platform (Phase 25)

**Status:** Proposed
**Date:** 2026-07-04
**Deciders:** Project owner

---

## Context

AI-Brain has federation (Phase 14), cloud control plane (Phase 18), and observability exporters (Phase 19) reserved. What is missing is a **composition capstone** that turns AI-Brain into a globally distributed AI Intelligence Platform: one that observes its own usage and synchronizes knowledge across the globe **without collecting user content unnecessarily**.

Design: [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md)

## Problem

Three gaps block the "world-leading Collaborative Memory Intelligence Platform" goal:

1. No **semantic telemetry** model (only raw Phase 19 metrics).
2. No **usage analytics** deriving quality/adoption/cost/latency.
3. No unified **Workspace → Org → Cloud → Edge → Developer** sync topology with offline + conflict handling.

## Constraints

- Constitution: no `MemoryService` change, no `*V2` fork, ports before implementation, scope on every path, default OFF.
- Vision #1 (knowledge independence), #2 (team ownership), #3 (immutable SSOT, adaptive policy only).
- Must not duplicate Phase 14/18/19 ports — compose them.
- REST v1 / MCP schemas remain additive.

## Alternatives

### Option A — Extend each of Phase 14/18/19 in place
- Pros: no new phase.
- Cons: cross-cutting telemetry/analytics/sync concerns smeared across three phases; unclear ownership; violates single-canonical-owner.

### Option B — New capstone Phase 25 composing existing ports (chosen)
- Pros: one owner for the distributed-intelligence concern; reuses ports; additive; clean boundary.
- Cons: introduces a new module (`src/intelligence/`).

### Option C — External analytics/telemetry product
- Pros: zero core code.
- Cons: breaks vendor-neutrality and knowledge independence; no in-repo governance.

## Decision

Adopt **Option B**: a capstone Phase 25 with a new `src/intelligence/` module exposing telemetry, analytics, and global-sync orchestration **ports**, composing Phase 14/18/19 ports and calling `MemoryService` as a library. Master flag `GLOBAL_INTELLIGENCE_PLATFORM=false` (default). Sub-decisions in ADR-037 (telemetry model), ADR-038 (analytics), ADR-043 (sync topology).

## Tradeoffs

Accept a new module and four ADRs in exchange for a clean, single-owner, swappable, privacy-first distributed intelligence layer that never touches SSOT signatures.

## Migration

| Step | Action | Server impact |
|------|--------|---------------|
| M1 | Add ports + noop adapters; master flag OFF | None |
| M2 | Wire telemetry recorder at middleware boundary (noop sink) | Additive middleware |
| M3 | Analytics store adapter (ADR-013) read-only | New async consumer |
| M4 | Global sync orchestrator over Phase 14 exchange | Additive, gated |

## Rollback

Set `GLOBAL_INTELLIGENCE_PLATFORM=false` — recorder/orchestrator become noop; MemoryService and repositories unchanged.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 14 Federation | Reused by sync orchestrator (no change) |
| 18 Cloud | Reused for region hub/metering (no change) |
| 19 Observability | Telemetry sinks reuse exporters |
| 20 AI Infrastructure | Telemetry/analytics registrable as plugins |

---

## References

- [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md)
- [ADR-037](037-ai-telemetry-event-model.md) · [ADR-038](038-usage-analytics-engine.md) · [ADR-043](043-cloud-federation-sync-topology.md)
- [POLICY.md](POLICY.md)
