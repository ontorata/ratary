# ADR-047: Enterprise Knowledge Fabric (Phase 23)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Enterprise knowledge lives in Slack, GitHub, Jira, Notion, and other SaaS systems. Operators need a **connector plane** that ingests external content into Memory Cloud SSOT with provenance, deduplication, and audit — without bypassing `MemoryService`.

## Problem

- No unified connector abstraction for external enterprise sources.
- No external-id → memory-id mapping for incremental sync.
- No admin API for triggered ingest jobs.

## Decision

1. `IKnowledgeConnector` — pluggable adapters (Slack, GitHub, GitLab, Jira, Confluence, Drive, SharePoint, Email, Teams, Notion).
2. `IFabricNormalizer` — map external items to memory create/update payloads.
3. `IFabricPolicy` — scope-aware ingest authorization.
4. `IFabricExternalRefStore` — dedup refs + incremental cursors.
5. `KnowledgeFabricOrchestrator` — pull → normalize → policy → MemoryService write.
6. REST `/api/v1/knowledge-fabric/*` admin API.
7. Extend `CapabilityManifestBuilder` → `knowledgeFabric` section.

## Constraints

- Default env unchanged: `KNOWLEDGE_FABRIC_ENABLED=false`.
- All SSOT writes via `MemoryService`.
- Distinct from Phase 14 (node federation) and Phase 09.8 (AI client sync).

## Rollback

`KNOWLEDGE_FABRIC_ENABLED=false` — pre-Phase-23 behavior; connector configs dormant.

## References

- Phase 23 DESIGN, Phase 14 ADR-029 (federation boundary)
