# PILOT-001 — External Pilot Charter (Skeleton)

| Field | Value |
|-------|-------|
| **Document Type** | External Pilot Charter (**normative**) |
| **Status** | ✅ Structure approved · **G-3 in progress** — §3 locked until design partner acquired (§4–§5 pending) |
| **Date** | 2026-07-18 |
| **Owner** | _TBD — Product + Engineering + Business_ |
| **Category** | **Must Prove** |
| **Parent** | [EXECUTION-CONTRACT.md](./EXECUTION-CONTRACT.md) · [PHASE.md](./PHASE.md) |
| **Precedent (internal)** | [FIRST-WORKLOAD-ORG-MEMORY.md](./FIRST-WORKLOAD-ORG-MEMORY.md) (P1-A — closed) |
| **Evidence package** | [`.ai/reviews/pilot-001/`](../../reviews/pilot-001/) · dual-track boards |

---

## How to use this document

This charter is the **Phase 4 source of truth** for External Pilot #1. It defines **what must be decided** — not the decisions themselves.

### Document hierarchy

| Document | Role | Mutability |
|----------|------|------------|
| **This charter** | Normative — decisions, gates, evidence | Updated **only** when owner locks a decision |
| [Dual-track execution](./PILOT-001-DUAL-TRACK-EXECUTION.md) | Operational model — **ARCH-0044** / **ARCH-0046** | Updated only when pilot ops model changes (evidence-driven) |
| [§3 Worksheet](./PILOT-001-SECTION-3-ORG-WORKSHEET.md) | Working artifact — candidate evaluation | May change freely during evaluation |
| [Track boards](../../reviews/pilot-001/) | Working artifacts — Pilot + Product backlog | Updated during dual-track execution |
| **Decision Log** (below) | Additive audit trail | Append when decisions are made |

Evaluation history stays in the worksheet; the charter stays readable. Promote worksheet → charter only through the **§3 promotion gate**.

**Gate question for all backlog items:**

> Does this work increase the probability that External Pilot #1 succeeds?

| Trace | Meaning |
|-------|---------|
| **Must Prove** | Directly satisfies Phase 4 exit criteria |
| **Must Enable** | Required capability — not an end goal |
| **Not Now** | Defer until pilot evidence exists |

**Gate sequence (deterministic — see [PHASE.md § execution gates](./PHASE.md#phase-4-execution-gates)):**

| Gate | Status |
|------|--------|
| G-1 Governance Baseline | ✅ |
| G-2 Engineering Readiness | ✅ |
| **G-3 Acquire First Design Partner** | ⏳ **Blocking** |
| §3 Target Organization | 🔒 Locked until G-3 passed |
| §3 Promotion Gate | Not eligible |
| Phase Execution Contract | Not eligible (Prerequisite: **G-3 Passed**) |
| Cursor execution | Not authorized (IDLE-BY-DESIGN) |

**Owner decisions to lock next (in order):**

1. **G-3** — acquire first design partner _(Product + Business — evidence-based)_  
2. Target organization _(§3 — populate only after G-3; real name required)_  
3. Production workload _(§4)_  
4. Success metrics _(§5 — 2–3 primary)_

**Phase Execution Contract — prerequisites (all required before Cursor engineering):**

- [ ] **G-3 Passed** — design partner acquired with auditable evidence  
- [ ] §3 populated with named organization (not hypothetical)  
- [ ] §3 Promotion Gate passed + Decision Log entry  

**After Promotion:** dual-track kickoff per [PILOT-001-DUAL-TRACK-EXECUTION.md](./PILOT-001-DUAL-TRACK-EXECUTION.md) (**ARCH-0044**). Product Track items require Pilot Track `PT-need` link (**ARCH-0046**).

---

## 1. Charter Metadata

| Field | Value |
|-------|-------|
| **Pilot ID** | PILOT-001 |
| **Pilot name** | _TBD_ |
| **Status** | Draft skeleton |
| **Owner** | _TBD_ |
| **Operators** | _TBD — who runs day-to-day ops_ |
| **Participants** | _TBD — end users vs admins_ |
| **Governance** | Phase 4 Execution Contract |
| **Category** | Must Prove |
| **Related product work** | PI#001 Provider Selection ✅ closed — [CLOSURE-001](../../../ontory/docs/product/CLOSURE-001-PROVIDER-SELECTION-RUNTIME.md) _(Ontory repo)_ |

**Exit criteria trace:** — _(metadata only)_

---

## 2. Objective

### Why this pilot exists

_TBD — one paragraph: which Phase 4 hypothesis this pilot tests._

**Success question (pilot):**

> _TBD — e.g. "Can an external organization run a valuable AI workload on the platform without full-time engineering support?"_

**Not this pilot:**

> _TBD — what we are explicitly not trying to prove._

### Pilot Hypothesis

_Falsifiable experiment — fill when §3–§5 are locked._

> **If** _[target organization]_ can onboard and operate _[production workload]_
> using Ontory for **≥30 days** with measurable business benefit,
> **then** Ontory satisfies the Phase 4 Proof of Platform criteria.

| Hypothesis element | Locked in | Status |
|--------------------|-----------|--------|
| Target organization | §3 | 🔒 Locked until G-3 |
| Production workload | §4 | _TBD_ |
| Measurable benefit | §5 | _TBD_ |
| ≥30-day operation | §7, §8 | _TBD_ |

| Phase 4 exit criterion | How this pilot contributes |
|------------------------|----------------------------|
| External organization | _TBD_ |
| Production AI workload | _TBD_ |
| ≥30-day stable operation | _TBD_ |
| Measurable business value | _TBD_ |

**Exit criteria trace:** All Phase 4 exit criteria _(when pilot succeeds)_

---

## 3. Target Organization

### Gate G-3 prerequisite

**Status: 🔒 LOCKED until Gate G-3 (Acquire First Design Partner) passes.**

Partner acquisition was previously an implicit dependency. It is now an **explicit business gate** ([PHASE.md § execution gates](./PHASE.md#phase-4-execution-gates)). Do **not** populate §3 fields with hypothetical organization names to make governance appear complete.

| G-3 exit criterion | Evidence |
|--------------------|----------|
| Organization identified | Named candidate (real entity) |
| Mutual interest confirmed | Meeting notes · email · LOI |
| Pilot scope agreed | Agreed scope document / MoM |
| Executive sponsor identified | Named sponsor on org or Ontorata side |

When G-3 passes: populate §3 fields below · run §3 promotion gate · append Decision Log.

### Selection criteria (4R)

Owner evaluates candidates **after G-3** before locking §3 fields:

| Criterion | Question |
|-----------|----------|
| **Real** | Is this truly outside Ontorata dogfood? |
| **Reachable** | Can onboarding start in the near term? |
| **Repeatable** | Can this pilot pattern scale to org #2? |
| **Relevant** | Does the workload represent the use case Ontory must prove? |

> Prefer a small org that satisfies all four over a large org with weak operational evidence.

**Worksheet:** [PILOT-001-SECTION-3-ORG-WORKSHEET.md](./PILOT-001-SECTION-3-ORG-WORKSHEET.md) — working artifact; compare candidates **before** locking §3.

### §3 promotion gate

Promote worksheet → charter **only** when all are true _(no re-evaluation needed)_:

| # | Gate | Check |
|---|------|-------|
| 1 | Selected candidate | Exactly one candidate named |
| 2 | Decision | **Approved** (not Deferred or Rejected) |
| 3 | Primary risks | Identified and recorded |
| 4 | Required enablers | Sufficient to seed Must Enable backlog (§6) |
| 5 | Go-live realism | No critical blocker makes target go-live unrealistic |

When gate passes: update §3 fields · append Decision Log · do **not** copy draft evaluation tables into charter.

| Field | Decision |
|-------|----------|
| **Organization type** | _TBD — internal cross-team · partner · external_ |
| **Organization name** | _TBD_ |
| **Relationship to Ontorata** | _TBD_ |
| **Primary operator** | _TBD — role / team_ |
| **End users** | _TBD — count / profile_ |
| **Onboarding owner** | _TBD — Ontorata vs org-side_ |
| **Data sensitivity** | _TBD — classification, retention_ |

**Acceptance (Must Prove):**

- [ ] Organization is **external to Ontorata dogfood** _(define boundary in Decision Log if internal cross-team)_
- [ ] Organization exists as a distinct operating entity for the pilot period
- [ ] Users return to the workload for real work _(not one-off demo)_

**Exit criteria trace:** **External organization**

---

## 4. Production Workload

### Workload definition

| Field | Value |
|-------|-------|
| **Workload name** | _TBD_ |
| **One-line description** | _TBD_ |
| **Operational trigger** | _TBD — when / how often users run it_ |
| **Platform path** | _TBD — e.g. Studio → Ontory → provider_ |
| **In scope capabilities** | _TBD — minimal set_ |
| **Out of scope for workload** | _TBD — narrow boundary_ |

**Workload constraints:**

- Single primary workflow _(no multi-workload pilot v1)_
- Used for **operational work**, not demonstration
- Narrow scope, high value

**Acceptance (Must Prove):**

- [ ] Workload runs in **production** configuration
- [ ] Workload completes real tasks for the organization
- [ ] Failure modes are observable and recorded

**Exit criteria trace:** **Production AI workload**

---

## 5. Success Metrics

### Primary metrics _(owner: lock 2–3)_

| Metric | Definition | Baseline | Target | Measurement method | Owner |
|--------|------------|----------|--------|-------------------|-------|
| _TBD_ | | | | | |
| _TBD_ | | | | | |
| _TBD_ | | | | | |

### Secondary metrics _(optional — do not block pilot exit)_

| Metric | Notes |
|--------|-------|
| Time to first production workload (TTFW) | _TBD_ |
| Execution success rate | _TBD_ |
| Weekly active users | _TBD_ |
| Cost per execution | _TBD_ |
| User satisfaction (NPS / survey) | _TBD_ |

**Acceptance (Must Prove):**

- [ ] At least **2 primary metrics** show measurable value vs baseline
- [ ] Measurement method documented before go-live
- [ ] Metrics collected for full operational window

**Exit criteria trace:** **Measurable business value**

---

## 6. Minimum Enablers

Capabilities **required before go-live**. Each item maps to engineering backlog.

| ID | Enabler | Status | Backlog ref | Blocks go-live? |
|----|---------|--------|-------------|-----------------|
| E-01 | Studio → Ontory deployment (E2E) | _TBD_ | _TBD_ | _TBD_ |
| E-02 | Production observability (telemetry, audit, trace) | _TBD_ | _TBD_ | _TBD_ |
| E-03 | Organization onboarding (identity, access, config) | _TBD_ | _TBD_ | _TBD_ |
| E-04 | Provider configuration (`ONTORY_CATALOG`, policy, credentials) | _TBD_ | _TBD_ | _TBD_ |
| E-05 | Operator documentation (runbook, env, failure behavior) | _TBD_ | _TBD_ | _TBD_ |
| E-06 | _TBD — add only if pilot-specific_ | | | |

**Already delivered (reference):**

| Enabler | Evidence |
|---------|----------|
| Provider selection runtime | Ontory PI#001 — PR #24, CLOSURE-001 |

**Acceptance (Must Enable):**

- [ ] All enablers marked **Blocks go-live = Yes** are complete and verified
- [ ] Enabler verification recorded in evidence package

**Exit criteria trace:** **Must Enable** _(supports all Must Prove criteria)_

---

## 7. Operational Readiness

| Area | Requirement | Status |
|------|-------------|--------|
| **Monitoring** | _TBD — dashboards, alerts_ | _TBD_ |
| **Support model** | _TBD — hours, escalation_ | _TBD_ |
| **Incident process** | _TBD — log, severity, response SLA_ | _TBD_ |
| **Rollback / recovery** | _TBD — version, config, data_ | _TBD_ |
| **Change control during pilot** | _TBD — freeze windows_ | _TBD_ |
| **Security / access review** | _TBD_ | _TBD_ |

**Acceptance (Must Prove):**

- [ ] Monitoring active from go-live
- [ ] All incidents logged with resolution
- [ ] No undetected silent failure path for primary workload

**Exit criteria trace:** **≥30-day stable operation**

---

## 8. Execution Timeline

### Decision gates

Timeline advances on **evidence**, not dates alone.

| Gate | Name | Entry condition | Exit evidence |
|------|------|-----------------|---------------|
| **A** | Ready for onboarding | §6 enablers for onboarding complete | Enabler verification recorded |
| **B** | Ready for production | §7 operational readiness green | Readiness checklist signed |
| **C** | 30-day evidence complete | ≥30 consecutive days post go-live | §9 Required evidence collected |
| **D** | Phase 4 exit recommendation | Gate C + owner review | Phase 4 mapping satisfied; sign-off |

### Schedule

| Phase | Target date | Exit condition |
|-------|-------------|----------------|
| **Charter approved** | _TBD_ | Owner signs §3–§5 |
| **Gate A** | _TBD_ | Onboarding can begin |
| **Enablers complete** | _TBD_ | §6 acceptance green |
| **Gate B** | _TBD_ | Production go-live authorized |
| **Operational readiness** | _TBD_ | §7 acceptance green |
| **Go-live** | _TBD_ | First production execution |
| **Operational window** | _TBD_ → _TBD_ | **≥30 consecutive days** |
| **Gate C** | _TBD_ | Required exit evidence complete |
| **Pilot review** | _TBD_ | §9 Required + Supporting reviewed |
| **Gate D** | _TBD_ | Phase 4 exit recommendation |
| **Pilot closed** | _TBD_ | Owner sign-off |

**Exit criteria trace:** **Operational window (≥30 days)** · **Decision gates C–D**

---

## 9. Exit Evidence

Evidence for pilot to count toward **Phase 4 completion**.

### Required _(blocks pilot close)_

| ID | Evidence | Location | Satisfies |
|----|----------|----------|-----------|
| EV-R01 | External organization confirmed | §3 + Decision Log | External org |
| EV-R02 | Production workload active (go-live record) | `.ai/reviews/pilot-001/` | Production workload |
| EV-R03 | ≥30 days operation (usage log) | _TBD_ | ≥30-day operation |
| EV-R04 | Success metrics achieved (primary metrics report) | _TBD_ | Measurable value |
| EV-R05 | Owner sign-off (product + business) | _TBD_ | Phase 4 recommendation |
| EV-R06 | Signed charter (§3–§5 locked) | This document | Governance |

**Pilot close rule:** All **Required** items must be ✅ before Gate D.

### Supporting _(strengthens case — does not block close alone)_

| ID | Evidence | Location | Notes |
|----|----------|----------|-------|
| EV-S01 | Telemetry dashboards / traces | _TBD_ | Operational visibility |
| EV-S02 | Incident reports + resolutions | _TBD_ | Stability narrative |
| EV-S03 | User feedback (survey, interviews) | _TBD_ | Qualitative value |
| EV-S04 | Lessons learned / retrospective | _TBD_ | Evidence loop input |
| EV-S05 | Operator runbook (as-deployed) | _TBD_ | Repeatability for org #2 |
| EV-S06 | _TBD_ | | |

**Phase 4 mapping (Required only):**

| Exit criterion | Required evidence |
|----------------|-------------------|
| External organization | EV-R01, EV-R06 |
| Production workload | EV-R02, EV-R03 |
| ≥30-day operation | EV-R03, timeline §8 Gate C |
| Measurable business value | EV-R04, EV-R05 |

**Exit criteria trace:** **Phase 4 completion**

---

## 10. Backlog Traceability

Every Phase 4 backlog item MUST map here before implementation starts.

| Backlog item | Track | PT-need | Category | Enabler (§6) | Exit criterion | Status |
|--------------|-------|---------|----------|--------------|----------------|--------|
| _TBD_ | Product | PT-01 | Must Enable | E-01 | Production workload | |
| _TBD_ | Product | PT-02 | Must Enable | E-02 | ≥30-day operation | |
| _TBD_ | Pilot | PT-04 | Must Prove | — | Measurable value | |

Live boards: [pilot-track](../../reviews/pilot-001/pilot-track/BOARD.md) · [product-track](../../reviews/pilot-001/product-track/BOARD.md)

**Traceability chain:**

```text
Execution Contract
        │
        ▼
PILOT-001 Charter (this document)
        │
        ├── Must Prove
        │      ├── External organization      → §3
        │      ├── Production workload        → §4
        │      ├── ≥30-day operation          → §7, §8
        │      └── Measurable business value  → §5, §9
        │
        └── Must Enable
               ├── Studio → Ontory            → E-01
               ├── Observability              → E-02
               ├── Onboarding                 → E-03
               ├── Provider configuration     → E-04
               └── Operator documentation     → E-05
```

**Exit criteria trace:** Governance

---

## 11. Risks & Assumptions

### Assumptions

| ID | Assumption | If false |
|----|------------|----------|
| A-01 | _TBD_ | _TBD_ |
| A-02 | _TBD_ | _TBD_ |

### Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-01 | _TBD_ | | | |
| R-02 | _TBD_ | | | |

**Exit criteria trace:** Risk management

---

## 12. Out of Scope

Explicit **Not Now** for this pilot — defer even if technically attractive.

| Item | Reason |
|------|--------|
| Multi-workload pilot | Focus — one workflow only |
| Marketplace / Cloud scale | Phase 4 gate — after proof |
| Performance optimization without usage signal | Not Now |
| Architecture refactor without operational benefit | Not Now |
| New governance docs without new evidence | Not Now |
| _TBD_ | _TBD_ |

**Exit criteria trace:** Scope control

---

## Decision Log

_Additive record of pilot decisions. Do not rewrite §2–§12 narrative — log changes here._

| Date | Decision | Rationale | Owner |
|------|----------|-----------|-------|
| 2026-07-18 | Create PILOT-001 skeleton (draft) | Define decision contract before locking org / workload / metrics | _Owner_ |
| 2026-07-18 | Approve skeleton structure (12 sections + Decision Log) | Stable contract; additive refinements: Pilot Hypothesis §2, Decision Gates §8, Required/Supporting evidence §9, 4R criteria §3 | _Owner_ |
| 2026-07-18 | Adopt working-artifact policy for §3 worksheet | Worksheet mutable during evaluation; charter normative; Decision Log additive | _Owner_ |
| 2026-07-18 | Implement ARCH-0044 dual-track execution | Operational model + evidence scaffold + track boards; kickoff at Promotion; ARCH-0046 traceability enforced on Product Track | _Owner_ |
| 2026-07-18 | Promote partner acquisition to explicit **Gate G-3** | Business development incomplete; §3 locked until real design partner acquired; no hypothetical org names; READY ≠ AUTHORIZED for Cursor | _Owner_ |
| | | | |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product | _TBD_ | | |
| Engineering | _TBD_ | | |
| Business | _TBD_ | | |

**Charter structure approved:** _Yes — 2026-07-18_  
**Charter approved for execution:** _No — pending owner decisions §3–§5_
