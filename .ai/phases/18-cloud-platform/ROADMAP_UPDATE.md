# Phase 18 — ROADMAP_UPDATE

**Apply when:** ADR-033 **Approved**.

---

## Sequencing

```
Phase 17 (security) → Phase 18 (cloud)
Phase 14 (federation) → Phase 18 (multi-region DR)
Phase 12 (events) → Phase 18 (usage metering subscriber)
```

Phase 18 **follows** Phase 17 — cloud multi-tenant without OPA/quota is forbidden in roadmap text.

## Document updates

| File | Change |
|------|--------|
| 11-ENTERPRISE-ROADMAP | Phase 18 status; dependency arrows |
| 10-POST-ROADMAP | Billing/metering as Phase 18 scope (not Phase 12) |
| 10-PHASE-STATUS | Control plane ports checklist |

## ADR gate

ADR-033 Proposed → Approved before any `src/ports/cloud/` implementation.
