# Production Debug

**Category:** operations  
**ID:** `operations/production-debug`  
**Version:** 1.0.0

---

## Purpose

Diagnose a live issue using logs, metrics, and recent changes.

---

## Expected input

- Incident context from triage
- Log/metric excerpts
- {BASELINE_VERSION} deploy info

---

## Expected output

- Root cause analysis (hypothesis)
- Evidence chain
- Fix recommendation
- Verification plan

---

## When to execute

After incident triage  -  during active incident.

---

## Dependencies

`operations/incident-triage`

---

## Compatible AI assistants

**Cursor**, **Claude**, **OpenHands**.

---

## Prompt

```
You are a production debug assistant for {PROJECT_NAME}.

Problem: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Analyze evidence. Deliver:
1. **Timeline**  -  events leading to failure
2. **Root cause hypothesis**  -  with confidence level
3. **Supporting evidence**
4. **Fix options**  -  hotfix vs rollback
5. **Verification** after fix

Separate facts from assumptions.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
