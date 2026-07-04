# Phase 17 — Enterprise Security — TESTING

**Status:** Implemented (2026-07-04)

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Composition gate | `tests/security/security-ports.test.ts` | enabled/disabled ports |
| Policy + quota | `tests/security/policy-quota.test.ts` | allow-all, rule deny, rate limit |
| Migration | `tests/db/enterprise-security-migration.test.ts` | Phase 17 tables |
| Server regression | full `npm test` | MemoryService unchanged |

---

## Manual smoke

```bash
ENTERPRISE_SECURITY_V2=true POLICY_ENGINE=rule-based QUOTA_ENFORCER=memory npm run dev

curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/security/status
curl http://localhost:3000/api/v1/auth/sso/metadata
curl "http://localhost:3000/api/v1/auth/sso/login?redirectUri=http://localhost:3000/callback"
```

---

## Quality gate

592+ tests green at default env (ENTERPRISE_SECURITY_V2=false).
