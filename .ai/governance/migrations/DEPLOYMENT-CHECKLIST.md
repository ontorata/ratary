# Deployment Checklist

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 5 |
| **Authority** | [MIGRATION-POLICY.md](./MIGRATION-POLICY.md) |

---

## Purpose

Provide a concrete checklist for executing a migration safely, before and after execution. Every item must be checked. No exceptions.

---

## Pre-Migration Checklist

Complete all items before executing the migration.

### 1. Planning

- [ ] Migration evidence artifact created: `.ai/migrations/YYYY-MM-DD-migration-name.md`
- [ ] Risk level determined: Safe / Review Required / High Risk
- [ ] Approval obtained (if Review Required or High Risk)
- [ ] Governance owner notified of execution window

### 2. Backup

- [ ] Full database backup confirmed
- [ ] Backup restorable (staging test)
- [ ] Point-in-time recovery capability confirmed
- [ ] Backup retention: 30 days minimum

### 3. Environment

- [ ] Maintenance window defined and communicated
- [ ] Stakeholders notified (if user-facing)
- [ ] Monitoring baseline captured (query performance, error rate)
- [ ] Deployment window: low-traffic period preferred

### 4. Dependencies

- [ ] Application version compatible with new schema
- [ ] Application can be rolled back independently if needed
- [ ] No other migrations scheduled during same window
- [ ] Migration script reviewed by peer (Review Required / High Risk)

### 5. Rollback Readiness

- [ ] Rollback script prepared and committed to repository
- [ ] Rollback tested in staging
- [ ] Rollback plan documented in migration evidence artifact
- [ ] Rollback execution time estimated

### 6. Validation

- [ ] Migration script validated against target database (staging)
- [ ] All tests pass after migration in staging
- [ ] Smoke test passes in staging
- [ ] Performance baseline captured pre-migration

---

## Execution Checklist

Complete each item in order during the migration window.

### 1. Before Execution

- [ ] Monitoring active (real-time dashboards)
- [ ] On-call engineer available
- [ ] Rollback owner identified and available
- [ ] Maintenance mode enabled (if user-facing)

### 2. During Execution

- [ ] Migration script executed
- [ ] Duration logged
- [ ] Errors captured
- [ ] Row counts verified (if applicable)

### 3. After Execution — Schema Validation

- [ ] New schema confirmed via inspection
- [ ] Indexes verified (if applicable)
- [ ] Constraints enforced (if applicable)
- [ ] No orphaned objects

### 4. After Execution — Application Health

- [ ] Application starts without errors
- [ ] Health check endpoints: 200 OK
- [ ] Core API endpoints: 200 OK
- [ ] Error rate: baseline or below
- [ ] Response time: baseline or below

### 5. After Execution — Data Integrity

- [ ] Row counts verified (if applicable)
- [ ] No data loss (compare vs pre-migration backup)
- [ ] Data types correct
- [ ] Foreign key constraints enforced
- [ ] Default values applied correctly

### 6. After Execution — Evidence Update

- [ ] Migration evidence artifact updated with execution result
- [ ] Actual duration logged
- [ ] Actual row counts logged
- [ ] Issues encountered documented
- [ ] Performance delta vs baseline documented

---

## Post-Migration Checklist

Complete within 24 hours of migration.

- [ ] Monitoring for 24h post-migration (performance, errors)
- [ ] User support monitored for schema-related issues
- [ ] Migration evidence artifact finalized and committed
- [ ] Ratary memory updated via MCP (if available)
- [ ] Audit trail updated: `.ai/sessions/CURRENT.md`
- [ ] Governance evidence updated if required by wave

---

## Emergency Abort Checklist

If something goes wrong during execution:

- [ ] Stop migration immediately (if mid-execution)
- [ ] Do NOT proceed with application restart
- [ ] Assess impact
- [ ] Page rollback owner
- [ ] Execute rollback per [ROLLBACK-PROCEDURE.md](./ROLLBACK-PROCEDURE.md)

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Migration owner (engineer) | | |
| Rollback owner (human) | | |
| Governance owner | | |
| Monitoring confirmed | | |

---

## Release Type Checklist Variants

### Safe Migration (Self-Approval)

Simplified checklist:
- [ ] Evidence artifact created
- [ ] Backup confirmed
- [ ] Rollback plan documented
- [ ] Staging validated
- [ ] Execution
- [ ] Post-migration verification

### Review Required Migration

Full checklist (all items above).

### High Risk Migration

Full checklist +:
- [ ] ADR filed before execution
- [ ] Rollback tested in staging by second engineer
- [ ] Governance owner present during execution
- [ ] Post-mortem scheduled

---

## Related

- [MIGRATION-POLICY.md](./MIGRATION-POLICY.md)
- [ROLLBACK-PROCEDURE.md](./ROLLBACK-PROCEDURE.md)
- [MIGRATION-EVIDENCE-TEMPLATE.md](../../migrations/MIGRATION-EVIDENCE-TEMPLATE.md)
