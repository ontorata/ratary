# Migration Policy

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 5 |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |
| **Rollback** | [ROLLBACK-PROCEDURE.md](./ROLLBACK-PROCEDURE.md) |
| **Evidence** | [MIGRATION-EVIDENCE-TEMPLATE.md](../../migrations/MIGRATION-EVIDENCE-TEMPLATE.md) |

---

## Purpose

Make database, schema, and data changes **safe, auditable, and recoverable.** Migration is a change of **state**, not just a change of file.

---

## Migration Lifecycle

```
Migration Proposal
    │
    ▼
Impact Analysis
    │
    ▼
Migration Script
    │
    ▼
Validation
    │
    ▼
Execution
    │
    ▼
Rollback Capability
    │
    ▼
Evidence
```

Each stage has explicit criteria. No production migration without evidence artifact.

---

## Ownership

| Stage | Owner |
|-------|-------|
| Migration Proposal | Engineer |
| Impact Analysis | Engineer + Peer |
| Migration Script | Engineer |
| Validation | Engineer + CI |
| Execution | Release owner (human) |
| Rollback Capability | Engineer |
| Evidence | Engineer / AI agent |

---

## Approval Requirement

| Risk Level | Approval Required |
|------------|-----------------|
| Safe | Engineer self-approval |
| Review Required | Peer review + Governance owner |
| High Risk | Governance owner + ADR filing |

**Approval is required before execution, not before proposal.**

---

## Schema Change Classification

### Safe — Engineer Self-Approval

| Change | Reason |
|--------|--------|
| `CREATE TABLE` | Additive — no data loss |
| `ALTER TABLE ADD COLUMN` (nullable, no default) | Additive — existing rows unaffected |
| `CREATE INDEX` (non-blocking) | Additive |
| `CREATE VIEW` | Additive |
| New enum value appended | Additive if appended, not inserted |

**Requires:** Migration evidence artifact, test validation.

---

### Review Required — Peer + Governance Owner

| Change | Reason |
|--------|--------|
| `ALTER TABLE ADD COLUMN` (with default) | May cause table rewrite on large tables |
| `CREATE INDEX` (blocking) | Lock contention during build |
| `DROP INDEX` | May degrade query performance |
| `ALTER TABLE ALTER COLUMN` (type change) | May lose precision or truncate data |
| Data backfill via migration | Non-idempotent if re-run |
| `CREATE SEQUENCE` | Affects ID generation |
| `DROP VIEW` | May break dependent queries |
| Multi-table `UPDATE` / `DELETE` | Transaction scope risk |

**Requires:** Peer review, migration evidence artifact, rollback plan, governance owner sign-off.

---

### High Risk — Governance Owner + ADR

| Change | Reason |
|--------|--------|
| `ALTER TABLE DROP COLUMN` | Data loss — irreversible |
| `ALTER TABLE RENAME COLUMN` | Application breakage risk |
| `DROP TABLE` | Data loss — irreversible |
| `DROP SCHEMA` | Data loss — irreversible |
| `ALTER TABLE ALTER COLUMN` (NOT NULL without default) | Requires default or backfill |
| `ALTER TABLE ALTER COLUMN` (type narrowing) | Data truncation risk |
| `TRUNCATE` | Data loss — irreversible |
| Bulk data migration | Non-idempotent, large transaction risk |
| `ALTER TABLE ALTER COLUMN SET DEFAULT` (on large table) | Table rewrite |

**Requires:** ADR filed describing migration rationale, rollback plan, governance owner sign-off, governance evidence artifact. Rollback must be tested before execution.

---

## Backward Compatibility Rule

Every migration must be **backward-compatible** with the previous application version during rollout.

**Rule:** Application version N must work against database schema version N-1 (before migration) and N (after migration) during a rolling deployment.

**Implication:** No `NOT NULL` columns without defaults on first deploy. No rename columns. No drop columns.

**Exception:** If backward compatibility is technically impossible, file an ADR and document the deployment constraint.

---

## Production Migration Rule

| Requirement | Detail |
|-------------|--------|
| Evidence artifact | Required before execution |
| Backup | Verified before execution |
| Maintenance window | Defined and communicated |
| Rollback tested | Rollback script validated in staging |
| Monitoring | Query performance baseline captured before migration |
| Execution owner | Human (not CI, not AI agent) |

**Production migration is never automated. It is always human-initiated and human-verified.**

---

## Evidence Requirement

Every migration — including non-production — must produce a migration evidence artifact:

**Path:** `.ai/migrations/YYYY-MM-DD-migration-name.md`

**Template:** [MIGRATION-EVIDENCE-TEMPLATE.md](../../migrations/MIGRATION-EVIDENCE-TEMPLATE.md)

| Field | Required |
|-------|----------|
| Migration ID | ✅ |
| Owner | ✅ |
| Reason | ✅ |
| Affected schema | ✅ |
| Risk level | ✅ |
| Forward migration | ✅ |
| Rollback plan | ✅ |
| Validation result | ✅ |

---

## Non-Goals

- No execution of database migrations (this is a governance policy, not a migration tool)
- No alteration of schema (governance only)
- No introduction of migration tools (Alembic, Flyway, Liquibase, etc.)
- No ORM changes
- No deployment automation

**Focus:** Migration governance = control plane. Execution remains a human decision.

---

## Related

- [ROLLBACK-PROCEDURE.md](./ROLLBACK-PROCEDURE.md)
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
- [MIGRATION-EVIDENCE-TEMPLATE.md](../../migrations/MIGRATION-EVIDENCE-TEMPLATE.md)
- [CHANGE-EVIDENCE.md](../workflows/CHANGE-EVIDENCE.md)
- [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md)
