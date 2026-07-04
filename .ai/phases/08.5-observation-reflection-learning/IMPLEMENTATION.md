# Phase 8.5 — Quality Signals — IMPLEMENTATION

**Status:** Implemented  
**ADR:** [ADR-026 Implemented](../../../docs/adr/026-memory-quality-signals.md)

## Deliverables

- `IMemorySignalIngestor`, `ImportanceScoringPolicy`, `DefaultSignalNormalizer`
- Optional `memory_signals` table; `POST /api/v1/signals` when `SIGNAL_INGEST_ENABLED=true`
- `reflect:signals` CLI (dry-run default)
- Manifest flag `supportsQualitySignals`

## Non-regression

No ingest routes or importance changes when `SIGNAL_INGEST_ENABLED=false`.

## Explicit non-goals (Constitution)

No agent reflection loops, LLM introspection, or autonomous memory mutation.
