# OpenAPI specifications

| File | Version | Use when |
|------|---------|----------|
| `ratary-v1.openapi.json` | **1.1.0** (SSOT) | SDK codegen, Custom GPT Actions import, client contracts |
| `openapi.snapshot.json` | snapshot of running server | Full surface audit (`npm run snapshot:openapi`) |
| Live `/docs/json` | matches deployed server | Integration testing against your host |

**Canonical hosted API:** `https://ratary.ontorata.com` · OpenAPI at `/docs/json`

Generate language SDKs: `npm run generate:sdks` (requires Java 11+ for some targets)

Server package version (`1.0.0`) and OpenAPI/npm (`1.1.0`) — see [CHANGELOG.md](../../CHANGELOG.md#version-map-10-release).
