# Phase 18 — Cloud Platform — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateCloudPlatformPhase1()` in `src/db/migrations.ts` (ADR-033).

### Objects

- `cloud_regions`, `cloud_tenant_metadata`, `cloud_workspace_regions`
- `cloud_usage_records` — usage meter events
- `cloud_dr_schedules` — DR schedule metadata

---

## Verification

[`tests/db/cloud-platform-migration.test.ts`](../../../tests/db/cloud-platform-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | Disable `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED` independently |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
