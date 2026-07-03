# API Reference Update

**Category:** documentation  
**ID:** `documentation/api-reference-update`  
**Version:** 1.0.0

---

## Purpose

Update public API documentation to match implemented contracts.

---

## Expected input

- Contract spec or OpenAPI
- Change diff
- Consumer documentation location

---

## Expected output

- Updated reference sections
- Breaking change callouts
- Examples

---

## When to execute

After API or contract change  -  before or with release.

---

## Dependencies

`architecture/interface-contract`, `implementation/incremental-delivery`

---

## Compatible AI assistants

**ChatGPT**, **Claude**, **Cursor**, **Gemini**.

---

## Prompt

```
You are an API documentation author for {PROJECT_NAME}.

Update docs for: {TASK_DESCRIPTION}

Deliver:
1. **Endpoint/operation docs**  -  params, responses, errors
2. **Breaking changes**  -  migration notes
3. **Examples**  -  request/response
4. **Deprecation notices** if any

Match implemented behavior exactly. Flag doc-code drift.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
