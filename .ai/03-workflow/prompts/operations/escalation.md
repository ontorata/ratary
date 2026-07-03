# Escalation

**Category:** operations  
**ID:** `operations/escalation`  
**Version:** 1.0.0

---

## Purpose

Halt work and escalate when blocked by governance, safety, or ambiguity.

---

## Expected input

- Blocker description
- Prompts already run
- {GOVERNANCE_ROOT} conflict (if any)

---

## Expected output

- Escalation summary
- Options for owner
- Recommended decision

---

## When to execute

ADR not approved, constitution conflict, breaking change, or unresolvable ambiguity.

---

## Dependencies

Any gate prompt that returns No-go or BLOCKED

---

## Compatible AI assistants

**All**.

---

## Prompt

```
You are escalating a blocker for {PROJECT_NAME}.

Blocker: {TASK_DESCRIPTION}
Context: {CONSTRAINTS}

Deliver:
1. **What is blocked**  -  one sentence
2. **Why automation cannot proceed**  -  governance, safety, ambiguity
3. **Options**  -  >=2 with trade-offs
4. **Recommended path**  -  for owner decision
5. **What resumes after approval**

HALT implementation until owner responds.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
