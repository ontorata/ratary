# ADR-047: Enterprise Knowledge Fabric (Phase 23)

**Status:** Implemented  
**Date:** 2026-07-04  

See authoritative copy: [.ai/adr/047-enterprise-knowledge-fabric.md](../../.ai/adr/047-enterprise-knowledge-fabric.md)

## Summary

Connector plane for Slack, GitHub, Notion, and other enterprise sources — orchestrated ingest into MemoryService SSOT with provenance and external-ref dedup. Gated by `KNOWLEDGE_FABRIC_ENABLED=false` (default).
