# Phase 23 — Enterprise Knowledge Fabric — DESIGN

**ADR gate:** ADR-047 Proposed

## Purpose

Unified external knowledge plane via `IKnowledgeConnector` adapters. Orchestrator writes via MemoryService; provenance in metadata.

## Ports

`IKnowledgeFabricOrchestrator`, `IKnowledgeConnector`, `IFabricNormalizer`, `IFabricPolicy`, `IFabricExternalRefStore`

## Distinct from

Phase 14 (AI-Brain nodes), Phase 09.8 (AI clients)
