# ADR-022: Search & Graph Production Platform (Phase 21)

**Status:** Implemented  
**Date:** 2026-07-04  

See authoritative copy: [.ai/adr/022-search-graph-production-platform.md](../../.ai/adr/022-search-graph-production-platform.md)

## Summary

Operational platform for Meilisearch and Neo4j production sync — orchestrated jobs, watermarks, admin REST API. Gated by `SEARCH_GRAPH_PLATFORM_ENABLED=false` (default). `MemoryService` unchanged.
