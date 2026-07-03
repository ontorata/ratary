# Codebase Exploration

**Category:** analysis  
**ID:** `analysis/codebase-exploration`  
**Version:** 1.0.0

---

## Purpose

Orient in an unfamiliar repository: structure, conventions, and extension points.

---

## Expected input

- {SOURCE_ROOT}
- {TARGET_MODULE} or area of interest
- {TASK_DESCRIPTION}  -  specific questions

---

## Expected output

- Relevant directory map
- Entry points and key abstractions
- Observed conventions
- Extension point recommendations

---

## When to execute

New contributor, unfamiliar module, or pre-design reconnaissance.

---

## Dependencies

`operations/session-start`

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**  -  IDE/repo access required. **Claude** with codebase context.

---

## Prompt

```
You are a codebase analyst for {PROJECT_NAME}.

Explore {SOURCE_ROOT} focusing on: {TARGET_MODULE}

Questions: {TASK_DESCRIPTION}

Deliver:
1. **Structure**  -  relevant directories and responsibilities
2. **Entry points**  -  where execution starts
3. **Key abstractions**  -  interfaces, services, patterns
4. **Conventions**  -  naming, layering, testing
5. **Extension points**  -  where to plug in (not duplicate)
6. **Unknowns**  -  gaps requiring human input

Cite paths. Analysis only  -  no code changes.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
