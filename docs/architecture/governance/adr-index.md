# Architecture Decision Records — Public Index

**Canonical:** `.ai/core/adr/` · **RFC:** `.ai/core/rfc/` · **Standards:** `.ai/core/standards/`  
**Change gating:** `.ai/core/governance/CHANGE-GATING.md`  
**Last updated:** 2026-07-07

---

## Governance chain

```
Constitution → ADR → RFC → Blueprint → Standards → Implementation
```

RFC = proposal only. Accepted RFC → new ADR (e.g. RFC-001 → ADR-015).

---

**Last updated:** 2026-07-08 (P0-B Wave 1 — identity foundation ADRs)

---

## Identity Foundation ADRs (P0-A — canonical in `.ai/core/architecture/`)

| ADR | Title | Status | Summary |
|-----|-------|--------|---------|
| ADR-0001 | [Identity Boundary](.ai/core/architecture/ADR-0001-identity-boundary.md) | Accepted | Auth · owner · org/workspace · bootstrap vs data-plane |
| ADR-0002 | [Tenant Isolation](.ai/core/architecture/ADR-0002-tenant-isolation.md) | Accepted | Organization tenant boundary · Org A ≠ Org B |
| ADR-0003 | [Authorization Model](.ai/core/architecture/ADR-0003-authorization-model.md) | Accepted | Permission contract · authorization-boundary |
| ADR-0004 | [Transport Parity](.ai/core/architecture/ADR-0004-transport-parity.md) | Accepted | REST ↔ MCP remote · transport ≠ permission |

**Enforcement:** `npm run ci:adr-impact` · [ARCHITECTURE-CHANGE-MAP.md](.ai/core/governance/ARCHITECTURE-CHANGE-MAP.md)

---

## Cross-product ADRs

| ADR | Title | Status | Summary |
|-----|-------|--------|---------|
| ADR-006 | Native Auth Gateway | Accepted | Auth gateway → Ratary; OIDC federation |
| ADR-007 | Ratary / Ontory boundary | Accepted | Brain vs persona; auth identity ≠ AI identity |
| ADR-008 | AI data governance | Accepted | Tenant data; opt-in training; deletion |
| ADR-009 | Model lifecycle | Accepted | Dataset → RC → prod → monitoring |
| ADR-010 | Observability | Accepted | OTel → Collector → any backend |
| ADR-011 | AI evaluation | Accepted | Scoring, human review, training gates |
| ADR-012 | Tenant isolation | Accepted | Mandatory `owner_id` on all data paths |
| ADR-013 | Security compliance | Proposed | SOC 2 framework |
| **ADR-014** | **Provider independence** | **Accepted** | Business → Interface → Adapter → SDK; no provider `if` in domain |

---

## RFCs (proposals)

| RFC | Title | Status |
|-----|-------|--------|
| RFC-001 | Agent Runtime v2 | Draft |

---

## Standards layer

Technical conventions (not policies): REST error format, logging, telemetry, testing, TypeScript boundaries — `.ai/core/standards/`.

---

## AI governance

Lifecycle rules for prompts, memory, agents, models, tools, eval — `.ai/core/governance/AI-GOVERNANCE.md`.

---

## Studio ADRs (in git)

`Ontorata-Studio/docs/architecture/adr/` — ADR-001 through ADR-005.

---

## How to propose change

1. Significant / unclear? → RFC in `.ai/core/rfc/`
2. Architecture review
3. Accepted → ADR
4. Follow [CHANGE-GATING.md](.ai/core/governance/CHANGE-GATING.md)
