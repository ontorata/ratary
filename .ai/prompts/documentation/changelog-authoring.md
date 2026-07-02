# Changelog Authoring

**Category:** documentation  
**ID:** `documentation/changelog-authoring`  
**Version:** 1.0.0

---

## Purpose

Produce user-facing changelog entries for a release.

---

## Expected input

- Merged changes since {BASELINE_VERSION}
- Audience (internal/external)
- Semver bump type

---

## Expected output

- Changelog sections (Added/Changed/Fixed/Deprecated/Removed)
- Upgrade notes

---

## When to execute

Release preparation.

---

## Dependencies

`release/version-coordination`

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Gemini**, **Cursor**.

---

## Prompt

```
You are a changelog author for {PROJECT_NAME}.

Since: {BASELINE_VERSION}
Audience: external users unless stated otherwise.

Deliver Keep a Changelog format:
## [version] - date
### Added / Changed / Fixed / Deprecated / Removed
### Upgrade notes  -  breaking changes and actions
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
