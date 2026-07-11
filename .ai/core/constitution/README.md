# Constitution Index

**Authority:** Highest architectural reference for the Ontorata organization.

| Document | Status | Purpose |
|----------|--------|---------|
| [ENGINEERING-CONSTITUTION.md](./ENGINEERING-CONSTITUTION.md) | **Canonical** | Organization identity, repository ecosystem, principles, governance |

## Constitution Extensions (P0-B Wave 6)

| Document | Status | Purpose |
|----------|--------|---------|
| [ENGINEERING-PRINCIPLES.md](./ENGINEERING-PRINCIPLES.md) | **Canonical** | P1–P5 non-negotiable engineering principles |
| [SECURITY-BOUNDARY.md](./SECURITY-BOUNDARY.md) | **Canonical** | Tenant isolation, auth boundary, permission contract |
| [CHANGE-MANAGEMENT.md](./CHANGE-MANAGEMENT.md) | **Canonical** | ADR triggers, release process, migration governance |
| [P0-BASELINE-CHANGE-POLICY.md](./P0-BASELINE-CHANGE-POLICY.md) | **Canonical** | P0-A/P0-B frozen baseline · permitted change classes |
| [FROZEN-BOUNDARY-BYPASS-POLICY.md](./FROZEN-BOUNDARY-BYPASS-POLICY.md) | **Canonical** | No bypass of frozen Ratary/Studio/Ontory boundaries for convenience |

**Organization:** ontorata · hello@ontorata.com

## Applies to

| Repository | Role |
|------------|------|
| `ontorata/ratary` | AI Brain Platform |
| `ontorata/Ontorata-Studio` | Enterprise AI Development Platform |
| `ontorata/auth` | Identity Boundary Service |
| `ontorata/ratary-marketplace` | AI Ecosystem Marketplace |
| **Ontory** (future) | Enterprise AI Assistant |

## Governance chain

```
START-HERE.md (when present)
    → ENGINEERING-CONSTITUTION.md (this index)
        → ENGINEERING-PRINCIPLES.md  (P1–P5)
        → SECURITY-BOUNDARY.md      (P1 + P4 specifics)
        → CHANGE-MANAGEMENT.md      (P5 specifics)
            → P0-BASELINE-CHANGE-POLICY.md  (P0 frozen baseline)
            → ADR-NNN-*.md (.ai/core/adr/)
            → RFC-NNN-*.md (.ai/core/rfc/) — proposals only
            → policies/*.md · blueprints/*.md · standards/*.md
                → Product docs (docs/, README)
                    → Implementation (src/)
```

## Rules (non-negotiable)

1. **P1 — Security over convenience** — no feature justifies a security trade-off
2. **P2 — Documentation is engineering output** — code without docs is incomplete
3. **P3 — Evidence before completion** — merge ≠ Done; completion requires evidence package
4. **P4 — Tenant isolation is mandatory** — `owner_id` is not optional
5. **P5 — Architecture before implementation** — significant changes require ADR
6. **API First** — cross-product integration via REST/MCP/OIDC only
7. **Provider Agnostic** — model and IdP providers behind interfaces
8. **ADR Required** — significant architecture changes documented before merge
9. **Enterprise Ready** — multi-tenant `owner_id`, SSO paths preserved
10. **Modular Architecture** — Studio ≠ Auth ≠ Ratary data plane
11. **Internal Proof Before Public Capability** — no platform GA without Ontorata internal production evidence

## ADR registry

See [../adr/INDEX.md](../adr/INDEX.md).

## Policies, blueprints, standards & RFC

| Layer | Index |
|-------|-------|
| RFC | [../rfc/INDEX.md](../rfc/INDEX.md) |
| Policies | [../policies/INDEX.md](../policies/INDEX.md) |
| Blueprints | [../blueprints/INDEX.md](../blueprints/INDEX.md) |
| Standards | [../standards/INDEX.md](../standards/INDEX.md) |

## P0-B Engineering Governance (complete)

| Wave | Domain | Status |
|------|--------|--------|
| 1 | ADR Enforcement | ✅ LOCKED |
| 2 | CI Governance Gate | ✅ LOCKED |
| 3 | AI Engineering Workflow | ✅ LOCKED |
| 4 | Release Management | ✅ LOCKED |
| 5 | Migration Governance | ✅ LOCKED |
| 6 | Engineering Constitution | ✅ LOCKED |

**Final tag:** `engineering-governance-p0-b-complete` · **RELEASED** · **FROZEN**

**Release record:** [.ai/governance/releases/P0-B-ENGINEERING-GOVERNANCE.md](../governance/releases/P0-B-ENGINEERING-GOVERNANCE.md)

## P1 — Use the platform (active)

| Milestone | Workload | Status |
|-----------|----------|--------|
| P1-A | Org Memory Dogfood | 🟡 Intent proposed — [org-memory-dogfood-intent.md](../designs/drafts/org-memory-dogfood-intent.md) |
| P1-B | Knowledge Ingestion | Planned |
| P1-C | Retrieval + Context | Planned |
| P1-D | AI Workspace | Planned |

**First workload doc:** [FIRST-WORKLOAD-ORG-MEMORY.md](../phases/04-proof-of-platform/FIRST-WORKLOAD-ORG-MEMORY.md)
