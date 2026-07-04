# Phase 17 — Enterprise Security

**Status:** ✅ Implemented (2026-07-04)  
**ADR:** [ADR-032 Implemented](../../adr/032-enterprise-security.md)

## Summary

Enterprise-grade security layer: department/project hierarchy, ABAC policy engine (OPA opt-in), OIDC SSO federation, IdP connector catalog, quota enforcement, and compliance audit — **edge evaluation only; MemoryService unchanged**.

## Documents

| File | Purpose |
|------|---------|
| [DESIGN.md](DESIGN.md) | Architecture & boundaries |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | What was built |
| [TESTING.md](TESTING.md) | Test coverage |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Implementation prompt |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |
| [COMPLETION_TEMPLATE.md](COMPLETION_TEMPLATE.md) | Closure form |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Commit sequence |
| [MIGRATION_PLAN.md](MIGRATION_PLAN.md) | Rollout & compatibility |
| [TESTING_PLAN.md](TESTING_PLAN.md) | Verification |
| [RISK_ANALYSIS.md](RISK_ANALYSIS.md) | Risks |
| [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) | SC-17-xx |

**Prerequisite:** Phase 10 ✅ · Phase 16 ✅ (SDK consumes auth tokens)
