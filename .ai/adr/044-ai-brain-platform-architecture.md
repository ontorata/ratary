# ADR-044: AI-Brain Platform Architecture (Phase 24)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phases 16–20 cover developer tooling, security, cloud, observability, and plugins. Stakeholders require a **unified platform narrative** — protocols, webhooks, marketplace, deployment profiles — without duplicating child phase implementations.

## Problem

- No single umbrella manifest describing platform planes and edition tiers.
- No outbound webhook subscription store for integrators.
- Platform story fragmented across multiple phase folders.

## Decision

1. `AiBrainPlatformManifestBuilder` — umbrella manifest composing child phase env flags into planes.
2. `IWebhookSubscriptionStore` — scope-scoped webhook CRUD.
3. `WebhookDeliveryConsumer` — fan-out domain events to subscribed URLs (Phase 12 bus).
4. REST `/api/v1/platform/*` admin API.
5. Extend `CapabilityManifestBuilder` → `aiBrainPlatform` section.
6. Edition tiers: `core` | `standard` | `enterprise` via `AI_BRAIN_PLATFORM_EDITION`.

## Constraints

- Default env unchanged: `AI_BRAIN_PLATFORM_ENABLED=false`, edition `core`.
- `MemoryService` unchanged.
- Workflow engine remains **external** (constitution).
- Phase 24 **composes** Phases 10.5, 12, 13, 16–20, 23 — does not replace them.

## Rollback

`AI_BRAIN_PLATFORM_ENABLED=false` — pre-Phase-24 behavior; disable child flags individually.

## References

- Phase 24 DESIGN, Phases 16–20, Phase 12 event pipeline
