# Plugin Authoring Guide (Phase 20)

Minimal guide for registering AI infrastructure plugins behind `AI_INFRASTRUCTURE_ENABLED`.

## Manifest

Each plugin exposes:

```json
{
  "pluginId": "acme.retriever",
  "version": "1.0.0",
  "capabilities": ["retrieval.source"],
  "tenantAllowList": ["*"]
}
```

Register via REST admin (`POST /api/v1/infrastructure/plugins`) when Phase 20 ports are enabled.

## Port implementation

Implement the relevant port under `src/ports/` (e.g. `IRetrievalCandidateSource`) and register in `PluginRegistry` composition root — **no direct imports** from plugin code into `MemoryService`.

## Policy

Use OPA bundle examples in `policies/opa/examples/` to deny blocked plugin ids at enable time.

## Tests

Add unit tests under `tests/infrastructure/` mirroring existing adapter tests (noop + SQL registry).

See [ADR-035](../../adr/035-ai-infrastructure-platform.md).
