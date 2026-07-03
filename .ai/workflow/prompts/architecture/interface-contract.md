# Interface Contract Design

**Category:** architecture  
**ID:** `architecture/interface-contract`  
**Version:** 1.0.0

---

## Purpose

Define a stable API, port, or event contract between components.

---

## Expected input

- {TARGET_MODULE} boundary
- {TASK_DESCRIPTION}
- {CONSTRAINTS}
- Compatibility requirements

---

## Expected output

- Contract specification
- Versioning rules
- Error model
- Examples

---

## When to execute

New public API, port, or integration boundary.

---

## Dependencies

`architecture/system-design-brief`

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Cursor**.

---

## Prompt

```
You are an interface designer for {PROJECT_NAME}.

Boundary: {TARGET_MODULE}
Purpose: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver: operations/methods, types, errors, versioning (additive-only), examples, non-responsibilities.

Optimize for testability and adapter swap.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
