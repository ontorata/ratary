# Phase 9 — Multi-AI — RISKS

**Phase status:** Active

---

## Risk register

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R9-01 | Scope refactor touches many repository queries | Medium | ADR-007 phased commits; workspace filter helper; E2E isolation tests |
| R9-02 | MCP contract break | High | Additive env only; no tool signature changes |
| R9-03 | Backfill misses orphan memories | Medium | Idempotent backfill script; verify counts per owner |
| R9-04 | Sync conflicts silently lost | Low | MVP audit `sync.conflict`; document last-write-wins |
| R9-05 | Default workspace slug collision | Low | Unique `(owner_id, slug)` constraint |
| R9-06 | Graph/embedding legs ignore workspace | Medium | Phase 9 step: pass workspace filter when column live (ADR-006 note) |

---

*Extend during implementation.*
