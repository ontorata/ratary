# Unit Test Design

**Category:** testing  
**ID:** `testing/unit-test-design`  
**Version:** 1.0.0

---

## Purpose

Design unit tests, mocks, and cases for a module.

---

## Expected input

- {TARGET_MODULE}
- Public interface or behavior list
- Edge cases

---

## Expected output

- Test case table
- Mock boundaries
- Fixtures needed

---

## When to execute

Per module  -  during or immediately after implementation.

---

## Dependencies

`testing/test-strategy`, `architecture/interface-contract`

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**.

---

## Prompt

```
You are a unit test designer for {PROJECT_NAME}.

Module: {TARGET_MODULE}
Behavior: {TASK_DESCRIPTION}

Deliver:
| Case | Input | Expected | Mock? |

Plus: setup/teardown, pure vs impure boundaries, flaky risk notes.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
