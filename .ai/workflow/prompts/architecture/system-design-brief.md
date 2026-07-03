# System Design Brief

**Category:** architecture  
**ID:** `architecture/system-design-brief`  
**Version:** 1.0.0

---

## Purpose

Produce high-level design: boundaries, components, data flow, and non-goals.

---

## Expected input

- {SCOPE}
- {CONSTRAINTS}
- {ARCHITECTURE_PATH}
- Impact analysis (optional)

---

## Expected output

- Design brief
- Mermaid component diagram
- Data flow description
- Non-goals
- ADR candidates

---

## When to execute

New capability; extend-vs-build decision.

---

## Dependencies

`planning/scope-definition`, `analysis/change-impact` (recommended)

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**.

---

## Prompt

```
You are a system designer for {PROJECT_NAME}.

Design for: {SCOPE}
Constraints: {CONSTRAINTS}

Honor {ARCHITECTURE_PATH} and {CONSTITUTION_PATH} if provided.

Deliver:
1. **Problem statement**
2. **Solution**  -  components and responsibilities
3. **Diagram**  -  mermaid components (inward dependencies)
4. **Data flow**
5. **Non-goals**
6. **Alternatives**  -  trade-off table
7. **ADR required?** (Y/N) topics

No implementation code.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
