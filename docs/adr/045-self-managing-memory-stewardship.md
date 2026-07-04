# ADR-045: Self-Managing Memory Stewardship (Phase 04.7)

**Status:** Proposed  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Consolidator and embed jobs exist but are manual. Stakeholders require self-managing memory hygiene without planner/agent.

Design: [.ai/phases/04.7-memory-stewardship/DESIGN.md](../../.ai/phases/04.7-memory-stewardship/DESIGN.md)

## Decision

Adopt `IMemoryStewardshipOrchestrator` with fixed-order maintenance tasks (async, dry-run default). `MEMORY_STEWARDSHIP_ENABLED=false` default.

## Rollback

Disable flag; existing CLI scripts unchanged.
