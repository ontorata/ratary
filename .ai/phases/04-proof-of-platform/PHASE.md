# Phase 4 — Proof of Platform

| Field | Value |
|-------|-------|
| **Authority** | Governance & Execution |
| **Horizon** | 12 Months |
| **Owner** | Engineering + Product + Business |
| **Status** | Active |

---

## Principle

> **The platform must prove itself through usage, not architecture.**

> **Phase 4 is where Ontorata stops explaining what it can become and starts proving what it is.**

| Role | Function |
|------|----------|
| Documents | Reference |
| Evidence | Director |
| Usage | Validator |

**Operating model:** [OPERATING-MODEL.md](./OPERATING-MODEL.md) · **Execution Contract (final):** [EXECUTION-CONTRACT.md](./EXECUTION-CONTRACT.md)

---

## Company phases

| Phase | Name | Status |
|-------|------|--------|
| **0** | Foundation | ✅ Complete |
| **1** | Governance | ✅ Complete |
| **2** | Platform Design | ✅ Complete |
| **3** | Company Model | ✅ Complete |
| **4** | **Proof of Platform** | ▶ **Active** |

Phases 0–3 built architecture and company model. Phase 4 proves it in the real world.

---

## Phase 4 execution gates

Deterministic gate sequence for PILOT-001 and Phase Execution Contract eligibility.
**READY ≠ AUTHORIZED** — engineering may be complete while business gates still block execution.

```text
Phase 4
│
├── G-1 Governance Baseline          ✅
├── G-2 Engineering Readiness        ✅
│
├── G-3 Acquire First Design Partner ⏳ OPEN  ← business acquisition phase
│      ├─ Organization identified
│      ├─ Mutual interest confirmed
│      ├─ Pilot scope agreed
│      └─ Executive sponsor identified
│
├── §3 Target Organization populated (named org — no hypothetical names)
│
├── §3 Promotion Gate
│
├── Phase Execution Contract         (Prerequisite: G-3 Passed)
│
├── Cursor Execution Authorized
│
└── Engineering / Pilot Execution
```

### Gate G-3 — Acquire First Design Partner

| Field | Value |
|-------|-------|
| **Gate ID** | G-3 |
| **Name** | Acquire First Design Partner |
| **Owner** | Product + Business |
| **Inputs** | Governance baseline (G-1) · pilot charter |
| **Status** | ⏳ **OPEN** — business acquisition phase (not passed) |
| **Exit criteria** | Organization identified · mutual interest confirmed · pilot scope agreed · executive sponsor identified |
| **Exit criteria status** | See table below — **none met yet** |
| **Evidence** | Meeting notes · email / LOI / MoM · agreed pilot scope |
| **Output** | Named organization → populate [PILOT-001 §3](./PILOT-001-EXTERNAL-PILOT-CHARTER.md#3-target-organization) |

**G-3 exit criteria audit (2026-07-18):**

| Exit criterion | Status |
|----------------|--------|
| Organization identified | ❌ No official design partner yet |
| Mutual interest confirmed | ❌ Not yet |
| Pilot scope agreed | ❌ Not yet |
| Executive sponsor identified | ❌ Not yet |

**Reason:** No official design partner has been identified. G-3 is **open**, not failed — exit criteria simply not yet satisfied. This is not an engineering blocker.

**Next objective:** Identify and secure the first official design partner. G-3 remains open until a real organization is identified and evidence (communication, meeting notes, or equivalent) demonstrates mutual intent to conduct a pilot.

§3 remains **LOCKED** and **empty** until G-3 passes. Do not fill charter §3 with placeholder or hypothetical organization names.

**Program state (2026-07-18):**

| Item | Status |
|------|--------|
| G-1 Governance Baseline | ✅ |
| G-2 Engineering Readiness | ✅ |
| **G-3 Design Partner** | ⏳ **OPEN** |
| Governance | READY |
| Engineering | READY |
| Business acquisition | **OPEN** (no partner identified) |
| §3 Target Organization | 🔒 LOCKED · **empty** (waiting G-3 pass) |
| Phase Execution Contract | NOT YET ELIGIBLE |
| Cursor | IDLE-BY-DESIGN |

---

## First success → Platform Proven

Not files · not features · not repos.

**First Production Proof** (minimum):

| Requirement | Threshold |
|-------------|-----------|
| External organization | 1 |
| Production AI workload | 1 — valuable, not demo |
| Operation | 30+ days |
| Business value | Measured |

Then: *Can one workload scale?* → *Can many orgs run many workloads?*

**First success:** one organization trusts a real work process — still running after AI novelty fades.

## Production status — strict DoD

Not proof if only: response generated · demo succeeded · deployed once.

**Production** = organization exists + users return + workload operates + metrics observed + value demonstrated.

See [EXECUTION-CONTRACT.md](./EXECUTION-CONTRACT.md).

---

Preserve DNA: open ecosystem · enterprise ownership · AI operating layer · governed execution.

**Execution guardrails:** [EXECUTION-GUARDRAILS.md](./EXECUTION-GUARDRAILS.md) · **Operating model:** [OPERATING-MODEL.md](./OPERATING-MODEL.md)

→ [../../core/vision/WHY-ONTORATA.md](../../core/vision/WHY-ONTORATA.md)

---

## Transition
|--------|-----|
| How do we ensure architecture is correct? | How do we prove architecture creates a platform that is **used**, **valuable**, and **growing**? |

**Company architecture: mature. Company execution: early stage.** Market evidence: **pending**.

**Next milestone — not "finish architecture":**

> **First production AI workload run by a real organization through the Ontorata platform.**

One real workload > one hundred more documents.

---

## Evidence Loop (not feature roadmap)

Phase 4 runs on **evidence**, not a feature checklist alone.

```
Hypothesis → Build → Run → Measure → Learn → Improve
     ↑                                    │
     └────────────────────────────────────┘
```

### Example cycle

| Step | Content |
|------|---------|
| **Hypothesis** | Enterprises need AI workloads they **own and operate** themselves |
| **Build** | Ratary + Studio + Auth + Knowledge |
| **Run** | External org runs a production workload |
| **Measure** | Uptime · workload success · retention · cost · latency · adoption |
| **Learn** | What must improve? |
| **Improve** | Platform evolves from evidence |

Each loop iteration must move **production workloads** or **production organizations** — not add governance docs.

**Decision format:** Observation → Decision → Implementation → Evidence → Learning

See [EXECUTION-GUARDRAILS.md](./EXECUTION-GUARDRAILS.md).

---

## Wedge product (first market vehicle)

Platform scope is wide: Ratary · Studio · Cloud · Marketplace · Ontory · Auth · Eval · Knowledge · Memory · MCP · Desktop.

**All correct long-term.** Phase 4 still needs **one wedge** — the first door into the market. This does **not** change vision; it chooses the first vehicle.

| Candidate wedge | Entry angle |
|-----------------|-------------|
| Enterprise AI Workspace | Builder + team collaboration |
| Private AI Knowledge Platform | Owned retrieval + knowledge ops |
| AI Agent Operating Environment | Agent workloads on Ratary |

**Decision:** validate via Evidence Loop — pick wedge when hypothesis + first external run confirm fit.

---

## Product sequence (do not reverse)

```
Ratary (core engine)
    │
Studio (first user interface)
    │
First AI Workload (proof)
    │
Enterprise Deployment (validation)
    │
Cloud + Marketplace (scale)
```

### Blocked sequence

```
Marketplace first → Cloud first → many features → no real workload
```

| Entity | Phase 4 role |
|--------|--------------|
| Ratary | Execution layer — always first |
| Studio | First UI — wedge delivery surface |
| Cloud · Marketplace | **After** first production proof |
| Ontory | Reference / dogfood — **never drives Ratary architecture** |

Direction: `Ratary capability → enables → Ontory experience` (not reverse).

---

## Three proofs

### Proof 1 — Technical

**Output:** *One AI workload runs stably in production.*

Evidence: isolation · provider independence · OTel · eval pipeline · deployment.

### Proof 2 — Product

**Output:** *Non-builder ships something useful via Studio.*

Evidence: create · knowledge · memory · deploy · observe — **< 1 hour** time-to-first-production-workload target.

### Proof 3 — Business

**Output:** *Platform has economic value.*

Evidence: first external org · first production workload · first paid customer · first partner.

---

## Foundations (complete)

| Layer | Status |
|-------|--------|
| **Strategic** | Vision · Product Strategy · Business Strategy |
| **Engineering** | Architecture · Governance · Boundary |
| **Execution** | KPI · Evidence model · Phase 4 |

| Pending | |
|---------|--|
| **Market evidence** | First external production workload |

---

## Flywheel

```
Better Platform → More Workloads → More Users → More Feedback → Better Platform
```

Signal sources: production usage · customer feedback · benchmark data · operational evidence · business signal.

Not `.ai/core/` restructuring.

---

## KPI stack

| Layer | Metrics |
|-------|---------|
| North Star | `production_workloads` |
| Proof | `production_organizations` |
| **Time to First Production Workload** | Signup → first prod workload (target **< 1 hour**) |
| Adoption Quality | activation · retention · success · duration |
| Measure (loop) | uptime · cost · latency |

See [../../core/product/KPI.md](../../core/product/KPI.md).

---

## Anti-patterns (blocked)

```
Runtime gap → more docs → more framework → more governance → no users
Marketplace / Cloud before first real workload
Feature roadmap without Measure → Learn → Improve
```

Gate:

> **Does this increase Production AI Workloads Running on Ratary?**

If no → backlog.

---

## Success criteria (exit Phase 4)

| Proof | Signal |
|-------|--------|
| **Platform Proven** | 1 external org · 1 prod workload · 30+ days · measured value |
| Technical | ADR evidence green · stable operation |
| Product | Non-builder ships · TTFW trending toward < 1h |
| Business | Economic signal from real work |
| Loop | ≥1 full cycle with Observation → Learning documented |

---

## Not in scope

- New governance document types
- Folder reorganization
- Marketplace / Cloud scale before proof
- More ADRs without implementation evidence

---

## Related

- [PILOT-001-DUAL-TRACK-EXECUTION.md](./PILOT-001-DUAL-TRACK-EXECUTION.md) — ARCH-0044 dual-track operational model
- [PILOT-001-EXTERNAL-PILOT-CHARTER.md](./PILOT-001-EXTERNAL-PILOT-CHARTER.md) — External Pilot #1 (Phase 4 source of truth)
- [PILOT-001-SECTION-3-ORG-WORKSHEET.md](./PILOT-001-SECTION-3-ORG-WORKSHEET.md) — §3 organization candidate worksheet
- [Evidence package / track boards](../reviews/pilot-001/)
- [EXECUTION-GUARDRAILS.md](./EXECUTION-GUARDRAILS.md)
- [../../core/governance/STRUCTURE-FREEZE.md](../../core/governance/STRUCTURE-FREEZE.md)
- [../../core/product/KPI.md](../../core/product/KPI.md)
- [../../core/product/PRODUCT-ROADMAP.md](../../core/product/PRODUCT-ROADMAP.md)
