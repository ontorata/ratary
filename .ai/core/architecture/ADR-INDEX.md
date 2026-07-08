# Architecture ADR Index — Identity Foundation

**Directory:** `.ai/core/architecture/`  
**Status:** Active — P0-B Wave 1  
**Public mirror:** [docs/architecture/governance/adr-index.md](../../../docs/architecture/governance/adr-index.md)

| ID | File | Status | Summary |
|----|------|--------|---------|
| ADR-0001 | [ADR-0001-identity-boundary.md](./ADR-0001-identity-boundary.md) | Accepted | Auth identity · owner · org/workspace context · bootstrap vs data-plane |
| ADR-0002 | [ADR-0002-tenant-isolation.md](./ADR-0002-tenant-isolation.md) | Accepted | Organization tenant boundary · Org A ≠ Org B |
| ADR-0003 | [ADR-0003-authorization-model.md](./ADR-0003-authorization-model.md) | Accepted | Permission contract · tenant-before-permission · authorization-boundary |
| ADR-0006 | [ADR-0006-recall-intelligence-boundary.md](./ADR-0006-recall-intelligence-boundary.md) | Accepted | Recall intelligence ownership · candidate/policy/assembly separation |
| ADR-0007 | [ADR-0007-ontory-runtime-kernel-boundary.md](./ADR-0007-ontory-runtime-kernel-boundary.md) | **Accepted** | Ontory runtime kernel · separate repo · REST adapter · stub-first · stateless |

**Template:** [ADR-TEMPLATE.md](./ADR-TEMPLATE.md)

**Enforcement:** `npm run ci:adr-impact` — see [ARCHITECTURE-CHANGE-MAP.md](../governance/ARCHITECTURE-CHANGE-MAP.md)
