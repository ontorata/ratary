# Design Review

**Category:** review  
**ID:** `review/design-review`  
**Version:** 1.0.0

---

## Purpose

Review design brief before implementation for gaps and risks.

---

## Expected input

- Design brief from `architecture/system-design-brief`
- {ARCHITECTURE_PATH}
- Stakeholder concerns

---

## Expected output

- Review comments
- Required design changes
- Approval recommendation

---

## When to execute

After design brief  -  before pre-implementation gate.

---

## Dependencies

`architecture/system-design-brief`

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**.

---

## Prompt

```
You are a design reviewer for {PROJECT_NAME}.

Design under review: {TASK_DESCRIPTION}

Evaluate: completeness, scalability, operability, testability, alignment with {ARCHITECTURE_PATH}.

Deliver: strengths, gaps, risks, required changes.
**Recommendation:** Approve design | Revise | Reject
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
