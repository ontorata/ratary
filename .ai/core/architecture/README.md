# Architecture Decisions — `.ai/core/architecture/`

**Role:** Canonical **fundamental** architecture knowledge — identity, tenant, authorization, transport.  
**Authority:** Subordinate to [ENGINEERING-CONSTITUTION.md](../constitution/ENGINEERING-CONSTITUTION.md).  
**Process:** [CHANGE-GATING.md](../governance/CHANGE-GATING.md) · [ARCHITECTURE-CHANGE-MAP.md](../governance/ARCHITECTURE-CHANGE-MAP.md)

---

## Layering

| Layer | Path | Purpose |
|-------|------|---------|
| **Core architecture** | `.ai/core/architecture/` | Identity foundation ADRs (P0-A codification) |
| **Cross-product ADR** | `.ai/core/adr/` | Platform-wide ADR-006+ |
| **Governance** | `.ai/core/governance/` | Process · gating · completion protocol |
| **Reviews** | `.ai/reviews/` | Evidence packages |
| **Sessions** | `.ai/sessions/` | Operational audit trail |

Public mirror: [docs/architecture/governance/adr-index.md](../../../docs/architecture/governance/adr-index.md)

---

## P0-A Identity Foundation ADRs (Accepted)

| ADR | Title | Lock evidence |
|-----|-------|---------------|
| [ADR-0001](./ADR-0001-identity-boundary.md) | Identity Boundary | P0-A merge `2a57647` |
| [ADR-0002](./ADR-0002-tenant-isolation.md) | Tenant Isolation | Wave 1 data boundary |
| [ADR-0003](./ADR-0003-authorization-model.md) | Authorization Model | `identity-wave-3-locked` |
| [ADR-0004](./ADR-0004-transport-parity.md) | Transport Parity | `identity-wave-4-locked` |
| [ADR-0005](./ADR-0005-knowledge-ingestion-pipeline.md) | Knowledge Ingestion Pipeline | P1-B design baseline `org-memory-p1-a-complete` |

---

## Proposing change

1. Determine impact using [ARCHITECTURE-CHANGE-MAP.md](../governance/ARCHITECTURE-CHANGE-MAP.md).
2. If mapped paths change → amend or add ADR using [ADR-TEMPLATE.md](./ADR-TEMPLATE.md).
3. Run `npm run ci:adr-impact` locally before PR.
4. Link ADR in PR template **Architecture / ADR reference** section.

**Numbering:** Core architecture ADRs use `0001+` slug prefix in this directory and remain auditable by milestone context.

---

## Related

- [ADR-INDEX.md](./ADR-INDEX.md)
- [engineering-governance-plan.md](../../designs/blueprints/engineering-governance-plan.md)
- [P0-A-IDENTITY-FOUNDATION.md](../../governance/releases/P0-A-IDENTITY-FOUNDATION.md)
