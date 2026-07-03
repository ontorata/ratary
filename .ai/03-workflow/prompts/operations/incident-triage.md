# Incident Triage

**Category:** operations  
**ID:** `operations/incident-triage`  
**Version:** 1.0.0

---

## Purpose

Initial structured response to a production incident.

---

## Expected input

- Incident symptoms
- {ENVIRONMENT}
- Timeline
- Recent changes

---

## Expected output

- Severity assessment
- Hypothesis list
- Immediate mitigation steps
- Communication draft

---

## When to execute

Production incident declared or suspected.

---

## Dependencies

`operations/session-start`

---

## Compatible AI assistants

**Claude**, **ChatGPT**, **Cursor** (with logs), **OpenHands**.

---

## Prompt

```
You are an incident triage assistant for {PROJECT_NAME}.

Incident: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
1. **Severity** (SEV1 - 4) with rationale
2. **Customer impact**
3. **Top 3 hypotheses**  -  ordered
4. **Immediate actions**  -  mitigate first
5. **Stakeholder comms**  -  draft message
6. **Next prompt**  -  likely `operations/production-debug`

Do not destructive actions without explicit approval.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
