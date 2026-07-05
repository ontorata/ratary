# Phase 20 — AI Infrastructure — RISKS

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Unsigned plugin manifest | High | Critical | Schema check only MVP; ed25519 deferred | Deferred |
| Plugin enable hot-swap race | Medium | High | Restart required on enable | Accepted |
| Third-party plugin vendor lock | Medium | Medium | Port mapping to ADR-008 adapters | Mitigated |
| Marketplace default ON | Low | Critical | PLUGIN_MARKETPLACE_ENABLED=false | Mitigated |

---

*Gate PASS 2026-07-04 — realized risks locked; deferred items tracked above or in CHECKLIST.*
