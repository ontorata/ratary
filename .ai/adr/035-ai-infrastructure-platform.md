# ADR-035: AI Infrastructure Platform — Marketplace, Plugins, Provider Registry (Phase 20)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phases 16–19 deliver developer UX, security, cloud ops, and observability. Phase 20 **unifies** AI Brain as **AI Memory Infrastructure**: plugin marketplace, provider registry for storage/embedding/vector/graph/LLM, federation capstone, single capability surface for all protocols (REST/gRPC/MCP/WS/SSE/SDK/CLI/Dashboard).

## Problem

- Ports exist (ADR-008) but no **discoverable marketplace** or plugin lifecycle.
- Provider swap requires env knowledge — not enterprise self-service.
- "Memory API" positioning vs "Infrastructure platform" gap.

## Constraints

- Plugins = **adapter implementations + manifest** — no plugin runs business logic in-process that bypasses services.
- LLM providers = **inference ports only** (embedding/completion boundary) — not agent runtime.
- Federation + security policies apply to marketplace installs.

## Decision

1. `IPluginRegistry` — register/enable/disable provider plugins (manifest signed).
2. `IProviderMarketplace` — curated catalog metadata (not app store payments in v1).
3. Extend `CapabilityManifestBuilder` → infrastructure platform manifest.
4. Plugin types: Storage, Embedding, Vector, Graph, LLM inference — each implements existing port interfaces.
5. Control plane (Phase 18) governs tenant plugin allow-list.

Capstone documentation + registry — minimal new runtime surface.

## Rollback

`PLUGIN_MARKETPLACE_ENABLED=false` — env-selected adapters only (Phase 10 behavior).

## References

- ADR-008, Phases 13–19, Phase 20 DESIGN
