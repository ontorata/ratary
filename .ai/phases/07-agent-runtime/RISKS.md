# Phase 7 — Agent Runtime — RISKS

**Document:** RISKS  
**Phase status:** Closed (gate PASS 2026-07-03)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Design phase — initial risk register |
| **Updated by** | Assistant during phase; owner validates at gate |
| **Read-only when** | Gate PASS — realized risks locked; deferred risks noted |
| **Roadmap relation** | Phase slice of roadmap cross-phase and phase-specific risks |

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Agent logic inside foundation | Low | Critical | Constitution boundary; no agent code in src/ | Mitigated — gate PASS |
| MCP contract drift breaking agents | Medium | High | Additive changes only; version contracts | Mitigated — stable at gate |
| Scope creep into agent orchestration | Medium | High | Clear scope: protocol boundary only | Mitigated — doc-only phase |
| Phase 8+ blocked by Phase 7 delay | Low | Medium | Phase 7 is documentation; minimal risk | Not realized |
| Agent runtime ADR needed | Low | Medium | External ADR; no internal ADR required | Accepted — boundary in DESIGN |
| Capability discovery gap | Medium | Medium | Deferred to Phase 7.5 | Resolved — ADR-025 |

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
