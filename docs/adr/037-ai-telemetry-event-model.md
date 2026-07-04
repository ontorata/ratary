# ADR-037: AI Telemetry Event Model (Phase 25)

**Status:** Implemented
**Date:** 2026-07-04
**Deciders:** Project owner

---

## Context

Phase 19 exports raw metrics/traces/logs. Phase 25 needs a **semantic** telemetry model so the platform can learn how it is used — retrieval, context, prompts, provider usage, sync — without collecting user content.

Design: [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md) §3, §8.

## Problem

Counters alone cannot answer "was retrieval effective?", "which agents adopted the workspace?", "what did a model invocation cost?". A domain event model is required, but it must not leak memory bodies, prompts, or search text.

## Constraints

- No memory content in telemetry by default; privacy via redaction port.
- Emitted at middleware boundary — never inside `MemoryService`.
- Bounded metric cardinality (no `memoryId` as metric label).
- Standards-based: OpenTelemetry / OTLP; Prometheus/Grafana/Jaeger/Tempo compatible.
- Hot path unaffected; recorder is fire-and-forget; noop when flag OFF.

## Alternatives

### Option A — Reuse Phase 19 metrics only
- Pros: nothing new.
- Cons: no semantics; cannot drive analytics.

### Option B — Semantic 10-event discriminated union + envelope (chosen)
- Pros: rich, typed, additive, OTLP-mappable, privacy-controlled.
- Cons: new types + redactor to maintain.

### Option C — Log raw request/response bodies
- Pros: maximal signal.
- Cons: violates privacy/minimal-collection; rejected.

## Decision

Adopt a discriminated union of 10 telemetry events (`MemoryAccessed`, `MemoryCreated`, `MemoryUpdated`, `SearchExecuted`, `ContextBuilt`, `PromptGenerated`, `AgentConnected`, `SDKConnected`, `ModelInvoked`, `SyncCompleted`) wrapped in a `TelemetryEnvelope` with scope, trace context, bounded attributes, and a `redaction` mode. Ports: `ITelemetryRecorder`, `ITelemetrySink` (otlp/prometheus/jaeger/noop), `ITelemetryRedactor`. Content sampling `TELEMETRY_CONTENT_SAMPLING=false` default.

## Tradeoffs

Accept maintaining an event union + redactor for a privacy-preserving, standards-based signal source that powers analytics and SLOs.

## Migration

Add types + recorder (noop sink) → OTLP adapter → Prometheus/Jaeger adapters → wire redactor. All additive, gated by master flag.

## Rollback

Noop sink / flag OFF → zero export, zero added latency target.

## Impact on future phases

| Phase | Impact |
|-------|--------|
| 19 Observability | Telemetry maps onto existing exporters |
| 20 AI Infrastructure | Events feed marketplace plugin metrics |
| 25 Analytics (ADR-038) | Primary input source |

---

## References

- [.ai/phases/25-global-ai-intelligence/DESIGN.md](../../.ai/phases/25-global-ai-intelligence/DESIGN.md)
- [ADR-034 Observability Platform](../../.ai/adr/034-observability-platform.md)
- [POLICY.md](POLICY.md)
