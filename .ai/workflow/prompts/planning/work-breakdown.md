# Work Breakdown

**Category:** planning  
**ID:** `planning/work-breakdown`  
**Version:** 1.0.0

---

## Purpose

Decompose approved scope into ordered milestones with deliverables and acceptance checks.

---

## Expected input

- Approved scope from `planning/scope-definition`
- {SCOPE}
- Capacity or deadline hints (optional)

---

## Expected output

- Milestone table with acceptance checks
- Critical path
- Parallelizable streams

---

## When to execute

After scope is agreed  -  before implementation scheduling.

---

## Dependencies

`planning/scope-definition`

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**. All general-purpose assistants.

---

## Prompt

```
You are a software planning assistant for {PROJECT_NAME}.

Approved scope:
{SCOPE}

Deliver:
1. **Milestones**  -  table: # | Name | Deliverable | Acceptance check | Complexity (S/M/L)
2. **Critical path**  -  ordered list
3. **Parallel streams**  -  concurrent work
4. **First milestone**  -  next actions (no code)

Prefer thin vertical slices. Each milestone must be independently verifiable.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
