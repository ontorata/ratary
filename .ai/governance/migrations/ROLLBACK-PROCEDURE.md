# Rollback Procedure

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 5 |
| **Authority** | [MIGRATION-POLICY.md](./MIGRATION-POLICY.md) |

---

## Purpose

Define the decision, ownership, and steps for rolling back a migration that introduces unintended side effects.

---

## Rollback Flow

```
Failure Detected
    │
    ▼
Assess Impact
    │
    ▼
Approve Rollback
    │
    ▼
Execute Rollback
    │
    ▼
Verify System State
    │
    ▼
Document Incident
```

---

## Rollback Decision

### When to Roll Back

| Condition | Trigger |
|-----------|---------|
| Application crash on startup | Immediate rollback |
| Data corruption detected | Immediate rollback |
| Performance regression > 20% | Rollback within 1h |
| API contract broken | Immediate rollback |
| User-facing error spike | Immediate rollback |
| Migration evidence artifact missing | Block execution |

### When NOT to Roll Back

| Condition | Action Instead |
|-----------|---------------|
| Minor performance regression (< 20%) | Monitor, escalate if persists |
| Expected schema change visible in logs | Document, no rollback |
| CI failure on migration script | Fix script, re-validate |
| Minor data inconsistency | Fix via corrective migration |

---

## Rollback Triggers

| Trigger | Severity | Response Time |
|---------|---------|---------------|
| Application crash | Critical | Immediate |
| Data corruption | Critical | Immediate |
| API contract broken | Critical | Immediate |
| User-facing error spike | High | Within 30 min |
| Performance regression > 20% | High | Within 1h |
| Migration evidence artifact missing | Medium | Block execution |

---

## Backup Requirement

Before any production migration:

- [ ] Full database backup confirmed
- [ ] Backup is restorable (tested in staging)
- [ ] Backup retention policy: 30 days minimum
- [ ] Point-in-time recovery capability confirmed

**If backup is not confirmed, production migration does not proceed.**

---

## Rollback Owner

| Context | Owner |
|---------|-------|
| Application rollback | Release owner (human) |
| Governance artifact rollback | Engineer + Governance owner |
| Data correction migration | Engineer + Governance owner |
| Incident escalation | Governance owner |

**AI agents may prepare rollback scripts but may not execute them in production.**

---

## Rollback Plan

Every migration evidence artifact must include a rollback plan before execution.

### Rollback Plan Template

```markdown
## Rollback Plan

### Trigger Condition
<!-- What symptom triggers rollback -->

### Rollback Steps
1. <!-- Step 1 -->
2. <!-- Step 2 -->

### Expected Duration
<!-- How long rollback takes -->

### Verification After Rollback
<!-- How to confirm rollback succeeded -->

### Post-Rollback Action
<!-- What to do after rollback (ADR, fix, etc.) -->
```

### Rollback Script Requirements

| Requirement | Detail |
|-------------|--------|
| Idempotent | Must be safe to re-run |
| Tested | Validated in staging before production |
| Documented | Every command explained |
| Non-destructive | Prefer `UPDATE` over `DELETE` |
| Versioned | Committed to repository before migration |

---

## Execution Steps

### 1. Failure Detected

- Capture error evidence: logs, metrics, user reports
- Do NOT attempt fix without assessment
- Page release owner immediately if critical

### 2. Assess Impact

- Determine affected scope: all users / single tenant / single endpoint
- Check if data corruption is present
- Measure performance delta vs baseline
- Consult migration evidence artifact for known risks

### 3. Approve Rollback

- [ ] Impact assessment documented
- [ ] Rollback plan reviewed
- [ ] Governance owner notified
- [ ] Rollback approval confirmed (governance owner + release owner)

### 4. Execute Rollback

- [ ] Production put into maintenance mode (if user-facing)
- [ ] Rollback script executed
- [ ] Application restarted (if needed)
- [ ] Monitoring active

### 5. Verify System State

- [ ] Application starts without errors
- [ ] Health check endpoints return 200
- [ ] Core user flows verified (smoke test)
- [ ] Error rate returned to baseline
- [ ] Performance returned to baseline
- [ ] No data corruption detected

### 6. Document Incident

- [ ] Incident record created: `.ai/incidents/YYYY-MM-DD-<id>.md`
- [ ] Migration evidence artifact updated with rollback record
- [ ] Root cause identified (if known)
- [ ] ADR filed if pattern change needed
- [ ] Ratary memory updated via MCP
- [ ] Audit trail updated: `.ai/sessions/CURRENT.md`

---

## Incident Record Template

```markdown
# Incident — <YYYY-MM-DD> — <Brief Title>

| Field | Value |
|-------|-------|
| **Date** | YYYY-MM-DD |
| **Severity** | Critical / High / Medium |
| **Affected scope** | |
| **Detection** | How discovered |
| **Duration** | Time to resolution |
| **Rollback executed** | Yes / No |

## Timeline

- HH:MM — Event
- HH:MM — Event

## Root Cause

## Fix Applied

## Lessons Learned

## Related

- Migration evidence: `.ai/migrations/<id>.md`
- ADR (if applicable): `.ai/core/adr/ADR-0XX.md`
```

---

## Post-Rollback Action

After rollback, do not re-attempt the migration until:

1. Root cause identified and documented
2. Fix prepared and validated in staging
3. New migration evidence artifact written
4. Governance owner sign-off obtained

---

## Related

- [MIGRATION-POLICY.md](./MIGRATION-POLICY.md)
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
- [MIGRATION-EVIDENCE-TEMPLATE.md](../../migrations/MIGRATION-EVIDENCE-TEMPLATE.md)
