# Inspection Pattern Ledger
**Status:** Draft — pending owner approval  
**Slug:** inspection-pattern-ledger  
**Phase:** [08.8-inspection-pattern-ledger](../phases/08.8-inspection-pattern-ledger/README.md)  
**ADR:** [ADR-059](../adr/059-inspection-pattern-ledger.md) (Proposed)

---

## Problem

Inspection failures (boundary, ADR, tests) recur across Agent Forge sessions. Handoff memories capture chat context, not **confirmed, scoped patterns** with confidence and lifecycle. Phase 8.6 L23/L27 stubs need a concrete domain.

## Constraints (constitution / ADR)

- No agent runtime in `src/`
- Hot path: signal append only (ADR-026, ADR-057)
- Patterns inform Inspect — do not replace constitutional blockers
- Federation Charter promotion opt-in (ADR-029)

## Decision

New extension track **Phase 08.8** with:

- Signal `inspection_outcome` (resolved major+ only → miner)
- Side-store ledger + deterministic miner
- Confidence decay + protected + contradiction edges
- Forge/MCP consumption

Full design: [DESIGN.md](../phases/08.8-inspection-pattern-ledger/DESIGN.md)

## Alternatives considered

1. **Only extend forge-remember tags** — no confidence/decay; rejected.
2. **Implement inside 8.6 without phase** — rejected; weak gate evidence.
3. **External PR bot** — rejected; out of constitution scope.

## Impact (layers, ports, tests)

| Layer | Change |
|-------|--------|
| ingest | Signal type + normalizer |
| learning | Miner, confidence, optional promoter |
| infrastructure | SQL side-store migration |
| Forge | Skill doc hooks only |
| tests | ≥ 12 new unit/integration tests |

## Open questions

1. Minimum `evidenceCount` before surfacing in Inspect? (proposal: 2)
2. Charter promotion threshold — N workspaces? (proposal: 3, owner confirm)
3. Ship 8.8E in same gate or follow-up? (proposal: follow-up)

---

*Promote to phase DESIGN.md after owner approves sections — do not duplicate; link from phase SSOT.*
