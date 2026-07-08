---
id: ENGINEERING-GOVERNANCE-WAVE-1
phase: 04-proof-of-platform
stage: forge-execute
wave: 1
status: Complete
owner: Ontorata
workload: Engineering Governance
evidence_package: engineering-governance
baseline_tag: identity-foundation-p0-a-complete
branch: forge/engineering-governance
lock_tag: engineering-governance-wave-1-locked
updated: 2026-07-08
---

# Wave 1 selesai — ADR Enforcement

| Field | Value |
|-------|-------|
| **Wave** | 1 — ADR Enforcement |
| **Branch** | `forge/engineering-governance` |
| **Baseline** | `identity-foundation-p0-a-complete` @ `2a57647` |
| **Gate** | **LOCKED** — ready for Wave 2 (CI Governance Gate) |

---

## Objective

Codify P0-A identity foundation as **accepted ADRs** and enforce architecture-boundary changes via `ci:adr-impact`.

**Non-goals honored:** no changes to identity implementation · authorization code · permission model · MCP boundary · database schema.

---

## Deliverables

| Gate | Requirement | Status |
|------|-------------|--------|
| ADR template | `ADR-TEMPLATE.md` | ✅ |
| ADR index | `ADR-INDEX.md` · `README.md` | ✅ |
| ADR-0001–0004 | Identity · Tenant · Authorization · Transport | ✅ |
| Architecture reference rules | `ARCHITECTURE-CHANGE-MAP.md` · `CHANGE-GATING.md` | ✅ |
| CI enforcement | `scripts/ci/adr-impact-check.mjs` · `npm run ci:adr-impact` | ✅ |
| PR template | ADR reference section | ✅ |
| Public mirror | `docs/architecture/governance/adr-index.md` | ✅ |
| Evidence | `.ai/reviews/engineering-governance/adr-enforcement-proof.md` | ✅ |

---

## ADR catalog

| ADR | Codifies |
|-----|----------|
| ADR-0001 | Identity boundary · bootstrap vs data-plane |
| ADR-0002 | Tenant isolation · organization boundary |
| ADR-0003 | Permission contract · authorization-boundary |
| ADR-0004 | REST ↔ MCP remote parity |

---

## CI behavior

```
Architecture path changed in PR?
        ├── No  → pass
        └── Yes → ADR file in same diff?
                    ├── Yes → pass
                    └── No  → fail
```

Command: `npm run ci:adr-impact`

---

## Next

**Wave 2 — CI Governance Gate** — add full `ci:governance` job (test · identity · e2e · adr · docs · permission-contract).

**Do not start Wave 2 until Wave 1 lock tag verified on branch.**

---

## Related

- [engineering-governance-plan.md](../../designs/blueprints/engineering-governance-plan.md)
- [adr-enforcement-proof.md](../../reviews/engineering-governance/adr-enforcement-proof.md)
