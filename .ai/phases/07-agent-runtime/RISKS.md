# Phase 7 — Agent Runtime — RISKS

**Document:** RISKS  
**Phase status:** Reserved  
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
| Agent logic inside foundation | Low | Critical | Constitution boundary; no agent code in src/ | Identified |
| MCP contract drift breaking agents | Medium | High | Additive changes only; version contracts | Identified |
| Scope creep into agent orchestration | Medium | High | Clear scope: protocol boundary only | Identified |
| Phase 8+ blocked by Phase 7 delay | Low | Medium | Phase 7 is documentation; minimal risk | Identified |
| Agent runtime ADR needed | Low | Medium | External ADR; no internal ADR required | Identified |

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
