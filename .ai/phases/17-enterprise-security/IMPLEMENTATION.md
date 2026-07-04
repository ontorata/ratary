# Phase 17 — Enterprise Security — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-032 Implemented](../../adr/032-enterprise-security.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 17A | `ITenantHierarchy` + SQL adapter | ✅ |
| 17B | `IPolicyEngine` — allow-all, rule-based, OPA | ✅ |
| 17C | `IIdentityFederation` — OIDC path + noop | ✅ |
| 17D | `IIdpConnectorRegistry` — Azure/Okta/Keycloak/Google stubs | ✅ |
| 17E | `IQuotaEnforcer` — noop + in-memory | ✅ |
| 17F | `IComplianceAuditor` — in-memory export | ✅ |
| 17G | Edge middleware (policy + quota) | ✅ |
| 17H | REST `/security/*`, `/auth/sso/*` | ✅ |

---

## File map

```
src/security/
  types/           hierarchy, policy, quota, SSO types
  ports/           ITenantHierarchy, IPolicyEngine, IQuotaEnforcer, ...
  adapters/        allow-all, rule-based, OPA, OIDC, noop, IdP registry
  middleware/      policy.middleware.ts, quota.middleware.ts
src/infrastructure/security/
  sql-tenant-hierarchy.ts
src/composition/create-security-ports.ts
src/controllers/security.controller.ts
src/routes/v1/security.routes.ts, sso.routes.ts
src/db/migrations.ts   migrateEnterprisePhase2
tests/security/
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `ENTERPRISE_SECURITY_V2` | `false` | Master gate |
| `POLICY_ENGINE` | `none` | `allow-all`, `rule-based`, `opa` |
| `OPA_URL` | — | OPA HTTP endpoint |
| `SSO_ENABLED` | `false` | OIDC federation |
| `OIDC_ISSUER_URL` | — | IdP issuer |
| `OIDC_CLIENT_ID` | — | OAuth client |
| `OIDC_CLIENT_SECRET` | — | Optional secret |
| `QUOTA_ENFORCER` | `none` | `memory` for in-process counters |
| `QUOTA_MAX_REQUESTS_PER_MINUTE` | `1000` | Rate limit |
| `QUOTA_MAX_WRITES_PER_DAY` | `10000` | Write quota |

---

## REST endpoints (when enabled)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/security/status` | Layer status |
| GET | `/api/v1/security/hierarchy` | List departments |
| GET | `/api/v1/security/quota` | Quota status |
| GET | `/api/v1/security/idp/providers` | IdP catalog |
| GET | `/api/v1/security/compliance/export` | Audit export |
| GET | `/api/v1/auth/sso/metadata` | SSO metadata (public) |
| GET | `/api/v1/auth/sso/login` | Start OIDC login (public) |
| POST | `/api/v1/auth/sso/callback` | OIDC callback (public) |

---

## Request pipeline (when enabled)

```
Auth → [ENTERPRISE_RBAC membership] → IPolicyEngine → IQuotaEnforcer → Handlers → MemoryService
```

---

## Invariants

- **`MemoryService` unchanged** — scope + deny at edge only
- Default `ENTERPRISE_SECURITY_V2=false` — Phase 10 behavior preserved
- Fail closed on policy deny (403 `POLICY_DENIED`)
- Quota exceeded → 429 `QUOTA_EXCEEDED`

---

## Rollback

`ENTERPRISE_SECURITY_V2=false` — middleware not mounted; Phase 10 JWT/API key only.
