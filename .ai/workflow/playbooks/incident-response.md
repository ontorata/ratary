# Playbook: Incident Response

**ID:** `playbooks/incident-response`  
**Purpose:** Structured response from incident detection through mitigation, communication, and handoff.  
**Owner sign-off:** SEV1–2 escalation; comms approval for external messaging.

---

## When to execute

- Production alert, customer report, or monitoring threshold breached
- Suspected data loss, security event, or total service outage
- On-call rotation receives page

**Not for:** planned maintenance (use [release.md](release.md)) or non-production issues.

---

## Severity guide

| Level | Definition | Response |
|-------|------------|----------|
| **SEV1** | Total outage or data breach | Immediate; all-hands |
| **SEV2** | Major degradation; no workaround | < 15 min ack |
| **SEV3** | Partial impact; workaround exists | < 1 hour ack |
| **SEV4** | Minor; no user impact | Next business day |

---

## Procedure

### 1. Acknowledge and assign

| Role | Responsibility |
|------|----------------|
| **Incident commander** | Coordinates; single decision voice |
| **Responder** | Investigates and mitigates |
| **Comms** | Stakeholder updates (owner for external) |

### 2. Triage

Prompt: `operations/incident-triage`

Record:
- Start time (UTC)
- Severity
- Customer impact
- Recent deploys or changes

### 3. Mitigate first

Priority order:
1. Restore service (rollback, feature flag, scale)
2. Stop data corruption or leak
3. Root cause analysis (parallel if safe)

Playbooks:
- Rollback → [rollback.md](rollback.md)
- Hotfix → [hotfix.md](hotfix.md)

### 4. Debug

Prompt: `operations/production-debug`

Gather: logs, metrics, traces, `{BASELINE_VERSION}` deploy info.

### 5. Communicate

| Audience | Cadence (SEV1–2) |
|----------|------------------|
| Internal team | Every 30 min until stable |
| Stakeholders | Every 60 min |
| External users | Owner-approved only |

Template sections: impact, workaround, ETA, next update time.

### 6. Stabilize and verify

Prompt: `release/post-release-verification` (smoke tests)

Confirm metrics returned to baseline.

### 7. Close incident

| Artifact | Action |
|----------|--------|
| Timeline | Start → detect → mitigate → resolve |
| Root cause | Hypothesis or confirmed |
| Follow-ups | Tickets for permanent fix |
| `audits/latest.md` | Incident summary if architectural implications |

### 8. Post-incident review (within 5 business days)

Prompt: `documentation/runbook-authoring` for gaps found.

Optional blameless retrospective — separate from phase retrospective.

---

## Exit criteria

- [ ] Service restored to acceptable SLO
- [ ] Severity downgraded or closed
- [ ] Stakeholders notified of resolution
- [ ] Follow-up tickets created
- [ ] Timeline recorded

---

## Escalation

Prompt: `operations/escalation` when:
- Root cause unknown after 2 hours (SEV1–2)
- Fix requires breaking change or ADR
- Data breach confirmed

---

## Dependencies

| Artifact | Relationship |
|----------|----------------|
| [rollback.md](rollback.md) | Primary mitigation |
| [hotfix.md](hotfix.md) | Code fix path |
| [prompts/operations/incident-triage.md](../prompts/operations/incident-triage.md) | Triage prompt |
| [prompts/operations/production-debug.md](../prompts/operations/production-debug.md) | Debug prompt |

---

## Compatible AI assistants

**Claude**, **ChatGPT** for triage and comms drafts. **Cursor**, **OpenHands** for log analysis with repo access. Human commander for destructive actions.

---

*Do not execute destructive production actions without explicit owner or commander approval.*
