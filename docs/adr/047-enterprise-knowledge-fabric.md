# ADR-047: Enterprise Knowledge Fabric (Phase 23)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Enterprise knowledge lives in Slack, GitHub, Jira, etc. Phase 23 adds connector plane with provenance into MemoryService SSOT.

Design: [.ai/phases/23-enterprise-knowledge-fabric/DESIGN.md](../../.ai/phases/23-enterprise-knowledge-fabric/DESIGN.md)

## Decision

Adopt `IKnowledgeConnector` adapters + fabric orchestrator; async ingest; `KNOWLEDGE_FABRIC_ENABLED=false` default.

## Rollback

Disable flag; connector configs dormant.
