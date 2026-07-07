# Architecture Decision Records — Public Index

**Canonical ADRs:** `.ai/core/adr/` (local maintainer clone — not in git)  
**Governance checkpoint:** `.ai/core/governance/GOVERNANCE-STATUS.md`  
**Last updated:** 2026-07-07

---

## Cross-product ADRs (Ratary governance workspace)

| ADR | Title | Status | Summary |
|-----|-------|--------|---------|
| **ADR-006** | Native Auth Gateway | Accepted | Studio → Auth Gateway → Ratary; native default; OIDC federation for enterprise |
| **ADR-007** | Ratary / Ontory AI boundary | Accepted | Ratary = brain; Ontory = persona/UX; providers = tokens only |
| **ADR-008** | AI data governance | Accepted | Tenant/memory/training classification; opt-in training; deletion cascade |
| **ADR-009** | Model lifecycle | Accepted | Dataset → prod pipeline with eval gates, versioning, rollback |

Full text: request from maintainer or read `.ai/core/adr/ADR-NNN-*.md` locally.

---

## Studio product ADRs (in git)

Repository: [Ontorata-Studio](https://github.com/ontorata/Ontorata-Studio)

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | Ecosystem repo boundaries | Accepted |
| ADR-002 | Studio layered modules | Accepted |
| ADR-003 | External OIDC (Zitadel) | Accepted — superseded as **default** by ADR-006 |
| ADR-004 | Connection wizard gate | Accepted |
| ADR-005 | Legacy API key bridge | Accepted |

Path: `docs/architecture/adr/`

---

## Auth documentation (Studio)

| Doc | Purpose |
|-----|---------|
| [Ontorata-Studio/docs/auth/](https://github.com/ontorata/Ontorata-Studio/tree/main/docs/auth) | Architecture, native auth, OIDC federation |

---

## Proposed next ADRs

| Candidate | Topic |
|-----------|-------|
| ADR-010 | Observability — auth audit → SIEM pipeline |
| ADR-011 | AI evaluation governance — benchmark ownership |

---

## How to propose an ADR

1. Read [constitution-summary.md](./constitution-summary.md)
2. Draft in `.ai/core/adr/` following ADR-006 structure
3. Update `.ai/core/adr/INDEX.md` and this file
4. Mirror user-facing sections to product `docs/` if needed
