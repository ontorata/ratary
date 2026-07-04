# Phase 25 — Global AI Intelligence — IMPLEMENTATION

**Status:** Implemented (2026-07-04)  
**ADR:** [ADR-036 Implemented](../../adr/036-global-ai-intelligence-platform.md) · [ADR-037](../../adr/037-ai-telemetry-event-model.md) · [ADR-038](../../adr/038-usage-analytics-engine.md) · [ADR-043](../../adr/043-cloud-federation-sync-topology.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 25A | 10-event telemetry model + `TelemetryRecorder` + redactor + sinks | ✅ |
| 25B | `UsageAnalyticsService` read-only KPI derivations | ✅ |
| 25C | `SqlOfflineJournal` durable offline queue | ✅ |
| 25D | `GlobalSyncOrchestrator` over Phase 14 exchange (5 tiers) | ✅ |
| 25E | `IntelligenceTelemetryConsumer` (Phase 12 domain events) | ✅ |
| 25F | REST `/intelligence/*` admin + analytics API | ✅ |
| 25G | Capabilities `globalIntelligence` section | ✅ |

---

## File map

```
src/intelligence/
  telemetry/       types, ports, recorder, adapters (redactor, sinks)
  analytics/       IUsageAnalyticsService + UsageAnalyticsService
  sync/            GlobalSyncOrchestrator, offline journal, sync types
  builders/        GlobalIntelligenceManifestBuilder
  consumers/       IntelligenceTelemetryConsumer
src/infrastructure/intelligence/
  sql-intelligence-store.ts
src/composition/create-global-intelligence-ports.ts
src/controllers/global-intelligence.controller.ts
src/routes/v1/global-intelligence.routes.ts
tests/global-intelligence/
tests/api/global-intelligence.test.ts
tests/global-intelligence/migration.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `GLOBAL_INTELLIGENCE_PLATFORM_ENABLED` | `false` | Master gate for telemetry, analytics, sync |
| `TELEMETRY_CONTENT_SAMPLING` | `false` | Opt-in content sampling (off by default) |

Sync orchestrator delegates to Phase 14 when `FEDERATION_ENABLED=true`. Telemetry consumer requires `EVENT_CONSUMERS_ENABLED=true`.

---

## REST endpoints (when enabled)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/intelligence/status` | Platform flags |
| GET | `/api/v1/intelligence/manifest` | Capstone manifest |
| GET | `/api/v1/intelligence/analytics/adoption` | Adoption KPI |
| GET | `/api/v1/intelligence/analytics/workspace-health` | Health score |
| GET | `/api/v1/intelligence/analytics/cost` | Cost estimate |
| GET | `/api/v1/intelligence/analytics/context-effectiveness` | Context KPI |
| GET | `/api/v1/intelligence/sync/status` | Per-tier sync cursors |
| POST | `/api/v1/intelligence/sync` | Run tier sync (dry-run supported) |

---

## Invariants

- `MemoryService` unchanged
- Analytics read-only — never writes `memories`
- Composes Phase 14 federation exchange; no duplicated federation logic
- No user content in telemetry payloads by default
