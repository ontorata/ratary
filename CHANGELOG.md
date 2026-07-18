# Changelog

All notable changes to **Ratary Server** (this repository) are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Version map (1.0 release)

| Artifact | Version | Notes |
|----------|---------|-------|
| **Ratary Server** (`package.json`) | `1.0.0` | This repo — REST + stdio MCP |
| **OpenAPI SSOT** (`packages/openapi/ratary-v1.openapi.json`) | `1.1.0` | SDK / Custom GPT Actions |
| **npm clients** | `@ratary/sdk` · `@ratary/cli` **1.1.0** · `@ratary/mcp-server` **1.1.3** | Compatible with Server 1.0.x |
| **Live `/docs/json`** | matches OpenAPI SSOT | After deploy |
| **MCP directory manifest** (`MCP/server.json`) | `1.0.0` | Directory metadata; tools via npm `@1.1.0` |

**Upgrade:** Pin `@ratary/sdk@1.1.0`, `@ratary/cli@1.1.0`, `@ratary/mcp-server@1.1.3` with Server `1.0.x`. No separate migration script required for first GA.

**Canonical production API host:** `https://ratary.ontorata.com` (self-host uses your own URL).

---

## [1.0.0] - 2026-07-06

### Added

- Ratary Server GA — peer SQL backends (Postgres default, D1, Supabase, MariaDB/MySQL, TiDB, Cockroach)
- REST API + Ratary MCP stdio (`npm run setup`)
- Hybrid retrieval, graph retrieval, knowledge fabric (opt-in via env)
- Docker Compose profiles (`postgres`, `enterprise`)
- npm packages `@ratary/sdk`, `@ratary/cli`, `@ratary/mcp-server` at 1.1.0
- Tiered `.env.example` + [docs/CONFIGURATION.md](docs/CONFIGURATION.md) reference

### Documentation

- [docs/GUIDE.md](docs/GUIDE.md) setup and troubleshooting
- [docs/PRODUCTION-ENABLE.md](docs/PRODUCTION-ENABLE.md) for knowledge fabric on Vercel
- [SECURITY.md](SECURITY.md) vulnerability reporting

[1.0.0]: https://github.com/ontorata/ratary/releases/tag/v1.0.0
