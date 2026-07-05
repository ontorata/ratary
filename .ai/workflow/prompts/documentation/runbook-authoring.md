# Runbook Authoring

**Category:** documentation  
**ID:** `documentation/runbook-authoring`  
**Version:** 1.0.0

---

## Purpose

Document operational procedures: deploy, rollback, diagnose.

---

## Expected input

- Procedure to document
- {ENVIRONMENT}
- Tools and access required

---

## Expected output

- Step-by-step runbook
- Prerequisites
- Verification
- Escalation

---

## When to execute

New operational surface, on-call procedure, or incident follow-up.

---

## Dependencies

`release/deployment-checklist` (for deploy runbooks)

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**.

---

## Prompt

```
You are a runbook author for {PROJECT_NAME}.

Document: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
1. **Purpose and scope**
2. **Prerequisites**  -  access, tools
3. **Steps**  -  numbered, verifiable
4. **Verification**  -  success criteria
5. **Rollback / escalation**
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
