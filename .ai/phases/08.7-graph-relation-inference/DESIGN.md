# Phase 08.7 — Graph Relation Inference — DESIGN

**ADR gate:** ADR-041 Proposed · **Feeds:** Phase 8 IGraphProvider

## Purpose

Infer graph edges without manual CRUD. Async job-driven; `source_type=inferred`; manual relations never overwritten.

## Ports

`IRelationInferenceOrchestrator`, `IRelationInferenceSource`, `IRelationScoringPolicy`, `IRelationEvidenceStore`

## Non-goals

LLM relation extraction, graph-native DB migration
