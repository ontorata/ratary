# Phase 17 — ARCHITECTURE_UPDATE

**Target document:** [.ai/core/architecture/04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Apply when:** ADR-032 **Approved**.

---

## Sections to add or extend

### 1. Auth layer — enterprise extension

Extend **Auth layer** section with edge pipeline:

```
Request → IdentityProvider → IPolicyEngine → IQuotaEnforcer → Handlers → MemoryService
```

### 2. New ports (document in ports index)

| Port | Location | Default |
|------|----------|---------|
| `ITenantHierarchy` | `src/ports/security/` | SQL adapter |
| `IPolicyEngine` | `src/ports/security/` | Allow-all noop |
| `IIdentityFederation` | `src/ports/security/` | Disabled |
| `IIdpConnector` | `src/ports/security/idp/` | Per-IdP adapters |
| `IQuotaEnforcer` | `src/ports/security/` | Noop unlimited |
| `IComplianceAuditor` | extends audit bus | Optional export |

### 3. Tenant hierarchy model

Document hierarchy: Organization → Workspace → Department → Project (additive scope keys on existing memory scope).

### 4. Feature flags

| Flag | Default | Effect |
|------|---------|--------|
| `ENTERPRISE_SECURITY_V2` | `false` | Phase 10 RBAC only |
| `POLICY_ENGINE` | `none` | OPA when `opa` |
| `SSO_ENABLED` | `false` | Federation off |

---

## Sections unchanged

- MemoryService authorization contract (owner_id filter at repository)
- Cross-owner deny semantics
- No policy logic inside repositories

---

## Verification checklist

- [ ] MemoryService listed as **unchanged**
- [ ] OPA evaluation at middleware only
- [ ] Link ADR-032
