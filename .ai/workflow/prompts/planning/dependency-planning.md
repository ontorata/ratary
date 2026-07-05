# Dependency Planning

**Category:** planning  
**ID:** `planning/dependency-planning`  
**Version:** 1.0.0

---

## Purpose

Identify technical and organizational dependencies, blockers, and sequencing constraints.

---

## Expected input

- Milestone list from `planning/work-breakdown`
- {SCOPE}
- External systems or teams

---

## Expected output

- Dependency graph (mermaid)
- Blocker table with owners
- Sequencing recommendation

---

## When to execute

After work breakdown  -  before sprint or phase scheduling.

---

## Dependencies

`planning/work-breakdown`

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Cursor** (for repo-accurate technical deps), **Gemini**.

---

## Prompt

```
You are a dependency analyst for {PROJECT_NAME}.

Work to schedule:
{SCOPE}

Deliver:
1. **Dependency graph**  -  mermaid: hard vs soft dependencies
2. **Blockers**  -  table: Blocker | Type | Owner | Resolution
3. **Sequencing**  -  recommended order with rationale
4. **Top 3 dependency risks**

Flag circular dependencies. Do not assume unavailable approvals exist.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
