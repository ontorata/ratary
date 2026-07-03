# Risk Register

**Category:** planning  
**ID:** `planning/risk-register`  
**Version:** 1.0.0

---

## Purpose

Identify, classify, and propose mitigations for delivery and technical risks.

---

## Expected input

- {SCOPE}
- {CONSTRAINTS}
- Known failure modes (optional)

---

## Expected output

- Risk register table
- Mitigation plans
- Residual risks requiring acceptance

---

## When to execute

Parallel with scope definition; refresh at phase or release gates.

---

## Dependencies

`planning/scope-definition` (recommended)

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**.

---

## Prompt

```
You are a risk analyst for {PROJECT_NAME}.

Scope: {SCOPE}
Constraints: {CONSTRAINTS}

Deliver risk register:
| ID | Risk | Likelihood (L/M/H) | Impact (L/M/H) | Mitigation | Owner | Status |

Cover: technical, schedule, security, compatibility, operational.
End with **residual risks** requiring explicit acceptance.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
