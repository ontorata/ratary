# ADR-040: Memory Evolution & Version Control (Phase 09.7)

**Status:** Implemented  
**Date:** 2026-07-04  
**Approved:** 2026-07-04  
**Implemented:** 2026-07-04 — side-store versioning, diff, REST history  
**Deciders:** Project owner  

---

## Context

Memories update in place today with no version history. Phase 09.7 adds immutable version chain, diff, lineage, branch/merge — **domain versioning**, not REST v2.

Design: [.ai/phases/09.7-memory-evolution/DESIGN.md](../../.ai/phases/09.7-memory-evolution/DESIGN.md)

## Decision

Adopt side-store version model (`memory_versions`, heads, merge parents) with Current head driving default CRUD. `MEMORY_EVOLUTION_ENABLED=false` default.

## Rollback

Disable flag; in-place memory path only.

## Implementation (2026-07-04)

- `src/evolution/` — coordinator, diff, merge, confidence
- SQL stores for versions + heads
- MemoryService hooks on create/update
- REST `GET /memory/:id/versions` and diff endpoint
- CLI `evolution:history`

## References

- Phase 04.7 duplicate rollup (distinct concern)
- Phase 09.8 sync conflict resolution
