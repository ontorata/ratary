# Phase 16 — MIGRATION_PLAN

## Compatibility

- REST v1 unchanged — SDK tracks server semver via `capabilities.protocolVersion`.
- Existing MCP stdio server (`npm run mcp`) **unchanged** — installable MCP is **additional** package.

## Rollout

1. Internal alpha: TypeScript SDK only
2. Beta: CLI + remote MCP
3. GA: all language SDKs + templates

## Rollback

Stop publishing packages; no server migration required.
