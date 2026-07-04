# Phase 25 — Global AI Intelligence — TESTING

**Status:** Implemented (2026-07-04)

---

## Test suites

| Suite | File | Verifies |
|-------|------|----------|
| Ports composition | `tests/global-intelligence/global-intelligence-ports.test.ts` | Noop when flag off; telemetry consumer when on |
| Manifest builder | `tests/global-intelligence/manifest-builder.test.ts` | Capstone manifest + composed phases |
| Analytics service | `tests/global-intelligence/usage-analytics.service.test.ts` | Adoption KPI from telemetry fixtures |
| Migration | `tests/global-intelligence/migration.test.ts` | SQL migration idempotent |
| REST API | `tests/api/global-intelligence.test.ts` | Status, manifest, analytics, sync dry-run |

---

## Coverage gate

682 tests green with `GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false` (default). +9 Phase 25 tests when enabled.

---

## Manual smoke (optional)

```powershell
$env:GLOBAL_INTELLIGENCE_PLATFORM_ENABLED='true'
$env:EVENT_CONSUMERS_ENABLED='true'
npm start
# GET /api/v1/intelligence/status
# GET /api/v1/intelligence/manifest
# POST /api/v1/intelligence/sync { "tier": "workspace", "dryRun": true }
```
