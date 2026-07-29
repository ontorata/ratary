# Security control summary (public)

**ADR:** [ADR-013](../architecture/governance/ADR-013-SECURITY-COMPLIANCE.md) — **Accepted** (program only)  
**Updated:** 2026-07-29  
**Certification:** Not claimed. No Type I/II attestation is implied.  
**Availability:** Internal program — [ADR-015](../architecture/governance/ADR-015-AVAILABILITY.md) (not an SLA).

This page is a **status summary only**. Detailed control language, host names, log paths, IPs, and secret-handling procedures are **not** published here. Internal source of truth: private compliance register (Owner).

## Program v1

Core artifacts (control register, evidence index, ISP, IR, access review, vendor register, risk register) are **in place**. Ongoing evidence is **event-driven** (not document-volume driven).

## Trust Services Criteria — Security (v1)

| Family | Theme | Status | Evidence |
|--------|-------|--------|----------|
| CC1–CC2 | Policies / communication | Implemented (program) | Internal ISP |
| CC3 | Risk assessment | Implemented (program) | Internal risk register |
| CC6 | Logical access / encryption / secrets | Partially implemented | Identity ADRs · auth baseline · TLS · **Q3 access review completed** |
| CC7 | Monitoring / incident response | Implemented (program) | Internal IR plan · ops harden evidence |
| CC8 | Change management | Partially implemented | GitHub PR · CI · ADR gating |
| CC9 | Vendor management | Implemented (program) | Internal vendor review |

## System boundary (high level)

**In scope:** Ratary platform · Auth · Ontory Runtime (hosted API) · Studio operator console.  
**Out of scope:** Developer machines · training/research environments · experimental AI hosts.

## Contact

Security / compliance questions: Owner (Ontorata). Do not file secrets or infrastructure detail in public issues.
