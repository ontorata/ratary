# Phase 17 — Supporting Documents

## TASK_PROMPT
Implement enterprise security ports: hierarchy, OPA policy engine, SSO/IdP adapters, quota enforcer — **edge only, MemoryService unchanged**. ADR-032 Approved required.

## IMPLEMENTATION_PLAN
1. ADR-032 · 2. Schema additive · 3. ITenantHierarchy · 4. IPolicyEngine+OPA · 5. IIdentityFederation · 6. IIdpConnector refs · 7. IQuotaEnforcer · 8. Admin API env-gated · 9. Gate docs

## MIGRATION_PLAN
Additive DDL; backfill scripts; feature flags default OFF; SSO cutover runbook per IdP.

## TESTING_PLAN
Policy unit tests; SSO mock IdP; cross-tenant deny; quota exceed; RBAC regression; OPA bundle CI.

## RISK_ANALYSIS
R-17-01 policy bypass · R-17-02 SSO misconfig · R-17-03 OPA latency — cache mitigations.

## SUCCESS_CRITERIA
SC-17-01 ADR Approved · SC-17-02 OPA optional · SC-17-03 SSO OIDC path · SC-17-04 Hierarchy scope · SC-17-05 MemoryService unchanged · SC-17-06 Audit export · SC-17-07 Default env green

## CHECKLIST / COMPLETION_TEMPLATE
Standard phase gate per PHASE-DOCUMENT-SCHEMA.
