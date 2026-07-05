# Phase 17 — Enterprise Security — MIGRATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Schema changes (additive)

Applied via `migrateEnterprisePhase2()` in `src/db/migrations.ts` (ADR-032).

### Objects

- `departments`, `tenant_projects` — org hierarchy
- `workspace_hierarchy_bindings` — workspace → dept/project links
- `policy_bindings` — OPA policy attachment metadata

---

## Verification

[`tests/db/enterprise-security-migration.test.ts`](../../../tests/db/enterprise-security-migration.test.ts)

| Property | Value |
|----------|-------|
| Rollback | `ENTERPRISE_SECURITY_V2=false` — tables remain; security pipeline bypassed when OFF |
| Idempotency | Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards |
| Production | Opt-in where flagged; default deploy unchanged |
Gate evidence: migration test green at gate 2026-07-04.


---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
