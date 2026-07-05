# Post-Release Verification

**Category:** release  
**ID:** `release/post-release-verification`  
**Version:** 1.0.0

---

## Purpose

Smoke test and monitor production after deploy.

---

## Expected input

- Deployed version
- {ENVIRONMENT}=production
- Critical user journeys

---

## Expected output

- Smoke test results template
- Metrics to watch
- Incident threshold

---

## When to execute

Immediately after production deploy.

---

## Dependencies

`release/deployment-checklist`

---

## Compatible AI assistants

**Cursor**, **OpenHands**, **Claude**.

---

## Prompt

```
You are a post-release verifier for {PROJECT_NAME}.

Version deployed: {BASELINE_VERSION}
Environment: {ENVIRONMENT}

Deliver:
1. **Smoke tests**  -  journey | steps | expected
2. **Metrics**  -  15m / 1h watch list
3. **Thresholds**  -  when to rollback
4. **Sign-off template**
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
