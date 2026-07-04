# ADR-044: AI-Brain Platform Architecture (Phase 24)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phases 16–20 cover developer, security, cloud, observability, plugins. Stakeholders require unified platform narrative: protocols, webhooks, marketplace, deployment profiles.

Design: [.ai/phases/24-ai-brain-platform/DESIGN.md](../../.ai/phases/24-ai-brain-platform/DESIGN.md)

## Decision

Adopt platform umbrella document composing child phases; outbound webhooks as additive port; workflow engine remains external. `AI_BRAIN_PLATFORM_EDITION=core` default.

## Rollback

Narrative-only ADR; disable platform feature flags individually.
