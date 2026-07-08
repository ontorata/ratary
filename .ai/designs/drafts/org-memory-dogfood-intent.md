---
id: ORG-MEMORY-DOGFOOD
phase: 04-proof-of-platform
stage: forge-intent
status: Proposed — pending owner approval
owner: Ontorata
workload: Org Memory Dogfood
evidence_package: org-memory-dogfood
constitution:
  - Internal Proof Before Public Capability
  - P0 Baseline Change Policy
dependencies:
  - P0-A-IDENTITY-FOUNDATION
  - P0-B-ENGINEERING-GOVERNANCE
baseline:
  branch: main
  commit: a67c101
  tags:
    - identity-foundation-p0-a-complete
    - engineering-governance-p0-b-complete
forge_branch: forge/org-memory-dogfood
updated: 2026-07-08
---

# Org Memory Dogfood — Forge Intent (P1-A)

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — pending owner approval before forge-isolate |
| **Slug** | `org-memory-dogfood` |
| **Milestone** | P1-A |
| **Phase** | 4 — Proof of Platform |
| **Category** | Must Prove |
| **Baseline** | P0-A + P0-B RELEASED · FROZEN |
| **Target release artifact** | `.ai/governance/releases/P1-A-ORG-MEMORY-DOGFOOD.md` (on completion) |
| **Evidence package** | `.ai/reviews/org-memory-dogfood/` |

Parent: [FIRST-WORKLOAD-ORG-MEMORY.md](../../phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md) · [EXECUTION-CONTRACT.md](../../phases/04-proof-of-platform/EXECUTION-CONTRACT.md)

**Gate before Isolate:** P0-A and P0-B distribution status = **RELEASED** ✅ verified 2026-07-08.

---

## Phase shift

| Phase | Mode | Success question |
|-------|------|------------------|
| **P0** | Build the platform | Is the platform built correctly? |
| **P1** | Use the platform | Is the platform useful for daily work? |
| **P2** | Scale the platform | Can it serve more orgs and workloads? |
| **P3** | Open the platform | Can external ecosystems adopt safely? |

P1-A is the first **Use the platform** milestone — not proof-of-concept, but **real daily organizational memory** for Ontorata engineering.

---

## Problem

P0 established identity trust and engineering governance. Ratary can store and recall memory via MCP, but **Ontorata does not yet run Ratary as its primary engineering memory** in daily practice.

Without dogfood:

- Ingest and recall remain theoretical
- Evidence linkage stays manual
- P1-B (ingestion), P1-C (retrieval), and P1-D (AI workspace) would be built on assumptions

---

## Objective

Prove that **Ratary is organizational memory used every day by Ontorata** — not merely capable of being used.

Success = acceptance gates pass with **usage evidence**, not only green tests.

---

## Constraints (constitution / P0 frozen baseline)

| Constraint | Source |
|------------|--------|
| P0-A / P0-B frozen — no feature development on foundation | [P0-BASELINE-CHANGE-POLICY.md](../../core/constitution/P0-BASELINE-CHANGE-POLICY.md) |
| Internal Proof Before Public Capability | Constitution |
| Repository + `.ai/` = source of truth; Ratary = semantic copy | `.ai/sync/` |
| Tenant isolation · MCP/REST parity | P0-A locked |
| Evidence before completion | P0-B · `.ai/reviews/` |
| No agent runtime in `src/` | Agent Forge |

**Scope boundary:** P1-A implements minimum **usage** of existing memory capabilities. Large new subsystems (complex knowledge graph, agent orchestration) are **out of scope**.

---

## Decision

Execute P1-A as a **dogfood workload** on branch `forge/org-memory-dogfood`, baseline `main` after P0-B RELEASED.

Execution order after intent approval:

```
forge-isolate (forge/org-memory-dogfood)
        ↓
forge-blueprint (ingest · recall · evidence · metrics waves)
        ↓
forge-execute + forge-prove
        ↓
acceptance gate (usage evidence)
        ↓
forge-land → tag → P1-A release record
```

---

## Scope (minimum viable daily use)

Only capabilities that Ontorata engineering **actually uses**:

| Capability | Source paths (initial) |
|------------|------------------------|
| Engineering docs ingest | `.ai/core/`, `docs/architecture/` |
| ADR ingest | `.ai/core/architecture/ADR-*` |
| Governance ingest | `.ai/core/governance/`, `.ai/governance/` |
| Release records ingest | `.ai/governance/releases/` |
| Session handoff ingest | `.ai/sessions/CURRENT.md` · Ratary `save_memory` |
| Recall via MCP | `search_memory`, `get_context`, `get_memory_by_codename` |
| Evidence linkage | `.ai/reviews/` ↔ decisions ↔ release records |
| Audit trail | ingest log · recall log · session handoff tags |

Config reference: [.ai/sync/ratary-sync-config.yaml](../../sync/ratary-sync-config.yaml)

### Explicit non-goals (P1-A)

- Agent orchestration platform
- Complex knowledge graph / Neptune-first architecture
- Public multi-tenant onboarding
- Ontory product surface
- Full AI workspace (deferred to P1-D)

---

## Acceptance gate (usage-oriented)

P1-A is **not complete** when ingest works once. It is complete when **Ontorata uses Ratary as primary engineering memory** with evidence:

| Gate | Criterion |
|------|-----------|
| **G1 — Primary org** | Ontorata uses Ratary as main engineering memory (not parallel ad-hoc notes) |
| **G2 — ADR recall** | Latest ADRs discoverable via MCP recall without manual file hunting |
| **G3 — Release history** | Release history reconstructable from memory (P0-A + P0-B chain) |
| **G4 — Evidence-backed answers** | AI answers governance/architecture questions from ingested evidence |
| **G5 — No manual evidence bridge** | Decision ↔ evidence ↔ release linked without one-off manual stitching |
| **G6 — CI unchanged on P0** | P0 baseline untouched except permitted exception classes |

---

## Deliverables (proof of use)

| Artifact | Purpose |
|----------|---------|
| Ingestion log | What was synced, when, from which paths |
| Recall log | Queries · hits · codenames · session recovery |
| MCP interaction trace | Cursor / MCP tool usage in real sessions |
| Evidence trace | Link from memory entry → ADR / release / review |
| Acceptance report | `.ai/reviews/org-memory-dogfood/acceptance-test.md` |
| Internal usage metrics | ingest count · recall count · handoff tags · drift incidents |

---

## P1 roadmap (context)

```
P0-A  Identity Foundation      ✅ RELEASED
P0-B  Engineering Governance   ✅ RELEASED
        │
        ▼
P1-A  Org Memory Dogfood        ← this intent
        │
        ▼
P1-B  Knowledge Ingestion
        │
        ▼
P1-C  Retrieval + Context
        │
        ▼
P1-D  AI Workspace
```

---

## Alternatives considered

| Alternative | Why not first |
|-------------|---------------|
| Build ingestion pipeline (P1-B) before dogfood | No validated daily use pattern |
| Skip dogfood; expand MCP features | Violates Internal Proof Before Public Capability |
| Merge P1-A and P1-B into one milestone | Blurs "use" vs "build pipeline" success criteria |

---

## Impact

| Layer | Impact |
|-------|--------|
| `src/` | Minimal — prefer config, scripts, sync pipeline over core changes |
| `.ai/` | Evidence package · release record · sync config updates |
| `docs/` | Public mirror if behavior visible to integrators |
| Ratary MCP | Primary consumption surface for dogfood |
| P0 baseline | **No mutation** — build on top |

---

## Open questions

1. **Ingest trigger:** `on_commit` automation vs scheduled vs session-end manual — blueprint decision
2. **Metric thresholds:** minimum daily recall / ingest counts for G1 — owner to set in blueprint
3. **Studio role:** MCP-only dogfood first, or Studio session path in parallel?

---

## Owner approval checklist

- [ ] Objective and phase shift accepted
- [ ] Scope / non-goals accepted
- [ ] Acceptance gate G1–G6 accepted
- [ ] Approve forge-isolate on `forge/org-memory-dogfood`
