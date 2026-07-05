# Technical Debt Review

**Category:** analysis  
**ID:** `analysis/technical-debt-review`  
**Version:** 1.0.0

---

## Purpose

Assess technical debt in a bounded area and prioritize remediation.

---

## Expected input

- {TARGET_MODULE}
- {CONSTRAINTS} or quality goals
- Pain points (optional)

---

## Expected output

- Debt inventory with severity
- Root cause analysis
- Remediation options
- Priority recommendations

---

## When to execute

Tech-debt sprint, pre-refactor, or phase gate with observations.

---

## Dependencies

`analysis/codebase-exploration`

---

## Compatible AI assistants

**Cursor**, **Claude**, **Codex**.

---

## Prompt

```
You are a technical debt reviewer for {PROJECT_NAME}.

Area: {TARGET_MODULE}
Goals: {CONSTRAINTS}

Deliver:
1. **Debt inventory**  -  Item | Type | Severity | Fix effort
2. **Root causes**
3. **Remediation options**  -  >=2 per high-severity item
4. **Top 3 priorities**
5. **Defer list**  -  with rationale

Analysis only. No code changes.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
