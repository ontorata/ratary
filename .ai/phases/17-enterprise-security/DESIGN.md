# Phase 17 — Enterprise Security — DESIGN

**ADR:** [ADR-032](../../adr/032-enterprise-security.md)

## Mengapa diperlukan?

Phase 10 RBAC is **workspace-level**. Enterprise needs **department/project hierarchy**, ABAC, OPA policies, SSO (SAML/OIDC/LDAP), IdP integrations, compliance audit, quota/billing scope — without rewriting MemoryService.

## Mengapa terpisah?

| Phase | Separation |
|-------|------------|
| 10 | Base org/workspace RBAC — **completed, unchanged** |
| 16 | SDK consumes auth — doesn't implement SSO |
| 18 | Cloud provisioning — uses security identity, doesn't define IdP |
| 19 | Observability — exports audit, doesn't author policy |

## Scope

**Hierarchy:** Organization → Department → Project → Workspace (additive scope fields on `MemoryScope`).

**Ports (new):**

| Port | Adapters |
|------|----------|
| `ITenantHierarchy` | Sql hierarchy store |
| `IPolicyEngine` | OPA, allow-all default |
| `IIdentityFederation` | SAML, OIDC, LDAP |
| `IIdpConnector` | Azure AD, Okta, Keycloak, Google Workspace |
| `IQuotaEnforcer` | Redis/memory counters |
| `IComplianceAuditor` | Extends audit bus |

**Auth models:** RBAC (existing) + ABAC via OPA + policy engine.

**Edge evaluation:** Policy runs **before** handlers — deny = 403/404 per ADR-007.

## Architecture

```
Request → Auth → IPolicyEngine → IQuotaEnforcer → Handlers → MemoryService
```

MemoryService **unchanged** — receives resolved `MemoryScope` only.

## Migration

- Additive tables: `departments`, `projects`, `policy_bindings`
- Backfill: default department/project per org
- `ENTERPRISE_SECURITY_V2=false` → Phase 10 behavior

## Impact

| Dimension | Impact |
|-----------|--------|
| Enterprise | **Primary** — SSO, compliance |
| Security | Zero-trust identity federation |
| Governance | Policy engine foundation |
| Developer | SDK auth helpers only |
| Scalability | OPA eval cached at edge |

## Rollback

Disable `POLICY_ENGINE=none`, `SSO_ENABLED=false` — revert to Phase 10 JWT/API key.

*ADR-032 Approved required.*
