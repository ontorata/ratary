# First Production Workload — Engineering Governance

| Field | Value |
|-------|-------|
| **Authority** | Governance & Execution |
| **Horizon** | Phase 4 |
| **Owner** | Engineering + Product |
| **Status** | **Active** — P0-B Forge-Isolate; blueprint pending |
| **Category** | Must Prove |
| **Evidence package** | `.ai/reviews/engineering-governance/` (create when P0-A passes) |

Parent: [EXECUTION-CONTRACT.md](./EXECUTION-CONTRACT.md) · [OPERATING-MODEL.md](./OPERATING-MODEL.md)

---

## Workload name

**Engineering Governance**

One integrated production workload — not a collection of unrelated features.

---

## Why this workload

| Property | Fit |
|----------|-----|
| Used daily | Cursor agents, PRs, `.ai/` maintenance |
| Simple but high friction | Doc sync, handoff, ADR, completion protocol |
| Measurable | Ingest count, queries, recall accuracy, drift incidents |
| Real data | `.ai/core/`, ADRs, phases, governance mirror |
| Real organization | Ontorata (first internal production org) |

Meets contract formula:

> Simple workload + Real organization + Real data + Real value

---

## Capabilities (within one workload)

```
Engineering Governance
├── ADR Lifecycle
├── Documentation Sync
├── Architecture Review
├── Release Review
├── Session Handoff
├── Implementation Completion
├── Governance Audit
└── Knowledge Recall
```

Each capability is a **sub-capability** of the same workload — shared ingest, scope, metrics, and evaluation.

---

## Prerequisites

| Prerequisite | Status |
|--------------|--------|
| Identity Foundation E2E | ✅ P0-A engineering complete — [P0-A release](../../governance/releases/P0-A-IDENTITY-FOUNDATION.md) |
| P0-A remote sync (`main` + tags) | ✅ RELEASED — verified 2026-07-08 |
| P0-B forge-intent approved | ✅ [engineering-governance-intent.md](../../designs/drafts/engineering-governance-intent.md) |
| P0-B forge-isolate | ✅ [engineering-governance-isolate.md](../../designs/drafts/engineering-governance-isolate.md) |
| Organization Ontorata exists | ✅ (internal bootstrap) |
| Workspace bound to org | ✅ P0-A waves 1–2 |
| MCP + REST same tenant context | ✅ P0-A wave 4 |

**Do not start ingest at production scale until P0-B acceptance gate passes.**

---

## Dogfood loop (target state)

Not only:

```
Studio → MCP → Memory
```

Full learning cycle:

```
Engineer
    ↓
Studio
    ↓
Ratary
    ↓
Organizational Memory
    ↓
AI Recall
    ↓
Implementation
    ↓
Documentation Sync
    ↓
Metrics
    ↓
Evaluation
    ↓
Improvement
    ↓
Memory Updated
```

Ratary becomes the engine that ensures every implementation enriches organizational knowledge continuously.

---

## Production metrics (this workload)

| Metric | Initial target |
|--------|----------------|
| `production_organizations` | 1 (Ontorata) |
| `production_workloads` | 1 (Engineering Governance) |
| `production_users` | Internal engineers |
| `production_documents` | `.ai/` + governance ingest count |
| `production_queries` | MCP + REST search volume |
| `production_memory` | Memories under org scope |
| `production_recall_accuracy` | Baseline eval after ingest |

---

## Trusted workload definition (Phase 4 North Star)

A workload counts toward **Trusted Production Workloads Running** only when **all** apply:

| Requirement |
|-------------|
| Used daily (not demo-only) |
| Produces measurable value |
| Fully documented (evidence package) |
| Auditable (audit trail) |
| Observable (metrics + logs) |
| Improves organizational quality over time |

Volume of agents or features is **not** Phase 4 success. **Trust** is.

---

## Evidence package (on completion)

```
.ai/reviews/engineering-governance/
├── architecture-review.md
├── acceptance-test.md
├── e2e-proof.md
├── metrics.md
├── known-limitations.md
└── decision.md
```

---

## Related

- [EXECUTION-CONTRACT.md](./EXECUTION-CONTRACT.md)
- [identity-foundation-intent.md](../../designs/drafts/identity-foundation-intent.md)
- [../../reviews/README.md](../../reviews/README.md)
