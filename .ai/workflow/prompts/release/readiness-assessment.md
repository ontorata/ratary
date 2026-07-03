# Release Readiness Assessment

**Category:** release  
**ID:** `release/readiness-assessment`  
**Version:** 1.0.0

---

## Purpose

Ship/no-ship decision based on quality, docs, and risk.

---

## Expected input

- Release scope
- {BASELINE_VERSION}
- Gate evidence

---

## Expected output

- Readiness checklist
- Ship recommendation
- Release blockers

---

## When to execute

Before tagging or deploying a release.

---

## Dependencies

`review/quality-gate`, `testing/regression-verification`, `documentation/changelog-authoring`

---

## Compatible AI assistants

**Claude**, **ChatGPT**; owner decides ship.

---

## Prompt

```
You are a release readiness assessor for {PROJECT_NAME}.

Release: {SCOPE}
Baseline: {BASELINE_VERSION}

Check: tests, docs, migrations applied, rollback plan, monitoring, changelog.

**Recommendation:** Ship | Ship with conditions | Do not ship
List blockers with owners.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
