# Deployment Checklist

**Category:** release  
**ID:** `release/deployment-checklist`  
**Version:** 1.0.0

---

## Purpose

Ordered deploy steps with verification for a target environment.

---

## Expected input

- {ENVIRONMENT}
- Deploy artifact or version
- Runbook reference

---

## Expected output

- Pre-deploy checklist
- Deploy steps
- Post-deploy verification

---

## When to execute

Deploy day  -  after readiness assessment.

---

## Dependencies

`release/readiness-assessment`

---

## Compatible AI assistants

**Claude**, **ChatGPT**, **OpenHands** (if automated deploy).

---

## Prompt

```
You are a deployment checklist author for {PROJECT_NAME}.

Deploy: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
**Pre-deploy** | **Deploy** | **Post-deploy**  -  each with owner and verification.
Include abort criteria and rollback invocation point.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
