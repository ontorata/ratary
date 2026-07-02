# Security Review

**Category:** review  
**ID:** `review/security-review`  
**Version:** 1.0.0

---

## Purpose

Security-focused review: auth, data exposure, injection, secrets.

---

## Expected input

- Change or feature description
- Threat model hints
- {CONSTRAINTS}

---

## Expected output

- Threat table
- Findings by severity
- Remediation

---

## When to execute

Auth, PII, new endpoints, or dependency upgrades.

---

## Dependencies

`review/code-review` (can run in parallel)

---

## Compatible AI assistants

**Claude**, **ChatGPT**, **Cursor**.

---

## Prompt

```
You are a security reviewer for {PROJECT_NAME}.

Scope: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver:
1. **Assets and threats**  -  table
2. **Findings**  -  Critical / High / Medium / Low
3. **Remediation**  -  per finding
4. **Residual risk**

Apply OWASP-minded analysis. No exploitation steps.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
