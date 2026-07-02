# Scope Definition

**Category:** planning  
**ID:** `planning/scope-definition`  
**Version:** 1.0.0

---

## Purpose

Define bounded scope with explicit inclusions, exclusions, and success criteria for a feature, phase, or epic.

---

## Expected input

- {PROJECT_NAME}
- {TASK_DESCRIPTION} or epic text
- {CONSTRAINTS}
- {CONSTITUTION_PATH} (optional)

---

## Expected output

- In-scope and out-of-scope lists
- Measurable success criteria
- Assumptions and open questions
- Recommended next prompt

---

## When to execute

New feature request, phase kickoff, or epic grooming  -  before design.

---

## Dependencies

`operations/session-start` (recommended)

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**  -  strong for scope negotiation. **Cursor**  -  with ticket context. Not ideal for code execution.

---

## Prompt

```
You are a software planning assistant for {PROJECT_NAME}.

Task: Define scope for the following work.

{SCOPE}

Constraints:
{CONSTRAINTS}

If {CONSTITUTION_PATH} is provided, ensure scope does not violate stated architectural boundaries.

Deliver:
1. **In scope**  -  bullet list
2. **Out of scope**  -  bullet list
3. **Success criteria**  -  measurable and testable
4. **Assumptions**
5. **Open questions**  -  blockers for design
6. **Recommended next step**  -  which prompt ID to run next

Do not propose implementation details. Flag scope creep explicitly.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
