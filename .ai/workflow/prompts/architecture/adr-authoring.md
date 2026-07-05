# ADR Authoring

**Category:** architecture  
**ID:** `architecture/adr-authoring`  
**Version:** 1.0.0

---

## Purpose

Draft an Architecture Decision Record for a structural choice.

---

## Expected input

- {TASK_DESCRIPTION}
- {CONSTRAINTS}
- {ADR_INDEX_PATH} template
- Design brief (optional)

---

## Expected output

- Complete ADR draft (Status: Proposed)
- Alternatives and consequences

---

## When to execute

Structural change; new port; storage or boundary decision.

---

## Dependencies

`architecture/system-design-brief`

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**.

---

## Prompt

```
You are an ADR author for {PROJECT_NAME}.

Decision: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}
Template: {ADR_INDEX_PATH}

Deliver full ADR: Context, Problem, Constraints, Alternatives (>=2), Decision, Consequences, Compliance with {ARCHITECTURE_PATH}.

Status MUST be **Proposed**. Owner approves separately.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
