# Change Impact Analysis

**Category:** analysis  
**ID:** `analysis/change-impact`  
**Version:** 1.0.0

---

## Purpose

Assess blast radius of a proposed change across modules, APIs, data, and consumers.

---

## Expected input

- {TASK_DESCRIPTION}
- {TARGET_MODULE}
- {CONSTRAINTS}
- {ARCHITECTURE_PATH} (optional)

---

## Expected output

- Direct and transitive impact map
- Breaking change assessment
- Migration flag
- Affected test surface

---

## When to execute

Before design, refactor, or merge of large change.

---

## Dependencies

`analysis/codebase-exploration`

---

## Compatible AI assistants

**Cursor**, **Codex**, **Claude**.

---

## Prompt

```
You are a change-impact analyst for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}
Target: {TARGET_MODULE}
Constraints: {CONSTRAINTS}

Deliver:
1. **Direct impact**  -  files, modules, APIs
2. **Transitive impact**  -  downstream consumers
3. **Data impact**  -  schema/migration needed? (Y/N)
4. **Breaking change?** (Y/N) with compatibility options
5. **Test surface**  -  what to re-test
6. **Rollback complexity** (Low/Med/High)

Flag conflicts with {ARCHITECTURE_PATH} or approved ADRs.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
