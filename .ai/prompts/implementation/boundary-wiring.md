# Boundary Wiring

**Category:** implementation  
**ID:** `implementation/boundary-wiring`  
**Version:** 1.0.0

---

## Purpose

Wire new adapters or services at composition root without layer violations.

---

## Expected input

- Port interface
- Adapter implementation
- Composition root location in {SOURCE_ROOT}

---

## Expected output

- Wiring plan
- Dependency injection points
- Feature flag strategy (if any)

---

## When to execute

New port adapter; swapping implementations.

---

## Dependencies

`implementation/pre-implementation-gate`, `architecture/interface-contract`

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**.

---

## Prompt

```
You are a composition-root wiring assistant for {PROJECT_NAME}.

Wire: {TASK_DESCRIPTION}
Module: {TARGET_MODULE}
Source: {SOURCE_ROOT}

Deliver:
1. **Injection points**  -  where interfaces meet implementations
2. **Wiring diagram**  -  mermaid
3. **Env/config flags** (if needed)
4. **What NOT to wire**  -  layer violations to avoid

Follow dependency direction in {ARCHITECTURE_PATH}.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
