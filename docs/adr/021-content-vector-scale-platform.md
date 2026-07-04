# ADR-021: Content & Vector Scale Platform (Phase 22)

**Status:** Implemented  
**Date:** 2026-07-04  

See authoritative copy: [.ai/adr/021-content-vector-scale-platform.md](../../.ai/adr/021-content-vector-scale-platform.md)

## Summary

Operational platform for R2/S3 content offload, pgvector sync, and embedding batch jobs — orchestrated jobs, watermarks, admin REST API. Gated by `CONTENT_SCALE_PLATFORM_ENABLED=false` (default). `MemoryService` unchanged.
