# Phase 16 — IMPLEMENTATION_PLAN

| # | Commit | Scope |
|---|--------|-------|
| 1 | `docs(adr): approve ADR-031` | ADR status |
| 2 | `chore(packages): openapi snapshot + gen pipeline` | CI |
| 3 | `feat(sdk): @ratary/sdk TypeScript reference` | packages/sdk-ts |
| 4 | `feat(sdk): generate Go Python Java Rust C# PHP` | packages/* |
| 5 | `feat(cli): @ratary/cli via SDK` | packages/cli |
| 6 | `feat(mcp): installable remote MCP server` | packages/mcp-server |
| 7 | `feat(examples): starter templates` | templates/, examples/ |
| 8 | `feat(dashboard): optional SPA via SDK` | apps/dashboard |
| 9 | `docs(phase): gate evidence` | TESTING, COMPLETION |

One concern per commit. Server `src/` changes **only** if OpenAPI registration additive.
