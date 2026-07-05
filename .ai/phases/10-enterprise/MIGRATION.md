# Phase 10 — Enterprise — MIGRATION

**Document:** MIGRATION  
**Phase status:** Complete  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Schema changes (additive)

Applied via `migrateEnterprisePhase1()` in `src/db/migrations.ts` (runs automatically on `runMigrations()`).

### New tables

```sql
organizations (id, owner_id, name, slug, created_at)
workspace_memberships (id, organization_id, workspace_id, identity_id, role, created_at)
```

### Column addition

```sql
ALTER TABLE workspaces ADD COLUMN organization_id TEXT;
```

Canonical snapshot: `schema.sql` (Phase 10 section).

---

## Rollout steps

| Step | Action | Production impact |
|------|--------|-------------------|
| 1 | Deploy code (defaults unchanged) | None |
| 2 | `runMigrations()` / deploy hook | Additive DDL only |
| 3 | `npx tsx scripts/backfill-organizations.ts` | Links workspaces → default org per owner |
| 4 | (Optional) `ENTERPRISE_RBAC=true` | Enables membership checks |

---

## Backfill: organizations

**Script:** `scripts/backfill-organizations.ts`  
**Library:** `scripts/lib/organization-backfill.ts`

Behavior (idempotent):

1. For each owner with workspaces missing `organization_id`, ensure `organizations` row (`slug=default`).
2. `UPDATE workspaces SET organization_id = ? WHERE owner_id = ? AND organization_id IS NULL`.
3. Exit non-zero if any workspace remains unlinked.

---

## Rollback

| Change | Rollback |
|--------|----------|
| Code deploy | Revert release; defaults restore D1-only path |
| `ENTERPRISE_RBAC=true` | Set `ENTERPRISE_RBAC=false` → Phase 9 owner-only path |
| DDL | Forward-fix only; do not drop columns in production |

---

## Not in scope

- PostgreSQL production cutover runbook ([ADR-018](018-production-postgres-cutover.md) — Phase 11)
- R2 content dual-write / `IMemoryContentReader` wiring (Phase 13)

---

*Migration verified by `tests/db/enterprise-migration.test.ts` and `tests/scripts/organization-backfill.test.ts`.*
