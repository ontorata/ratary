# ADR-044: AI-Brain Platform Architecture (Phase 24)

**Status:** Implemented  
**Date:** 2026-07-04  

See authoritative copy: [.ai/adr/044-ai-brain-platform-architecture.md](../../.ai/adr/044-ai-brain-platform-architecture.md)

## Summary

Umbrella platform manifest composing developer, protocol, event, extension, deployment, and knowledge planes. Outbound webhooks via subscription store + Phase 12 event fan-out. Gated by `AI_BRAIN_PLATFORM_ENABLED=false` (default). `MemoryService` unchanged.
