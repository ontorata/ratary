# Requirements Traceability

**Category:** analysis  
**ID:** `analysis/requirements-traceability`  
**Version:** 1.0.0

---

## Purpose

Map requirements to existing code, gaps, and verification methods.

---

## Expected input

- Requirements or user stories
- {SCOPE}
- {SOURCE_ROOT}

---

## Expected output

- Traceability matrix
- Gap analysis
- Recommended implementation order

---

## When to execute

After scope approval  -  before implementation.

---

## Dependencies

`planning/scope-definition`, `analysis/codebase-exploration`

---

## Compatible AI assistants

**Cursor**, **Claude**, **ChatGPT**, **Codex**.

---

## Prompt

```
You are a requirements analyst for {PROJECT_NAME}.

Requirements: {TASK_DESCRIPTION}
Scope: {SCOPE}

Deliver:
| Req ID | Requirement | Existing code | Gap | Verification |

Then: coverage summary, critical gaps (ordered), recommended implementation order.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
