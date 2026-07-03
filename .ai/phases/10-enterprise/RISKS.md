# Phase 10 — Enterprise — RISKS (Verification)

**Document:** RISKS  
**Phase status:** Verified at gate  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Risk register verification

| ID | Risk | Mitigation | Verification |
|----|------|------------|--------------|
| R10-01 | Adapter wiring breaks regression | Default flags = current behavior | **337 tests** green at default env |
| R10-02 | Dual port naming confusion | Bridges only in infrastructure | Single `createPlatformAdapters()` factory |
| R10-03 | Postgres dialect drift | Deferred sub-ADR | ADR-009 Proposed; runtime throw if selected |
| R10-04 | RBAC leaks into MemoryService | Auth boundary only | Grep: no membership checks in services |
| R10-05 | Org schema migration on live D1 | Idempotent DDL + backfill | Migration + backfill tests |
| R10-06 | Object storage dual-write | Inline default | `InlineObjectStorage` only; R2 gated |
| R10-07 | Scope expansion breaks E2E | Extended leak tests | cross-workspace (17) + cross-org (12) PASS |
| R10-08 | Premature Redis/Kafka | NoOp defaults | NoOp event bus / analytics |
| R10-09 | Repository refactor scope creep | Incremental ISqlDatabase | One adapter family per commit area |
| R10-10 | Performance regression | Thin bridge | No benchmark regression gate required; indirection minimal |

---

## Residual risks (accepted)

| Risk | Notes |
|------|-------|
| Postgres not implemented | By design until ADR-009 Approved |
| JWT enterprise claims not auto-populated on issueToken | Additive schema only; membership enforced via DB port |
| RBAC requires manual membership seeding | Expected for enterprise; backfill script covers org linkage only |

---

## Pre-production checklist

- [ ] Run `scripts/backfill-organizations.ts` on production D1 after deploy
- [ ] Confirm `ENTERPRISE_RBAC=false` unless membership data ready
- [ ] Seed `workspace_memberships` before enabling RBAC

---

*Verified 2026-07-03 against DESIGN §7.*
