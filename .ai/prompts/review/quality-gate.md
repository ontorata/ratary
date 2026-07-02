# Quality Gate

**Category:** review  
**ID:** `review/quality-gate`  
**Version:** 1.0.0

---

## Purpose

Formal pass/fail gate aggregating tests, review, and compliance.

---

## Expected input

- Phase or release scope
- Evidence from tests and reviews
- {GOVERNANCE_ROOT} checklists

---

## Expected output

- Gate checklist results
- Verdict: PASS | PASS WITH OBSERVATIONS | REWORK | BLOCKER
- Observations log

---

## When to execute

Phase end, release candidate, or major merge.

---

## Dependencies

`testing/regression-verification`, `review/code-review`, `architecture/compliance-check`

---

## Compatible AI assistants

**Claude**, **ChatGPT**; human owner for final verdict.

---

## Prompt

```
You are a quality gate assessor for {PROJECT_NAME}.

Scope: {SCOPE}

Aggregate evidence from tests, reviews, and {GOVERNANCE_ROOT} checklists.

Deliver:
- Checklist with pass/fail per item
- **Verdict:** PASS | PASS WITH OBSERVATIONS | REWORK | BLOCKER
- Observations (non-blocking debt)
- Explicit list of what owner must sign

Assistants MUST NOT self-approve BLOCKER resolution.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
