# Phase 18 — Cloud Platform

**Status:** 🔲 Reserved — Design draft (2026-07-04)  
**ADR:** [ADR-033](../../adr/033-cloud-platform.md) — **Proposed**  
**Enterprise roadmap:** [11-ENTERPRISE-ROADMAP.md](../roadmap/11-ENTERPRISE-ROADMAP.md)

## Documents

| File | Purpose |
|------|---------|
| [DESIGN.md](DESIGN.md) | Architecture & boundaries |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Implementation prompt |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |
| [COMPLETION_TEMPLATE.md](COMPLETION_TEMPLATE.md) | Closure form |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Commit sequence |
| [MIGRATION_PLAN.md](MIGRATION_PLAN.md) | Rollout & compatibility |
| [TESTING_PLAN.md](TESTING_PLAN.md) | Verification |
| [RISK_ANALYSIS.md](RISK_ANALYSIS.md) | Risks |
| [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) | SC-18-xx |

**Prerequisite:** Phase 14 ✅ (federation) · Phase 17 🔲 (enterprise security)  
**Invariant:** `MemoryService` unchanged — control plane orchestrates metadata only.
