# Phase 17 — Enterprise Security — TESTING

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record verification strategy and evidence: unit, integration, E2E, fixtures, quality gate.

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

| Metric | Value |
|--------|-------|
| Phase gate (2026-07-04) | 592+ tests green |
| Current regression | 689 passed | 3 skipped (default env, 2026-07-04) |

---

## Test suites

| File | Coverage |
|------|----------|
| `tests/security/security-ports.test.ts` | Enabled/disabled composition |
| `tests/security/policy-quota.test.ts` | Policy deny, quota 429 |
| `tests/db/enterprise-security-migration.test.ts` | Phase 17 DDL |

---

## Scenarios verified

- [x] `ENTERPRISE_SECURITY_V2=false` — full suite green
- [x] Fail closed: 403 POLICY_DENIED, 429 QUOTA_EXCEEDED
- [x] SSO metadata/login routes registered when enabled

## Manual verification

```bash
Enable V2 + rule-based policy → curl `/security/status` and SSO metadata
```

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
