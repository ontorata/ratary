# Phase 8.8 — Inspection Pattern Ledger — RISKS

**Phase status:** 🔲 Design  
**Gate:** PENDING  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| False pattern from noisy signals | Medium | Medium | Only `resolved: true` major+; evidence count threshold | Identified |
| Ledger replaces constitutional inspect | Low | Critical | Design: patterns inform only; blockers unchanged | Mitigated (design) |
| Cross-org Charter leak | Low | Critical | Federation policy fail closed; separate flag | Identified |
| Contradictory patterns confuse agents | Medium | Medium | Graph `contradicts` + stewardship surfacing | Identified |
| Miner duplicates handoff memories | Medium | Low | Dedupe by trigger hash; tag `inspection-pattern` | Identified |
| Scope creep into PR review SaaS | Medium | Medium | Non-goals + MCP/Forge consumers only | Mitigated (design) |
| Decay archives still-valid patterns | Medium | Low | Protected pin; owner restore from archived | Identified |

---

*Update status at gate PASS.*
