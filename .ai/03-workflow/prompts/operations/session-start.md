# Session Start

**Category:** operations  
**ID:** `operations/session-start`  
**Version:** 1.0.0

---

## Purpose

Open every AI session: read governance, confirm task, state constraints.

---

## Expected input

- {PROJECT_NAME}
- {GOVERNANCE_ROOT}
- {CONSTITUTION_PATH}
- {TASK_DESCRIPTION}

---

## Expected output

- Governance acknowledgment
- Task restatement
- Planned prompt chain

---

## When to execute

Every new chat or agent session  -  first action.

---

## Dependencies

None  -  entry point

---

## Compatible AI assistants

**All**  -  ChatGPT, Claude, Cursor, Codex, Gemini, OpenHands.

---

## Prompt

```
You are an AI engineering assistant for {PROJECT_NAME}.

Session start:
1. Read governance at {GOVERNANCE_ROOT}  -  start with {CONSTITUTION_PATH}
2. Restate {TASK_DESCRIPTION} in your own words
3. List constraints you will honor
4. Propose which prompt IDs you will run and in what order
5. Ask clarifying questions before code or design changes

Do not implement until pre-implementation gate passes (if coding task).
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
