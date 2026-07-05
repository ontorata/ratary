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
| Unsigned plugin manifest | High | Critical | `SignedPluginManifestValidator` + Ed25519 + `PLUGIN_TRUSTED_PUBLIC_KEYS`; schema MVP when crypto off | Mitigated (D20-01, 2026-07-05) |
| Plugin enable hot-swap race | Medium | High | Restart required on enable | Accepted |
| Third-party plugin vendor lock | Medium | Medium | Port mapping to ADR-008 adapters | Mitigated |
| Marketplace default ON | Low | Critical | PLUGIN_MARKETPLACE_ENABLED=false | Mitigated |

---

## Follow-up (closed)

| ID | Item | Status |
|----|------|--------|
| **D20-01** | Ed25519 manifest verification + `PLUGIN_TRUSTED_PUBLIC_KEYS` | ✅ Shipped 2026-07-05 |

---

*Gate PASS 2026-07-04 — D20-01 follow-up closed 2026-07-05. Realized risks locked; see register above.*
