# ADR-015 — Availability (program)

**Status:** ✅ **Accepted** — 2026-07-29  
**Owner Accept:** Post–ADR-013 Security; program only (not SLA attestation)  
**Certification:** **Not claimed** — no uptime SLA sold; no DR certification  
**Depends on:** [ADR-013](./ADR-013-SECURITY-COMPLIANCE.md)  
**Public index:** [adr-index.md](./adr-index.md)

## Non-claims

1. This ADR does **not** assert a contractual uptime SLA.  
2. This ADR does **not** assert disaster-recovery certification.  
3. This ADR does **not** expand SOC 2 Type I/II scope by itself.  
4. Acceptance means Ontorata adopts an **internal Availability program** (objectives, backup/DR posture, evidence cadence).

## Problem

ADR-013 locked Security TSC only and deferred Availability (backup verification, DR, RTO/RPO, failover, SLA) until after Security program v1. Security program v1 is now in place; Availability needs a separate ADR so ops targets are explicit without pretending audit readiness.

## Decision

Adopt an **internal Availability program** for the same system boundary as ADR-013 v1, with **objectives and evidence** — not marketed SLA numbers.

| Layer | Owner lock (2026-07-29) |
|-------|-------------------------|
| Framework | Availability as internal ops program (complements Security TSC) |
| Scope v1 (in) | Ratary (prod) · Auth · Ontory Runtime (prod/staging API) · Studio (prod) |
| Scope v1 (out) | Dev laptops · training/research · Frontier GPU / experimental hosts |
| RTO / RPO (targets, not guarantees) | Ratary API: RTO ≤ 4h · RPO ≤ 24h (D1 / platform backups as provided by Cloudflare + export routines). Ontory Runtime VPS: RTO ≤ 8h · RPO ≤ 24h (image + config restore). |
| Failover | Active-passive / rebuild-from-config for VPS; platform-managed for Ratary on Vercel+D1 |
| Backup verification | Event-driven restore drills when significant infra change; at least one documented restore check per quarter when production is stable |
| Certification / Type II Availability | **Deferred** with Type I/II Security engagement |

## Alternatives considered

| Option | Outcome |
|--------|---------|
| Fold Availability into ADR-013 now | **Rejected** — Security Accepted as Security-only |
| Public SLA page with 99.9% | **Rejected** — premature commercial claim |
| Skip Availability ADR forever | **Rejected** — ops targets would remain tribal |

## Program sequence

```text
Accepted → document backup sources · define restore owners
  → event-driven restore evidence
  → quarterly lightweight check when platform stable
  → only then consider Availability criteria in a future audit scope
```

## Related

ADR-013 · ADR-010 (Observability) · Phase 38 production enable evidence (Code Memory) does not change Availability targets.
