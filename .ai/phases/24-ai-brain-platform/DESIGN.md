# Phase 24 — Ratary Platform — DESIGN

**Phase status:** ✅ Closed — gate PASS (2026-07-04  )  
**ADR:** [ADR-044 Implemented](../../adr/044-ai-brain-platform-architecture.md)

---

## Purpose

Umbrella platform blueprint composing developer, protocol, event, extension, deployment, knowledge, and webhook planes from Phases 10.5–23. Outbound webhooks via `IWebhookSubscriptionStore` + `WebhookDeliveryConsumer`.

## Planes

| Plane | Child phases | Edition |
|-------|--------------|---------|
| Developer | 16 SDK/CLI/MCP | core+ |
| Protocol | 10.5, 13 SSE/WS/gRPC/remote MCP | standard+ |
| Events | 12 event consumers | standard+ |
| Extension | 20 plugin marketplace | enterprise |
| Deployment | 18 cloud control plane | enterprise |
| Knowledge | 23 knowledge fabric | enterprise |
| Webhooks | 24 outbound HTTP | enterprise |

## Architecture

```
Child phase modules (16, 12, 13, 18, 20, 23 — unchanged)
       │
       ▼
AiBrainPlatformManifestBuilder (umbrella manifest)
       │
       ├─► IWebhookSubscriptionStore
       └─► WebhookDeliveryConsumer → IEventBus (Phase 12)

REST /api/v1/platform/*  (RATARY_PLATFORM_ENABLED)
```

## Ports

- `IWebhookSubscriptionStore` — CRUD webhook subscriptions per scope
- `IWebhookDispatcher` — HTTP POST delivery with HMAC signature
- `WebhookDeliveryConsumer` — `IEventConsumer` fan-out to subscriptions

## Non-goals

- In-repo workflow engine (external)
- Agent runtime / model training
- Replacing child phase designs

## Distinct from

Phase 24 **composes** Phases 16–20 — it does not reimplement them.
