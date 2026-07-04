# Phase 18 — RISK_ANALYSIS

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-18-01 | Control plane bypasses tenant isolation | Low | Critical | Scope resolution at handler; Phase 17 policy; negative tests |
| R-18-02 | Usage meter slows hot path | Medium | High | Async Phase 12 subscriber only; perf gate in CI |
| R-18-03 | DR restore corrupts data plane | Low | Critical | Wrap existing backup port; staging drill; verifyIntegrity |
| R-18-04 | Multi-region split-brain writes | Medium | High | Primary region write authority; federation conflict policy |
| R-18-05 | Control plane API drift from SDK | Medium | Medium | OpenAPI additive admin spec; Phase 16 SDK minor bump |
| R-18-06 | Feature flag misconfiguration in prod | Medium | Medium | Default OFF; startup log active adapters |
| R-18-07 | Tenant metadata migration failure | Low | Medium | Idempotent backfill; rollback ignores new tables |
| R-18-08 | Cloud vendor lock-in via adapters | Low | Medium | `ICloudProvisioner` port; no vendor SDK in core |
| R-18-09 | Admin route exposure without Phase 17 | Low | Critical | Block implementation until Phase 17 auth wired |
| R-18-10 | Metering double-count on federation egress | Medium | Medium | Dedup keys on event id + peer id |

## Residual risks

- **Failover RTO/RPO** depends on external infra (K8s, storage) — documented as operator responsibility, not guaranteed by core.
- **Billing accuracy** — export format validated externally; core provides aggregates only.

## Escalation

| Trigger | Action |
|---------|--------|
| Cross-tenant data access in test | Stop rollout; security review |
| Hot path p99 regression > 5% with meter OFF | Block merge |
| DR drill failure | Hold GA; fix before `DR_PLATFORM_ENABLED` prod |
