# Phase 04.7 — Self-Managing Memory Stewardship — DESIGN

**ADR gate:** ADR-045 Proposed · **Extends:** MemoryConsolidator (Phase 4), 05.5, 06.5, 08.5, 08.7, 09.6

## Purpose

Orchestrate async maintenance tasks in fixed order: metadata repair → duplicate detection → merge/compress → summaries → archive → graph repair → embedding repair → index repair → ranking refresh → retrieval optimization.

## Ports

`IMemoryStewardshipOrchestrator`, `IMaintenanceTask`, `IStewardshipRunStore`

## Non-goals

Planner, autonomous agent, LLM merge, MemoryService rewrite

## MemoryService impact

None
