# ADR-013 — Security Compliance (SOC 2 framework)

**Status:** Proposed (draft for Owner validation — **not Accepted**, **not certified**)  
**Date:** 2026-07-29  
**Product:** Ratary (+ related Ontorata surfaces as in-scope systems)  
**Public index:** [adr-index.md](./adr-index.md)  
**Authority start:** ARCH-0259 next-pick · Owner cited ADR-013 row  

## Non-claims

1. This document does **not** assert SOC 2 Type I/II attestation.  
2. This document does **not** replace a CPA firm report.  
3. Acceptance of this ADR means Ontorata adopts a **control framework and evidence cadence**, not that an audit already passed.

## Problem

Cross-product ADRs cover identity, tenant isolation, and AI data governance, but there is no Accepted decision that:

- maps Trust Services Criteria (TSC) to Ontorata/Ratary controls,
- defines evidence ownership and refresh cadence,
- separates **product security engineering** from **formal compliance program**.

Without that frame, harden work (e.g. VPS Fork A) and identity ADRs remain valuable but unlinked to an audit-ready narrative.

## Decision (proposed)

Adopt **SOC 2 Trust Services Criteria** as the **internal compliance framework** for Ratary production and designated staging hosts, with:

| Layer | Choice |
|-------|--------|
| Framework | AICPA TSC — start with **Security** (common criteria); optionally Availability / Confidentiality later |
| Scope v1 | Ratary production (hosted API/MCP) · Auth Ontorata · designated Ontory Runtime VPS staging/prod API · Studio production (operator console) |
| Out of scope v1 | Ontory Model training laptops · research-only GPU paths · third-party model provider internals |
| Evidence model | Control → owner → artifact path → review period |
| Certification | **Deferred** — program first; Type I/II only after Owner Accept of audit readiness gate |

## Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| A — SOC 2 Security-first program (proposed) | Matches SaaS buyer expectation; maps to existing ADRs | Cost/time if audit pursued early |
| B — ISO 27001 first | Broader ISMS | Heavier; less common as first US SaaS ask |
| C — Ad-hoc harden only | Cheap | No buyer narrative; drift |
| D — Immediate Type II engagement | Fast “logo” path | Premature without control map + evidence |

## Mapping sketch (Security TSC → existing work)

| Theme | Example criteria | Existing anchors | Gap |
|-------|------------------|------------------|-----|
| Access control | CC6 | ADR-0001…0004 · ADR-006 · ADR-012 · GUIDE Security · MCP_OWNER_ID | Formal access reviews · joiner/mover/leaver |
| Encryption | CC6 | TLS (Vercel/Caddy) · secrets in env not git | Document key custody · D1/at-rest narrative |
| Change management | CC8 | GitHub PR · CI · ADR change gating | Change ticket ↔ release evidence pack |
| Logging / monitoring | CC7 | ADR-010 Observability · journald VPS | Central log retention policy · alert runbooks |
| Vendor management | CC9 | Cloudflare · Vercel · GitHub | Vendor inventory + review cadence |
| Incident response | CC7 | Informal Owner ops | Written IR plan · severity matrix · contact tree |
| Risk assessment | CC3 | Architecture reviews | Annual risk register |

## Related ADRs (do not reopen)

- ADR-008 AI data governance · ADR-012 tenant isolation · ADR-0001…0004 identity  
- Ontory VPS harden / Fork A evidence is **ops input**, not SOC 2 complete  

## Misnumbering note

Some analytics DuckDB comments historically cited “ADR-013”; that was incorrect. Analytics adapters are **not** this ADR. Comments should not claim ADR-013.

## Acceptance criteria (for future Accept of this ADR)

1. Owner Accept of scope table (in/out).  
2. Control register v1 published (private or public as Owner chooses).  
3. Evidence index linking ≥1 artifact per in-scope control family.  
4. Explicit decision: **program-only** vs **engage auditor** (separate gate).

## Open questions for Owner

1. Scope: include Ontory Runtime VPS in SOC 2 system description now, or Ratary+Auth only?  
2. Criteria: Security only for v1, or Security+Availability?  
3. Where does the full control register live — private `.ai/` only, or public `docs/` summary?  
4. Timeline: program build this quarter, or park until enterprise deal?

## Next implementation steps (after Owner section Accept)

1. Control register CSV/MD v1  
2. Evidence index (link VPS audit, auth bootstrap, CI, backups if any)  
3. IR one-pager + access-review checklist  
4. Optional: engage auditor readiness review  
