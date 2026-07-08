# Migration Evidence Template

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 5 |
| **Authority** | [MIGRATION-POLICY.md](../governance/migrations/MIGRATION-POLICY.md) |
| **Rollback** | [ROLLBACK-PROCEDURE.md](../governance/migrations/ROLLBACK-PROCEDURE.md) |

---

## Purpose

Provide a consistent, auditable artifact for every migration. Evidence is required for all migrations — production and non-production.

---

## Migration Evidence

```markdown
# Migration — <YYYY-MM-DD> — <migration-name>

| Field | Value |
|-------|-------|
| **Migration ID** | YYYY-MM-DD-<short-slug> |
| **Date** | YYYY-MM-DD |
| **Owner** | |
| **Status** | Proposed / Approved / Executed / Rolled Back / Complete |
| **Risk Level** | Safe / Review Required / High Risk |

---

## Reason

<!-- Why is this migration needed? What problem does it solve? What is the business or technical justification? -->

---

## Affected Schema

| Object | Type | Change |
|--------|------|--------|
| | | |

---

## Forward Migration

```sql
<!-- Full migration SQL script, commented -->
```

### Script Location

<!-- Path to script in repository, if separate file -->

---

## Rollback Plan

### Trigger Condition

<!-- What symptom triggers rollback? -->

### Rollback Steps

1. <!-- Step 1 -->
2. <!-- Step 2 -->

### Expected Duration

<!-- How long rollback takes -->

### Verification After Rollback

<!-- How to confirm rollback succeeded -->

---

## Validation Result

### Pre-Migration (Staging)

| Check | Result |
|-------|--------|
| Schema change applied | ✅ / ❌ |
| Application starts | ✅ / ❌ |
| Smoke tests pass | ✅ / ❌ |
| Performance baseline | ✅ / ❌ |
| Rollback tested | ✅ / ❌ |

### Post-Migration (Production)

| Check | Result | Notes |
|-------|--------|-------|
| Schema change applied | ✅ / ❌ | |
| Application starts | ✅ / ❌ | |
| Health check | ✅ / ❌ | |
| Data integrity | ✅ / ❌ | |
| Performance delta | | |
| Error rate | | |

---

## Execution Record

| Field | Value |
|-------|-------|
| **Executed by** | |
| **Execution date** | |
| **Duration** | |
| **Rows affected** | |

---

## Issues Encountered

<!-- Any issues during execution, validation, or post-migration monitoring -->

---

## Related

- Rollback procedure: [.ai/governance/migrations/ROLLBACK-PROCEDURE.md](../governance/migrations/ROLLBACK-PROCEDURE.md)
- Deployment checklist: [.ai/governance/migrations/DEPLOYMENT-CHECKLIST.md](../governance/migrations/DEPLOYMENT-CHECKLIST.md)
- ADR (if applicable): [.ai/core/adr/ADR-0XX.md](../core/adr/ADR-0XX.md)
```

---

## Usage

1. Copy this template to `.ai/migrations/YYYY-MM-DD-migration-name.md`
2. Complete all fields before proposing the migration
3. Update status as migration progresses: Proposed → Approved → Executed → Complete
4. If rollback is triggered, update status to Rolled Back and add incident record
5. Commit to repository before execution

---

## Non-Goals

This template is for evidence and audit. It is not:
- A migration runner or tool
- A deployment automation script
- A database management interface

---

## Related

- [MIGRATION-POLICY.md](../governance/migrations/MIGRATION-POLICY.md)
- [ROLLBACK-PROCEDURE.md](../governance/migrations/ROLLBACK-PROCEDURE.md)
- [DEPLOYMENT-CHECKLIST.md](../governance/migrations/DEPLOYMENT-CHECKLIST.md)
