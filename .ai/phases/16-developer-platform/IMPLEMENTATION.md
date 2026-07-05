# Phase 16 — Developer Platform — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-031 Implemented](../../adr/031-developer-platform.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 16A | OpenAPI SSOT + snapshot pipeline | ✅ |
| 16B | `@ratary/sdk` TypeScript reference | ✅ |
| 16C | SDK Go, Python, Java, Rust, C#, PHP (thin wrappers + gen script) | ✅ |
| 16D | `@ratary/cli` via SDK only | ✅ |
| 16E | `@ratary/mcp-server` installable MCP via SDK | ✅ |
| 16F | `examples/` + `templates/` | ✅ |
| 16G | Dashboard SPA | ⏸ Deferred |

---

## File map

```
packages/
  openapi/           ratary-v1.openapi.json (curated SSOT), openapi.snapshot.json
  proto/             ontorata/ratary/v1/ratary.proto (copy of server proto)
  sdk/               @ratary/sdk — TypeScript reference client
  cli/               @ratary/cli — command-line interface
  mcp-server/        @ratary/mcp-server — stdio MCP proxy via SDK
  sdk-go/            Go thin wrapper + OpenAPI gen target
  sdk-python/        Python thin wrapper
  sdk-java/          Java thin wrapper
  sdk-rust/          Rust thin wrapper
  sdk-csharp/        C# thin wrapper
  sdk-php/           PHP thin wrapper
examples/node-basic/
templates/cursor/, templates/node-bot/
scripts/snapshot-openapi.ts, scripts/generate-sdks.ts
```

---

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run snapshot:openapi` | Export full spec to `packages/openapi/openapi.snapshot.json` |
| `npm run generate:sdks` | OpenAPI Generator for Go/Python/Java/Rust/C#/PHP |
| `npm run build:packages` | Build SDK + CLI + MCP server |
| `npm run test:packages` | SDK + boundary tests |

---

## Env (CLI / MCP server)

| Env | Purpose |
|-----|---------|
| `AI_BRAIN_BASE_URL` | Server base (default `http://localhost:3000`) |
| `AI_BRAIN_API_KEY` | Bearer / X-API-Key (`aic_...`) |
| `AI_BRAIN_WORKSPACE_ID` | Optional workspace header |
| `AI_BRAIN_FEDERATION` | `true` to enable federation CLI subcommands |

---

## Manifest updates

- `capabilities.supportsDeveloperPlatform: true`
- `transport.sdk`: `@ratary/sdk`, status `published`, 7 languages, CLI + MCP package names

---

## Invariants

- **Zero business logic** in `packages/` — thin HTTP clients only
- **`MemoryService` unchanged**
- CLI/MCP **must not** call `fetch()` directly — use `@ratary/sdk`
- Server REST v1 stable

---

## Rollback

Remove `packages/`, `examples/`, `templates/` — server unaffected.
