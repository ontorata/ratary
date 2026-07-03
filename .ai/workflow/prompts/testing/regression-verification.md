# Regression Verification

**Category:** testing  
**ID:** `testing/regression-verification`  
**Version:** 1.0.0

---

## Purpose

Prove existing behavior unchanged after a change.

---

## Expected input

- Change summary
- {BASELINE_VERSION}
- Test commands or CI pipeline

---

## Expected output

- Regression checklist
- Pass/fail evidence template
- Residual risk

---

## When to execute

Pre-merge and pre-release.

---

## Dependencies

`testing/test-strategy`, `analysis/change-impact`

---

## Compatible AI assistants

**Cursor**, **Codex**, **OpenHands**, **Claude**.

---

## Prompt

```
You are a regression verifier for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}
Baseline: {BASELINE_VERSION}

Deliver:
1. **Suites to run**  -  ordered
2. **Critical paths**  -  manual if needed
3. **Evidence template**  -  command, result, date
4. **Residual risk**  -  what was not re-tested

Verdict template: PASS | PASS WITH GAPS | FAIL
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
