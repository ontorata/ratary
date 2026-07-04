# Phase 17 — ROADMAP_UPDATE

**Target documents:** 10-POST-ROADMAP.md · 11-ENTERPRISE-ROADMAP.md · 10-PHASE-STATUS.md

**Apply when:** ADR-032 **Approved**.

---

## Priority

| Document | Update |
|----------|--------|
| 11-ENTERPRISE-ROADMAP | Phase 17 = **P0 enterprise** (security gate before cloud multi-tenant) |
| 10-POST-ROADMAP | Note: Phase 17 can parallel Phase 16 after Phase 10 RBAC stable |

## Dependencies

```
Phase 10 Enterprise RBAC (✅) → Phase 17
Phase 16 SDK (optional) → consumes tokens; not blocking
Phase 18 Cloud → requires Phase 17 tenant isolation + quota
```

## 10-PHASE-STATUS.md

- Phase 17: 🔲 → 🔄 when ADR Approved
- Track: OPA bundle CI, SSO mock IdP tests

## docs/adr/README.md

- ADR-032: Proposed → Approved (owner action)

---

## Compatibility note

When `ENTERPRISE_SECURITY_V2=false`, roadmap must state **identical behavior to Phase 10** for existing deployments.
