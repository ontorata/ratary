# Phase Review

**Purpose:** Governance artifacts for closing a phase and authorizing the next.  
**Audience:** Project owner, AI assistants, maintainers.  
**Authority:** Subordinate to [constitution/INDEX.md](../../core/constitution/INDEX.md) and [.ai/phases/roadmap/09-ROADMAP.md](../../roadmap/09-ROADMAP.md).

---

## Why this folder exists

Implementation without a formal close produces ambiguous phase status, premature next-phase work, and undocumented debt. This folder defines **when a phase is done** and **when the next phase may start**.

---

## Phase lifecycle

```
Design
  │
  ▼
Implementation
  │
  ▼
Tests
  │
  ▼
Architecture Review
  │
  ▼
Phase Gate          ← 00-PHASE-GATE.md
  │
  ▼
Readiness Review    ← 04-PHASE-READINESS.md (next phase)
  │
  ▼
Next Phase
```

Supporting artifacts:

| Document | When used |
|----------|-----------|
| [01-PHASE-CHECKLIST.md](01-PHASE-CHECKLIST.md) | Throughout lifecycle — verification |
| [02-PHASE-SCORECARD.md](02-PHASE-SCORECARD.md) | At Phase Gate — quality scoring |
| [03-PHASE-RETROSPECTIVE.md](03-PHASE-RETROSPECTIVE.md) | After Phase Gate — lessons captured |
| [04-PHASE-READINESS.md](04-PHASE-READINESS.md) | Before starting next phase |

---

## Rules

- A phase MUST NOT be marked complete in [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) until Phase Gate passes.
- The next phase MUST NOT begin implementation until Readiness Review passes.
- Proposed ADRs MUST NOT be implemented — only **Approved** ADRs satisfy readiness gates.
- AI assistants MUST NOT skip Architecture Review or Phase Gate because tests pass.

---

*Subordinate to [OWNERSHIP.md](../OWNERSHIP.md).*
