# Phase 10 — Enterprise — RISKS (Verification)

**Document:** RISKS  
**Phase status:** Verified at gate · re-verified 2026-07-05  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Risk register verification

| ID | Risk | Mitigation | Verification (2026-07-05) |
|----|------|------------|---------------------------|
| R10-01 | Adapter wiring breaks regression | Default flags = current behavior | **825 tests** pass \| 3 skipped at default env (`npm test`) |
| R10-02 | Dual port naming confusion | Bridges only in infrastructure | Single `createPlatformAdapters()` — `platform-adapters.defaults.test.ts` |
| R10-03 | Postgres dialect drift | Mitigated at adapter layer | ADR-009 Implemented; Phase 11 staging harness 3/3 PASS (ADR-018) |
| R10-04 | RBAC leaks into MemoryService | Auth boundary only | `enterprise-layer-boundaries.test.ts` — no membership in services/memory/repos |
| R10-05 | Org schema migration on live D1 | Idempotent DDL + backfill | `enterprise-migration.test.ts` + `organization-backfill.test.ts` |
| R10-06 | Object storage dual-write | Inline default | `OBJECT_STORAGE_PROVIDER=inline` default; R2/S3 gated in `createObjectStorage()` |
| R10-07 | Scope expansion breaks E2E | Extended leak tests | `cross-workspace-leak.test.ts` (17) + `cross-organization-leak.test.ts` (12) PASS |
| R10-08 | Premature Redis/Kafka | NoOp defaults | `EVENT_BUS_PROVIDER=noop`; `NoOpEventBus` in `create-event-bus.ts` |
| R10-09 | Repository refactor scope creep | Incremental ISqlDatabase | One adapter family per commit; optional 11C bounded by **ADR-019 Proposed** |
| R10-10 | Performance regression | Thin bridge | Accepted — no benchmark gate; bridge delegates only |

**Verdict:** All ten risks **mitigated or accepted**. No new gate blockers.

---

## Residual risks (accepted)

| Risk | Notes |
|------|-------|
| Postgres full-suite on live cluster | Adapter + staging harness PASS (Phase 11); production cutover remains owner-runbook (ADR-018) |
| JWT enterprise claims not auto-populated on issueToken | Additive schema only; membership enforced via DB port |
| RBAC requires manual membership seeding | Expected for enterprise; backfill script covers org linkage only |

---

## Pre-production checklist

These are **production deployment actions** — not phase gate blockers. Phase 10 gate passed with default config unchanged (`ENTERPRISE_RBAC=false`).

| # | Action | When |
|---|--------|-------|
| 1 | Run `scripts/backfill-organizations.ts` on production D1 | Before enabling org features |
| 2 | Confirm `ENTERPRISE_RBAC=false` unless membership data ready | Default is `false` — safe to deploy |
| 3 | Seed `workspace_memberships` before enabling RBAC | Before `ENTERPRISE_RBAC=true` |

---

*Verified 2026-07-03 at gate; re-verified 2026-07-05 against DESIGN §7 and full regression suite.*
