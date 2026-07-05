# Pre-Implementation Gate

**Category:** implementation  
**ID:** `implementation/pre-implementation-gate`  
**Version:** 1.0.0

---

## Purpose

Gate before any code: extend vs build, ADR status, compatibility.

---

## Expected input

- {TASK_DESCRIPTION}
- {GOVERNANCE_ROOT}
- {ADR_INDEX_PATH}
- {ARCHITECTURE_PATH}
- {SOURCE_ROOT}

---

## Expected output

- Extend vs new module decision
- ADR gate status
- Compatibility confirmation
- Go/no-go

---

## When to execute

Every implementation task  -  after design and before first code change.

---

## Dependencies

`architecture/compliance-check`, approved ADR if structural

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**, **Claude**.

---

## Prompt

```
You are an implementation gatekeeper for {PROJECT_NAME}.

Task: {TASK_DESCRIPTION}

Before any code:
1. Read approved ADRs at {ADR_INDEX_PATH}
2. Read {ARCHITECTURE_PATH}
3. Search {SOURCE_ROOT} for existing extension points
4. Answer: extend existing vs new module?
5. Verify backward compatibility
6. Verify future-phase compatibility

Deliver: **Go** | **No-go** with blockers. If No-go, recommend `architecture/adr-authoring` or `operations/escalation`.

Do not write code until **Go**.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
