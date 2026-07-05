# Playbook: Rollback

**ID:** `playbooks/rollback`  
**Purpose:** Safely revert a deployment, migration, or configuration change to last known good state.  
**Owner sign-off:** Required before production rollback.

---

## When to execute

- Post-deploy verification fails
- Incident commander orders rollback
- Migration integrity check fails
- Error rate or latency exceeds abort threshold

**Not for:** forward fixes (use [hotfix.md](hotfix.md)) or planned downgrades.

---

## Prerequisites

| Check | Source |
|-------|--------|
| Rollback plan exists | `phases/NN-name/MIGRATION.md` or `migration/rollback-strategy` prompt output |
| Last known good version identified | `{BASELINE_VERSION}` |
| Data loss boundary understood | Migration rollback doc |
| Stakeholders notified | Incident or release channel |

---

## Procedure

### 1. Abort decision

Confirm rollback is safer than forward fix.

| Question | If YES |
|----------|--------|
| Forward fix ETA > impact duration? | Rollback |
| Data corruption risk on forward path? | Rollback |
| Rollback unsafe per migration doc? | Escalate — do not proceed blindly |

Prompt: `operations/escalation` if rollback unsafe.

### 2. Application rollback

| Step | Action |
|------|--------|
| 1 | Stop new traffic to bad version (LB, feature flag, scale to zero) |
| 2 | Deploy `{BASELINE_VERSION}` artifact |
| 3 | Verify health checks |
| 4 | Restore traffic gradually |

Prompt: `release/post-release-verification`

### 3. Schema rollback (if applicable)

Execute reverse steps from `migration/rollback-strategy` output only.

**Rule:** Never run undocumented DDL in production.

| Step | Action |
|------|--------|
| 1 | Confirm backward migration tested in staging |
| 2 | Run reverse migration scripts in order |
| 3 | Verify integrity queries |
| 4 | Confirm application compatible with reverted schema |

### 4. Data rollback (if applicable)

Follow `migration/data-migration-plan` reversal section.

Document any **irreversible** data loss.

### 5. Verify

| Check | Command / method |
|-------|------------------|
| Smoke tests | Critical user journeys |
| Metrics | Error rate, latency, saturation |
| Logs | No new error patterns |

### 6. Communicate and record

- Update incident or release thread
- File timeline in incident record
- Update `audits/latest.md` if governance or architecture impact

### 7. Forward path

Before re-attempting deploy:
- Root cause analysis (`operations/production-debug`)
- Fix and re-run `release/readiness-assessment`

---

## Exit criteria

- [ ] Service healthy on `{BASELINE_VERSION}` or documented partial state
- [ ] Schema/data consistent or data loss documented
- [ ] Smoke tests pass
- [ ] Stakeholders notified
- [ ] Re-deploy plan scheduled with fix

---

## Dependencies

| Artifact | Relationship |
|----------|----------------|
| [incident-response.md](incident-response.md) | Often triggers rollback |
| [release.md](release.md) | Deploy context |
| `migration/rollback-strategy` prompt | Plan source |
| `phases/NN-name/MIGRATION.md` | Phase migration record |

---

## Compatible AI assistants

**OpenHands**, **Cursor** for scripted rollback. **Claude**, **ChatGPT** for plan verification. **Human owner** executes production DDL.

---

*When rollback is unsafe, halt and escalate — partial rollback may worsen state.*
