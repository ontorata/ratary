# Ontorata `.ai/` Workspace

| Field | Value |
|-------|-------|
| **Authority** | Governance & Execution |
| **Horizon** | Permanent (index) |
| **Owner** | Governance |
| **Status** | Active — **structure frozen, evolution allowed** |

---

## Current phase

| Phase | Status |
|-------|--------|
| 0 Foundation · 1 Governance · 2 Platform Design · 3 Company Model | ✅ |
| **4 Proof of Platform** | ▶ Active |

**DNA:** Open ecosystem · Enterprise ownership · AI operating layer · Governed execution

**Not** "make AI smarter" — **make organizations own, run, and grow their own AI.**

**First success:** one external org · one valuable production AI workload · 30+ days · measured value.

> **The next milestone is not a release. It is a proof.**

**Phase 4 — Execution Contract (final):** [EXECUTION-CONTRACT.md](./phases/04-proof-of-platform/EXECUTION-CONTRACT.md)

**Operating statement:** Build only what increases probability a real org runs a valuable production workload on Ratary.

**Focus:** Problem → Workload → Capability → Evidence → Trust → Scale

**Main activity:** Execution — not documentation.

> The architecture earned the right to be tested. Now the market gets to decide its value.

→ [PHASE.md](./phases/04-proof-of-platform/PHASE.md)

---

## Company architecture

```
                         WHY
                          │
                    VISION.md
                          │
          ┌───────────────┴───────────────┐
          │                               │
 Product Strategy                  Business Strategy
          │                               │
          └───────────────┬───────────────┘
                          │
              Platform Architecture
                          │
                    Runtime & AI
                          │
              Governance & Execution
```

**Structure frozen, evolution allowed.** → [core/governance/STRUCTURE-FREEZE.md](./core/governance/STRUCTURE-FREEZE.md)

---

## Governance concepts

| Concept | Document |
|---------|----------|
| Decision Horizon | [DECISION-HORIZON.md](./core/governance/DECISION-HORIZON.md) |
| Change cost / authority | [DECISION-HORIZON.md](./core/governance/DECISION-HORIZON.md) · [CHANGE-AUTHORITY-MATRIX.md](./core/governance/CHANGE-AUTHORITY-MATRIX.md) |
| Implementation Completion | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](./core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |
| AI-assisted workflow | [workflows/README.md](./workflows/README.md) · [AI-DEVELOPMENT-PROTOCOL.md](./workflows/AI-DEVELOPMENT-PROTOCOL.md) |
| Session contract (Cursor) | [SESSION-BOOTSTRAP.md](./core/governance/SESSION-BOOTSTRAP.md) |
| Cursor rule | `.cursor/rules/ontorata-execution-governance.mdc` |
| Release management | [releases/RELEASE-PROCESS.md](./governance/releases/RELEASE-PROCESS.md) · [VERSIONING.md](./governance/releases/VERSIONING.md) · [CHANGELOG-POLICY.md](./governance/releases/CHANGELOG-POLICY.md) · [RELEASE-CHECKLIST.md](./governance/releases/RELEASE-CHECKLIST.md) |
| Phase 4 evidence | [reviews/README.md](./reviews/README.md) |

---

## North Star + Proof

| Metric | Meaning |
|--------|---------|
| **Production AI Workloads** | Volume on Ratary |
| **Production Organizations** | Independent orgs — health signal |

---

## Four pillars + operational memory

```
.ai/
├── core/       vision · product · business · constitution · governance · adr …
├── bootstrap/  MACHINE-SETUP · ENVIRONMENT-CHECKLIST · MIGRATION
├── assets/     prompts · personas · templates · design/
├── phases/     04-proof-of-platform
├── reviews/    Phase 4 evidence packages
├── sync/       Ratary organizational memory config · MEMORY-ARCHITECTURE
├── workflows/  AI development protocol · change evidence · session handoff
├── sessions/   CURRENT.md — audit trail (Ratary = active memory)
└── …
```

**Portable environment:** Repository (truth) + Ratary (memory) + Cursor + bootstrap.

| Layer | Path |
|-------|------|
| Source of truth | `.ai/core/` · `docs/` · Git |
| Organizational memory | Ratary MCP · [.ai/sync/README.md](./sync/README.md) |
| Audit trail | [.ai/sessions/CURRENT.md](./sessions/CURRENT.md) |
| Bootstrap (offline) | [.ai/bootstrap/](./bootstrap/) |

**Session start:** Ratary first (if live) → validate against repo → fallback files.

---

## Start here

| Question | Document |
|----------|----------|
| Why exist? | `core/vision/WHY-ONTORATA.md` |
| What build? | `core/product/PRODUCT-PRINCIPLES.md` |
| How monetize? | `core/business/REVENUE.md` |
| Who changes what? | `core/governance/CHANGE-AUTHORITY-MATRIX.md` |
| What now? | `phases/04-proof-of-platform/PHASE.md` |

---

## Principles → Roadmap → Implementation

Principles never contain features or release dates. Roadmap may change quarterly.
