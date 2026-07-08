# Change Management

| Field | Value |
|-------|-------|
| **Status** | Canonical — P0-B Wave 6 |
| **Authority** | [ENGINEERING-CONSTITUTION.md](../ENGINEERING-CONSTITUTION.md) |
| **Supersedes** | Ad-hoc change review processes |
| **Owner** | Engineering |
| **Updated** | 2026-07-08 |

---

## Role

This document defines how architectural and operational changes enter the system. Every change — whether code, configuration, or governance artifact — must follow this lifecycle.

For principles → [ENGINEERING-PRINCIPLES.md](./ENGINEERING-PRINCIPLES.md)  
For security rules → [SECURITY-BOUNDARY.md](./SECURITY-BOUNDARY.md)  
For enforcement → `npm run ci:governance` · `npm run ci:adr-impact`

---

## Change lifecycle

```
Change Proposal
        │
        ├── Impact Analysis
        │         │
        │         ├── Architecture path touched?
        │         │         ├── Yes → ADR required
        │         │         └── No  → proceed
        │         │
        │         ├── Migration path touched?
        │         │         ├── Yes → Migration evidence required
        │         │         └── No  → proceed
        │         │
        │         └── Documentation path touched?
        │                   ├── Yes → Evidence required
        │                   └── No  → proceed
        │
        ├── ADR (if architecture path)
        │         │
        │         ├── Draft → Review → Accepted → Immutable
        │         │
        │         └── ADR-0001 to ADR-0014 catalogued
        │
        ├── Implementation
        │         │
        │         ├── Code changes
        │         ├── Tests (unit · identity · e2e)
        │         └── Governance evidence
        │
        ├── CI Governance Gate
        │         ├── npm test
        │         ├── npm run test:identity
        │         ├── npm run test:e2e
        │         ├── npm run ci:adr-impact
        │         ├── npm run ci:docs-impact
        │         └── npm run ci:permission-contract
        │
        ├── Evidence Package
        │         ├── `.ai/reviews/` for Phase 4+
        │         └── Migration evidence for data changes
        │
        ├── Release Process
        │         └── RC → Evidence → Tag → RELEASED
        │
        └── Post-Release
                  └── Audit trail in Ratary + `.ai/sessions/CURRENT.md`
```

---

## ADR trigger map

### When is an ADR required?

| Change type | ADR required? | Evidence required? |
|-------------|-------------|-------------------|
| Auth boundary | ✅ Always | ✅ |
| Tenant isolation | ✅ Always | ✅ |
| Permission contract | ✅ Always | ✅ |
| Transport boundary | ✅ Always | ✅ |
| Data ownership model | ✅ Always | ✅ |
| Cross-product API | ✅ Always | ✅ |
| Migration script | ⚠️ Risk-based | ✅ |
| Configuration | ❌ | ⚠️ Changelog |
| Bug fix (non-architecture) | ❌ | ⚠️ Changelog |
| Documentation only | ❌ | ⚠️ PR update |

### Architecture path definitions

```
src/auth/                  → ADR always required
src/scope/                 → ADR always required
src/transport/             → ADR always required (REST ↔ MCP parity)
src/db/migrations.ts       → Migration evidence required
schema.sql                 → Migration evidence required
src/authorization-boundary/ → ADR always required (permission model)
```

**Source:** [ARCHITECTURE-CHANGE-MAP.md](../../core/governance/ARCHITECTURE-CHANGE-MAP.md)

---

## ADR process

### Standard ADR lifecycle

```
RFC (optional — for proposals)
    │
    ├── Architecture Review
    │
    ├── Decision
    │         │
    │         ├── Accepted → ADR immutable once accepted
    │         ├── Rejected → Record rationale
    │         └── Superseded → Deprecate old, write new
    │
    └── Implementation (alongside or after ADR accepted)
```

### ADR structure

Every ADR must contain:

| Section | Purpose |
|---------|---------|
| Status | Proposed · Accepted · Deprecated · Superseded |
| Context | Why this decision is being made |
| Decision | What was decided |
| Consequences | What changes because of this decision |
| Evidence | Where proof exists (code · tests · metrics) |
| Related | Related ADRs · blueprints · standards |

**Template:** [ADR-TEMPLATE.md](../../core/architecture/ADR-TEMPLATE.md)

### Current ADR catalog

| ADR | Title | Status | Triggers |
|-----|-------|--------|----------|
| ADR-0001 | Identity Boundary | Accepted | `src/auth/` |
| ADR-0002 | Tenant Isolation | Accepted | `src/scope/` |
| ADR-0003 | Authorization Model | Accepted | `src/authorization-boundary/` |
| ADR-0004 | Transport Parity | Accepted | `src/transport/` |
| ADR-0006 | Native Auth Gateway | Accepted | Cross-product auth |
| ADR-0007 | Ratary / Ontory boundary | Accepted | Cross-product AI |
| ADR-0008 | AI data governance | Accepted | Data retention · training |
| ADR-0009 | Model lifecycle | Accepted | Model changes |
| ADR-0010 | Observability | Accepted | OTel · logging |
| ADR-0011 | AI evaluation | Accepted | Eval pipeline |
| ADR-0012 | Tenant isolation | Accepted | `owner_id` enforcement |
| ADR-0014 | Provider independence | Accepted | Provider SDK in business logic |

**Index:** [ADR-INDEX.md](../../core/architecture/ADR-INDEX.md) · [adr-index.md](docs/architecture/governance/adr-index.md) (public mirror)

---

## Release process

### RC → RELEASED gate

| Stage | Gate | Owner |
|-------|------|-------|
| Development | Code complete | Engineer |
| Feature Complete | Tests pass · peer review | Engineer |
| Validation | `npm test` · `npm run ci:governance` | CI |
| Governance Review | ADR · evidence · docs updated | Reviewer |
| Release Candidate | Tag with `rc` prefix | Engineer |
| Evidence Package | `.ai/reviews/` synced to Ratary | Engineer |
| Tag | Remote verified | Maintainer |
| RELEASED | Tag on origin | Maintainer |

**Full process:** [RELEASE-PROCESS.md](../../governance/releases/RELEASE-PROCESS.md)

---

## Migration process

| Risk level | Approval | Evidence |
|------------|----------|----------|
| Safe (self-service) | Engineer | Migration record |
| Review Required | Peer + Gov owner | Migration record + peer review |
| High Risk | Gov owner + ADR | Migration record + ADR + rollback plan |

**Full process:** [MIGRATION-POLICY.md](../../governance/migrations/MIGRATION-POLICY.md)  
**Rollback:** [ROLLBACK-PROCEDURE.md](../../governance/migrations/ROLLBACK-PROCEDURE.md)

---

## Governance change process

Changes to governance artifacts (this constitution, policies, standards) follow the same lifecycle:

```
Proposal → Impact Analysis → Draft → Review → Accepted → Evidence → Implementation
```

| Change type | Process |
|-------------|---------|
| New principle | ADR (constitutional change) |
| New policy | Wave process · maintainer approval |
| New standard | RFC → accepted standard |
| Workflow update | Wave 3 process |
| Release process update | Wave 4 process |

---

## Wave process reference

For Phase 4+ workloads (P0-B and beyond):

```
Intent → Isolate → Blueprint → Wave 1 → Wave 2 → … → Wave N
                                                              │
                                                              ▼
                                                        RELEASED
```

Each wave: implementation → tests → evidence → governance checkpoint → lock tag

**Lock tag format:** `{workload}-wave-{N}-locked`

**Final tag:** `{workload}-p0-{X}-complete`

---

## Non-goals (what this is NOT)

| Misconception | Reality |
|---------------|---------|
| "Governance changes require no evidence" | Governance changes follow the same lifecycle |
| "AI agents skip evidence" | AI-assisted changes still require full evidence |
| "Migration is just code" | Migration is state change — evidence required |
| "Wave process is only for Phase 4" | All significant work benefits from wave process |

---

## Related

- [ENGINEERING-CONSTITUTION.md](./ENGINEERING-CONSTITUTION.md)
- [ENGINEERING-PRINCIPLES.md](./ENGINEERING-PRINCIPLES.md)
- [SECURITY-BOUNDARY.md](./SECURITY-BOUNDARY.md)
- [ARCHITECTURE-CHANGE-MAP.md](../../core/governance/ARCHITECTURE-CHANGE-MAP.md)
- [CHANGE-GATING.md](../../core/governance/CHANGE-GATING.md)
- [ADR-INDEX.md](../../core/architecture/ADR-INDEX.md)
- [RELEASE-PROCESS.md](../../governance/releases/RELEASE-PROCESS.md)
- [MIGRATION-POLICY.md](../../governance/migrations/MIGRATION-POLICY.md)
