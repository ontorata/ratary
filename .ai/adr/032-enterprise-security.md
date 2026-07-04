# ADR-032: Enterprise Security — RBAC, ABAC, SSO, and Policy Engine (Phase 17)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 10 delivered organization RBAC (`IWorkspaceMembership`). Enterprise customers require **department/project hierarchy**, ABAC, OPA policy engine, SSO (SAML/OIDC/LDAP), IdP integrations (Azure AD, Okta, Keycloak, Google Workspace), audit/compliance packs, and quota scopes.

## Problem

- Flat org/workspace insufficient for enterprise hierarchy.
- RBAC-only cannot express attribute policies.
- No SSO federation path.
- Billing/quota scope not modeled.

## Constraints

- Extend auth layer — **not** MemoryService rewrite.
- Policy evaluation at **composition edge** before handlers.
- Fail closed; additive schema only.
- OPA as **optional adapter** (`IPolicyEngine` port) — not hardcoded.

## Decision

**Adopt layered security ports:**

1. `ITenantHierarchy` — org → department → project (additive scope fields).
2. `IPolicyEngine` — OPA adapter + allow-all default.
3. `IIdentityFederation` — SAML/OIDC/LDAP adapters.
4. `IQuotaEnforcer` — rate + storage quota at edge.
5. Extend audit for compliance export hooks (with Phase 19).

Memory operations unchanged — scope + deny at edge.

## Rollback

`ENTERPRISE_SECURITY_V2=false` — Phase 10 RBAC only.

## References

- ADR-010, Phase 10, Phase 17 DESIGN
