# ADR-013 — Security Compliance (SOC 2 framework)

**Status:** ✅ **Accepted** — 2026-07-29  
**Owner Accept:** Scope · Criteria · Register placement · Timeline (ARCH-0261)  
**Certification:** **Not claimed** — program only; Type I/II deferred  
**Public index:** [adr-index.md](./adr-index.md)  
**Private SoT:** `.ai/compliance/` (gitignored)  
**Public summary:** [CONTROL-SUMMARY.md](../../security/CONTROL-SUMMARY.md)

## Non-claims

1. This ADR does **not** assert SOC 2 Type I/II attestation.  
2. This ADR does **not** replace a CPA firm report.  
3. This ADR does **not** imply present audit readiness.  
4. Acceptance means Ontorata adopts **governance, controls, and evidence management** only.

## Problem

Identity, tenant isolation, and AI data governance ADRs existed without a Security TSC control program linking them to evidence cadence and system boundary.

## Decision

Adopt the **SOC 2 Trust Services Criteria** as Ratary's **internal security and compliance framework**. This ADR establishes **governance, controls, and evidence management only**. It does **not** imply certification or audit readiness.

| Layer | Owner lock (2026-07-29) |
|-------|-------------------------|
| Framework | AICPA TSC — **Security** (common criteria) only for v1 |
| Scope v1 (in) | **Ratary** platform (prod) · **Auth Ontorata** · **Ontory Runtime** (production/staging VPS API) · **Studio** operator console (production) |
| Scope v1 (out) | Developer laptops · training environments · AI experiments · local research · Ontory Model/Frontier GPU hosts · third-party model provider internals |
| Control register | **Private** `.ai/compliance/` = source of truth · **Public** `docs/security/CONTROL-SUMMARY.md` = status only (no hosts, IPs, paths, secrets) |
| Certification | **Deferred** — build program now; Type I only after readiness + business need; Type II after 6–12 months evidence |

Availability (backup verification, DR, RTO/RPO, failover, SLA) was deferred from this ADR and is now covered by **[ADR-015 — Availability](./ADR-015-AVAILABILITY.md)** (program only; not an SLA).

## Alternatives considered

| Option | Outcome |
|--------|---------|
| Ratary+Auth only | **Rejected** — would force system-boundary rewrite when Ontory enters audit |
| Security+Availability now | **Rejected** — premature ops load |
| Public-only register | **Rejected** — leaks operational detail |
| Immediate Type I engagement | **Rejected** — cost before need |

## System boundary (stable)

```text
In scope:
  Ratary Platform (prod)
  Auth Ontorata
  Ontory Runtime (prod/staging API on Owner VPS)
  Ontorata Studio (operator console, prod)

Out of scope:
  Dev laptops · training · research · experiments · Frontier GPU hosts
```

## Mapping (Security TSC → program)

| Theme | Criteria family | Program artifact |
|-------|-----------------|------------------|
| Access control | CC6 | control-register · quarterly-access-review |
| Encryption / secrets | CC6 | control-register · evidence-index |
| Logging / IR | CC7 | incident-response · evidence-index |
| Change management | CC8 | control-register · evidence-index |
| Vendor | CC9 | vendor-review |
| Risk | CC3 | risk-register |
| Policy | CC1–CC2 | information-security-policy |

## Related ADRs (do not reopen lightly)

ADR-008 · ADR-012 · ADR-0001…0004 · ADR-006 · ADR-010

## Program sequence (Accepted)

```text
2026: ADR Accepted → Control Register → Evidence Index → ISP → IR → Risk → Vendor
  → months of evidence collection
  → enterprise need → Readiness Review → Type I → 6–12 mo → Type II
```

## Supersedes

[ADR-013-SECURITY-COMPLIANCE-DRAFT.md](./ADR-013-SECURITY-COMPLIANCE-DRAFT.md) (Proposed draft retained for history).
