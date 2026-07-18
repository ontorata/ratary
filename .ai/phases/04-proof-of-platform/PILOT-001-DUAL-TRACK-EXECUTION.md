# PILOT-001 — Dual-Track Execution (ARCH-0044)

| Field | Value |
|-------|-------|
| **Authority** | Ratary **ARCH-0044** · **ARCH-0046** · **ARCH-0038** (evidence hierarchy) |
| **Parent** | [PILOT-001-EXTERNAL-PILOT-CHARTER.md](./PILOT-001-EXTERNAL-PILOT-CHARTER.md) |
| **Status** | **Active** — operational model implemented |
| **Kickoff trigger** | G-3 passed · §3 populated · §3 Promotion gate passed + Decision Log entry |
| **Evidence root** | [`.ai/reviews/pilot-001/`](../reviews/pilot-001/) |

Ratary: **ARCH-0044** (dual-track) · **ARCH-0046** (Product↔Pilot traceability)

---

## Purpose

Implements **ARCH-0044**: after Selection/Promotion, Phase 4 runs in **parallel tracks** — not sequential documentation then code.

Implements **ARCH-0046**: every Product Track deliverable traces to a Pilot Track need; **workflow** is the planning unit after Promotion.

Consistent with **ARCH-0038**: production observation (Tier-1 evidence) outweighs design intent; pilot generates Required evidence (§9).

---

## Guards (non-negotiable)

| Guard | Enforcement |
|-------|-------------|
| Evidence ≠ documentation | Track boards live in `.ai/reviews/pilot-001/` — not charter body |
| No implementation without pilot linkage | Product items require `PT-need` ID (below) |
| No pilot without sufficient implementation | Gate B blocks go-live until Product blockers cleared |
| Must Enable derivatif | §6 enablers seeded from §4 workload — not standalone roadmap |

**Filter:** Does this help choose or run the pilot, or collect Required evidence?

---

## Execution model

```text
G-3 Acquire First Design Partner (Product + Business)
    ↓
§3 populated (named organization — post G-3 only)
    ↓
Screening (worksheet)
    ↓
Selection + Promotion (§3 locked → Decision Log)
    ↓
DUAL-TRACK KICKOFF ─────────────────────────────┐
    │                                            │
    ├── Pilot Track (Must Prove)                 │
    │     PT-01 Define §4 workflow               │
    │     PT-02 Lock §5 metrics + measurement    │
    │     PT-03 Operate ≥30 days                 │
    │     PT-04 Collect Required evidence        │
    │                                            │
    └── Product Track (Must Enable)              │
          PR-01..N Only items with PT-need link  │
          UI/UX · telemetry · deployment · ops   │
    │                                            │
    ↓                                            │
Sync at Gates A → B → C → D (charter §8)        │
    ↓                                            │
Evidence review → Gate D / Phase 4 exit ────────┘
```

---

## Track definitions

### Pilot Track (Must Prove)

| ID | Work package | Charter | Output artifact |
|----|--------------|---------|-----------------|
| PT-01 | Workflow definition | §4 | Workflow spec in evidence package |
| PT-02 | Metrics + measurement | §5 | Metric definitions + collection plan |
| PT-03 | Operational window | §7, §8 | Usage log, incident log (EV-R03, EV-S02) |
| PT-04 | Required evidence | §9 | EV-R01..R06 checklist green |

**Owner:** Product + pilot org operator  
**Board:** [`.ai/reviews/pilot-001/pilot-track/BOARD.md`](../reviews/pilot-001/pilot-track/BOARD.md)

### Product Track (Must Enable)

| Stream | Typical PT-need | §6 enabler |
|--------|-----------------|------------|
| Studio → Ontory E2E | PT-01 (run workflow) | E-01 |
| Telemetry / metrics | PT-02 (measure §5) | E-02 |
| Onboarding / identity | PT-01 (org can run) | E-03 |
| Provider config | PT-01 (execution path) | E-04 |
| Operator docs | PT-03 (ops window) | E-05 |
| Deployment | Gate B readiness | E-01, E-02 |

**Owner:** Engineering  
**Board:** [`.ai/reviews/pilot-001/product-track/BOARD.md`](../reviews/pilot-001/product-track/BOARD.md)

---

## Product ↔ Pilot traceability (ARCH-0046)

Every Product Track item **must** declare:

| Field | Required |
|-------|----------|
| `PR-id` | Product item ID (e.g. PR-01) |
| `PT-need` | Pilot need: PT-01 \| PT-02 \| PT-03 \| PT-04 |
| `Pilot need statement` | One line: what Pilot Track requires |
| `Blocks` | Gate A \| B \| C \| none |
| `Required evidence` | EV-R* or EV-S* if applicable |

**Reject** any Product item without `PT-need`.

### Mapping table (template — fill after Promotion)

| Pilot need | Product delivers |
|------------|------------------|
| PT-01 Run workflow | UI flow + workflow impl + deployment path |
| PT-02 Measure §5 | Telemetry sinks + metric export/dashboard |
| PT-03 ≥30-day ops | Monitoring, incident process, rollback |
| PT-04 Required evidence | Features that unblock EV-R collection |

---

## Gate synchronization

Dual-track advances only when charter §8 gates allow:

| Gate | Pilot Track exit | Product Track exit |
|------|------------------|-------------------|
| **A** Ready for onboarding | §4 draft + org confirmed | E-03 onboarding path verified |
| **B** Ready for production | §5 metrics instrumented | E-01,E-02,E-04,E-05 blockers cleared |
| **C** 30-day evidence | EV-R03 + window complete | EV-S01,S02 collected |
| **D** Phase 4 recommendation | EV-R01..R06 all ✅ | Supporting evidence reviewed |

Record gate passes in [Decision Log](./PILOT-001-EXTERNAL-PILOT-CHARTER.md#decision-log) — do not rewrite charter narrative.

---

## Kickoff checklist (run once at Promotion)

- [ ] §3 fields locked in charter
- [ ] Decision Log: Promotion approved
- [ ] Pilot Hypothesis §2 filled
- [ ] PT-01..04 rows created on Pilot board
- [ ] §6 enablers marked Blocks go-live from worksheet output
- [ ] Product board empty except enabler placeholders linked to PT-needs
- [ ] Evidence package folder ready (`.ai/reviews/pilot-001/`)

**Pre-G-3:** No §3 population · no Phase Execution Contract · Cursor IDLE-BY-DESIGN.

**Pre-Promotion:** Screening only — **no Product Track implementation** (ARCH-0044 guard).

---

## ADR policy during dual-track

Per ARCH-0038 + Phase 4 frozen governance:

- **No new ADR** for preferences, internal refactor, or polish without Required evidence impact
- **ADR allowed** only when Pilot Track produces evidence that forces an architectural decision (workload mismatch, telemetry gap, ops blocker)

Engineering changes without ADR: OK if they stay within Must Enable scope and trace to `PT-need`.

---

## Related

- [PILOT-001 Charter](./PILOT-001-EXTERNAL-PILOT-CHARTER.md)
- [§3 Worksheet](./PILOT-001-SECTION-3-ORG-WORKSHEET.md)
- [Evidence package](../reviews/pilot-001/README.md)
