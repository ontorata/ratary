# Architecture Compliance Check

**Category:** architecture  
**ID:** `architecture/compliance-check`  
**Version:** 1.0.0

---

## Purpose

Verify design complies with architecture law and approved decisions.

---

## Expected input

- Design brief or change summary
- {ARCHITECTURE_PATH}
- {ADR_INDEX_PATH}

---

## Expected output

- Compliance table
- Violations
- Verdict: PROCEED | PROCEED WITH CHANGES | BLOCKED

---

## When to execute

After design brief  -  before implementation gate.

---

## Dependencies

`architecture/system-design-brief`, `{ARCHITECTURE_PATH}`

---

## Compatible AI assistants

**Claude**, **ChatGPT**, **Cursor**.

---

## Prompt

```
You are an architecture compliance reviewer for {PROJECT_NAME}.

Under review: {TASK_DESCRIPTION}

Evaluate against {ARCHITECTURE_PATH} and approved ADRs at {ADR_INDEX_PATH}.

| Rule | Compliant (Y/N) | Evidence | Fix if N |

**Verdict:** PROCEED | PROCEED WITH CHANGES | BLOCKED
List owner-level blockers.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
