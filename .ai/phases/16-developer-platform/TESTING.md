# Phase 16 — Developer Platform — TESTING

**Status:** Implemented (2026-07-04)

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| SDK transport | `packages/sdk/tests/client.test.ts` | auth headers, errors, /api/v1 prefix |
| CLI | `tests/packages/cli.test.ts` | commands delegate to SDK |
| No-logic lint | `tests/packages/developer-platform.test.ts` | no MemoryService in packages/ |
| OpenAPI SSOT | `tests/packages/developer-platform.test.ts` | spec paths present |
| Server regression | full `npm test` | MemoryService unchanged |

---

## Manual smoke

```bash
npm run dev

# Build packages
npm run build:packages

# CLI
AI_BRAIN_API_KEY=aic_... npx ai-brain capabilities
AI_BRAIN_API_KEY=aic_... npx ai-brain memory search handoff

# MCP server (stdio)
AI_BRAIN_API_KEY=aic_... npx @ai-brain/mcp-server

# Example
AI_BRAIN_API_KEY=aic_... node examples/node-basic/index.mjs
```

---

## Quality gate

582 tests green at default env (includes 8 package tests).
