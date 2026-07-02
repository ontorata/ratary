# Audits

**Purpose:** Durable architecture and phase compliance audit records.  
**Audience:** Project owner, maintainers, AI assistants.  
**Authority:** Evidence layer — subordinate to [constitution/INDEX.md](../constitution/INDEX.md) and Approved ADRs.

---

## Why `audits/` exists

Phase folders record gate verdicts and design history. `audits/` holds **independent compliance assessments** — architecture alignment, cross-phase debt, and readiness for the next phase. Audits are append-only; corrections add addenda, never rewrite verdicts.

---

## Index

| Audit | Phase | Status | Verdict |
|-------|-------|--------|---------|
| [phase-01.md](phase-01.md) | 1 Foundation | Closed | PASS |
| [phase-02.md](phase-02.md) | 2 Knowledge (2.5 + 2.6) | Closed | PASS |
| [phase-03.md](phase-03.md) | 3 Authorization | Closed | PASS |
| [phase-04.md](phase-04.md) | 4 Memory Intelligence | Closed | PASS WITH OBSERVATIONS |
| [phase-05.md](phase-05.md) | 5 Embedding | Closed | PASS WITH OBSERVATIONS |
| [latest.md](latest.md) | Aggregate (pre-Phase 6) | Active | YES WITH CONDITIONS |

---

## When to create or update

| Event | Action |
|-------|--------|
| Phase gate PASS | Add or update `phase-NN.md` |
| Pre-next-phase review | Refresh `latest.md` |
| Hotfix with arch impact | Addendum in `latest.md` |
| Annual governance review | Cross-phase debt section in `latest.md` |

---

## Relationship to other folders

| Folder | Role |
|--------|------|
| `phases/NN-name/REVIEW.md` | Gate verdict for phase N |
| `audits/phase-NN.md` | Independent architecture audit |
| `review/02-PHASE-SCORECARD.md` | Scoring template used during audit |
| [playbooks/phase-completion.md](../playbooks/phase-completion.md) | Triggers audit update |

---

## Rules

1. Audits MUST NOT contradict Approved ADRs or constitution.
2. **PASS WITH OBSERVATIONS** requires logged debt with owner acceptance.
3. `latest.md` always points to the most recent aggregate assessment.
4. AI assistants prepare audits; owner signs verdict.

---

*Historical record — do not delete closed phase audits.*
