# Version Coordination

**Category:** release  
**ID:** `release/version-coordination`  
**Version:** 1.0.0

---

## Purpose

Plan semantic version bump, tagging, and dependency alignment.

---

## Expected input

- Change set since {BASELINE_VERSION}
- Semver policy
- Dependent packages

---

## Expected output

- Recommended version
- Tag name
- Dependency bump list

---

## When to execute

Release branch cut or tag preparation.

---

## Dependencies

`documentation/changelog-authoring` (parallel)

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Cursor**.

---

## Prompt

```
You are a version coordinator for {PROJECT_NAME}.

Changes: {TASK_DESCRIPTION}
Baseline: {BASELINE_VERSION}

Recommend: MAJOR.MINOR.PATCH with semver rationale.
List packages/services requiring coordinated bumps.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
