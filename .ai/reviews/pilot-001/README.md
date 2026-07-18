# PILOT-001 — Evidence Package

| Field | Value |
|-------|-------|
| **Pilot** | PILOT-001 External Pilot |
| **Status** | Scaffold — pre go-live · **G-3 blocking** (§3 locked) |
| **Charter** | [PILOT-001-EXTERNAL-PILOT-CHARTER.md](../../phases/04-proof-of-platform/PILOT-001-EXTERNAL-PILOT-CHARTER.md) |
| **Dual-track ops** | [PILOT-001-DUAL-TRACK-EXECUTION.md](../../phases/04-proof-of-platform/PILOT-001-DUAL-TRACK-EXECUTION.md) |

---

## Purpose

Living evidence store for **Required** (EV-R*) and **Supporting** (EV-S*) artifacts. Track boards are **working artifacts** — charter remains normative.

ARCH-0038: production observation and operational evidence carry highest weight.

---

## Structure

```text
pilot-001/
├── README.md                 ← this file
├── pilot-track/
│   └── BOARD.md              ← Must Prove work (PT-*)
├── product-track/
│   └── BOARD.md              ← Must Enable work (PR-* → PT-need)
├── go-live/                  ← EV-R02 snapshot (create at go-live)
├── metrics/                  ← EV-R04 reports
├── operations/               ← EV-R03 usage log, EV-S02 incidents
└── sign-off/                 ← EV-R05 owner approval
```

---

## Required evidence checklist (charter §9)

| ID | Artifact | Location | Status |
|----|----------|----------|--------|
| EV-R01 | External org confirmed | charter §3 + Decision Log _(after G-3)_ | ☐ |
| EV-R02 | Go-live record | `go-live/` | ☐ |
| EV-R03 | ≥30 days usage log | `operations/` | ☐ |
| EV-R04 | Primary metrics report | `metrics/` | ☐ |
| EV-R05 | Owner sign-off | `sign-off/` | ☐ |
| EV-R06 | Signed charter §3–§5 | charter | ☐ |

**Gate D rule:** all EV-R* ✅ before pilot close.

---

## Supporting evidence (optional for close)

| ID | Artifact | Location | Status |
|----|----------|----------|--------|
| EV-S01 | Telemetry dashboards | `operations/telemetry/` | ☐ |
| EV-S02 | Incident reports | `operations/incidents/` | ☐ |
| EV-S03 | User feedback | `operations/feedback/` | ☐ |
| EV-S04 | Retrospective | `operations/retrospective/` | ☐ |
| EV-S05 | Operator runbook | `operations/runbook/` | ☐ |

Create subfolders on first artifact — not before Promotion.
