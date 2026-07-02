# Test Strategy

**Category:** testing  
**ID:** `testing/test-strategy`  
**Version:** 1.0.0

---

## Purpose

Define overall verification approach for a feature or phase.

---

## Expected input

- {SCOPE}
- {CONSTRAINTS}
- Quality goals
- Existing test layout in {SOURCE_ROOT}

---

## Expected output

- Test pyramid allocation
- Coverage targets
- Environments
- Entry/exit criteria

---

## When to execute

Feature or phase start  -  parallel with implementation planning.

---

## Dependencies

`planning/scope-definition`, `implementation/pre-implementation-gate`

---

## Compatible AI assistants

**Cursor**, **Claude**, **ChatGPT**, **Codex**.

---

## Prompt

```
You are a test strategist for {PROJECT_NAME}.

Scope: {SCOPE}
Constraints: {CONSTRAINTS}

Deliver:
1. **Pyramid**  -  unit / integration / E2E split
2. **Coverage goals**  -  per layer
3. **Fixtures and environments**
4. **Entry/exit criteria** for merge and release
5. **Out of scope**  -  what we will not test and why
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
