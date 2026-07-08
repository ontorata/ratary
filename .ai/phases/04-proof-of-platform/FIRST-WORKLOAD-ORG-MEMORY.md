# First Production Workload — Org Memory Dogfood (P1-A)

| Field | Value |
|-------|-------|
| **Authority** | Governance & Execution |
| **Horizon** | Phase 4 → P1 |
| **Owner** | Engineering + Product |
| **Status** | **Closed** — P1-A baseline locked on `forge/org-memory-dogfood` |
| **Category** | Must Prove |
| **Evidence package** | `.ai/reviews/org-memory-dogfood/` (create on isolate) |

Parent: [EXECUTION-CONTRACT.md](./EXECUTION-CONTRACT.md) · [OPERATING-MODEL.md](./OPERATING-MODEL.md)

---

## Workload name

**Org Memory Dogfood** — Ratary as Ontorata's daily engineering organizational memory.

---

## Why this workload

| Property | Fit |
|----------|-----|
| Used daily | Cursor sessions · ADR lookup · release history · handoffs |
| Real organization | Ontorata (first internal production org) |
| Real data | `.ai/`, ADRs, governance, release records, reviews |
| Measurable | ingest · recall · handoff · evidence linkage |
| Validates P0 | Uses identity + governance baseline without changing it |

Meets contract formula:

> Simple workload + Real organization + Real data + Real value

---

## Success question (P1)

> **Is the platform useful for daily work?**

Not: "Can we demo memory once?"

---

## Prerequisites

| Prerequisite | Status |
|--------------|--------|
| P0-A Identity Foundation | ✅ RELEASED |
| P0-B Engineering Governance | ✅ RELEASED · FROZEN |
| P0 Baseline Change Policy | ✅ [P0-BASELINE-CHANGE-POLICY.md](../../core/constitution/P0-BASELINE-CHANGE-POLICY.md) |
| MCP connected (Cursor) | ✅ when available |
| Sync config | ✅ [.ai/sync/ratary-sync-config.yaml](../../sync/ratary-sync-config.yaml) |
| Forge intent approved | ✅ [org-memory-dogfood-intent.md](../../designs/drafts/org-memory-dogfood-intent.md) |

---

## Capabilities (P1-A minimum)

```
Org Memory Dogfood
├── Ingest (engineering · ADR · governance · releases · handoffs)
├── Recall (MCP search · context · codename)
├── Evidence linkage (reviews ↔ decisions ↔ releases)
└── Audit trail (logs + metrics)
```

---

## Dogfood loop (target state)

```
.ai/ + docs/  (source of truth)
        │
        ▼
   Ingest pipeline
        │
        ▼
   Ratary memory (D1)
        │
        ▼
   MCP recall (Cursor / agents)
        │
        ▼
   Evidence + metrics → acceptance gate
```

---

## Related workloads

| Milestone | Focus | Depends on |
|-----------|-------|------------|
| **P1-A** Org Memory Dogfood | Daily use proof | P0 ✅ · CLOSED |
| **P1-B** Knowledge Ingestion | Pipeline hardening | P1-A ✅ locked |
| P1-C Retrieval + Context | Quality + ranking | P1-B |
| P1-D AI Workspace | User-facing surface | P1-C |

Previous workload (complete): [FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md](./FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md)

---

## Forge chain

Intent → [org-memory-dogfood-intent.md](../../designs/drafts/org-memory-dogfood-intent.md)  
Isolate → [org-memory-dogfood-isolate.md](../../designs/drafts/org-memory-dogfood-isolate.md) ✅  
Blueprint → [org-memory-dogfood-plan.md](../../designs/drafts/org-memory-dogfood-plan.md) ✅ approved  
Evidence → `.ai/reviews/org-memory-dogfood/`

---

## Execution progress (P1-A)

- ✅ Task 1: metadata activation (`intent` approved + `isolate` active)
- ✅ Task 2: ingestion scope contract + evidence baseline (`ingestion-proof.md`)
- ✅ Task 3: ingest runner + deterministic ingestion log schema (`sync:org-memory`)
- ✅ Task 4: recall evaluation harness with comparable metrics (`eval:org-memory-recall`)
- ✅ Task 5: session handoff + MCP interaction trace automation (`trace:org-memory-handoff`)
- ✅ Task 6: internal usage metrics pipeline (`metrics:org-memory`)
- ✅ Task 7: acceptance gate pack + final evidence collection (`P1-A-ACCEPTANCE.md`)
- ✅ Task 8: CI/non-regression guard + G4 remediation (`ci:org-memory-acceptance`)
- ✅ Closeout: baseline locked with `org-memory-p1-a-complete`
- ✅ P1-B intent approved: [knowledge-ingestion-p1-b-intent.md](../../designs/drafts/knowledge-ingestion-p1-b-intent.md)
- ✅ P1-B isolate active: [knowledge-ingestion-p1-b-isolate.md](../../designs/drafts/knowledge-ingestion-p1-b-isolate.md)
- ✅ P1-B blueprint drafted: [knowledge-ingestion-p1-b-plan.md](../../designs/drafts/knowledge-ingestion-p1-b-plan.md)
- ✅ ADR accepted: [ADR-0005-knowledge-ingestion-pipeline.md](../../core/architecture/ADR-0005-knowledge-ingestion-pipeline.md)
- ✅ Wave 1 foundation complete (contracts + ADR + schema)
- ✅ Wave 2 pipeline core complete (normalizer + chunk + orchestrator)
- ✅ Wave 3 embedding layer complete (job lifecycle + retry/resume + tests)
- ✅ Wave 4 knowledge store + index update complete (versioned persistence + boundary adapter + recovery tests)
- ✅ Wave 5 end-to-end proof complete (`WAVE-5-END-TO-END-PROOF.md`)
- ✅ P1-B acceptance report drafted (`P1-B-ACCEPTANCE-REPORT.md`)
- ✅ P1-B baseline locked (`org-memory-p1-b-complete`)
- ✅ P1-C intent approved: [retrieval-recall-p1-c-intent.md](../../designs/drafts/retrieval-recall-p1-c-intent.md)
- ✅ P1-C isolate active: [retrieval-recall-p1-c-isolate.md](../../designs/drafts/retrieval-recall-p1-c-isolate.md)
- 🟡 P1-C blueprint drafted: [retrieval-recall-p1-c-plan.md](../../designs/drafts/retrieval-recall-p1-c-plan.md)
- ✅ P1-C blueprint approved + Wave 1 complete (contracts, ADR-0006, service skeleton)
- ✅ P1-C Wave 2 complete (SQL + Knowledge candidate providers)
- ⏳ Next: Wave 3 Ranking Intelligence

