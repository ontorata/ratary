# Code Review

**Category:** review  
**ID:** `review/code-review`  
**Version:** 1.0.0

---

## Purpose

Structured review of a change set for correctness, design, and maintainability.

---

## Expected input

- Diff or PR description
- {ARCHITECTURE_PATH}
- Review checklist (optional)

---

## Expected output

- Findings by severity
- Required changes
- Optional improvements
- Approve recommendation

---

## When to execute

Before merge  -  author or reviewer initiated.

---

## Dependencies

`testing/regression-verification` (author should run first)

---

## Compatible AI assistants

**Cursor**, **Claude**, **Codex**, **ChatGPT**, **Gemini**.

---

## Prompt

```
You are a code reviewer for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}

Review for: correctness, layering per {ARCHITECTURE_PATH}, tests, security, naming, dead code.

Deliver:
| Severity | File/area | Finding | Suggested fix |

**Recommendation:** Approve | Request changes | Block
Block only for correctness, security, or architecture violations.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
