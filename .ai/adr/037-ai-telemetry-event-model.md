# ADR-037: AI Telemetry Event Model (Phase 25)

**Status:** Implemented  
**Date:** 2026-07-04  

---

## Decision

Ten semantic telemetry event types (`MemoryAccessed`, `MemoryCreated`, `SearchExecuted`, `ContextBuilt`, `ModelInvoked`, `SyncCompleted`, …) with privacy-first envelope, `DefaultTelemetryRedactor`, and pluggable `ITelemetrySink` (noop + Prometheus). Emitted at middleware/event-consumer boundary — not inside `MemoryService`.

Implementation: `src/intelligence/telemetry/`.
