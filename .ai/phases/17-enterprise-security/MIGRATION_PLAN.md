# Phase 17 — MIGRATION_PLAN

**Compatibility:** Phase 10 JWT/API key unchanged. Additive JWT claims for department/project.

**Rollout:** S0 flags off → S1 hierarchy schema → S2 OPA staging → S3 SSO pilot → S4 quota.

**Rollback:** Env flags; no data destruction — policies disabled reverts to RBAC-only.
