# Architecture Decision Records

**Purpose:** Registry and lifecycle for ADRs — time-bound structural decisions.  
**Canonical content:** [docs/adr/](../../docs/adr/)  
**Policy:** [governance/policy/adr-policy.md](../governance/policy/adr-policy.md)

---

## Why `adr/` exists

Standards state *how we always work*. ADRs state *what we chose at a point in time*. Separating them prevents assistants from treating expired decisions as permanent law.

---

## Ownership

| Role | Responsibility |
|------|----------------|
| **Author** | Draft Proposed ADR in `docs/adr/` |
| **Project owner** | Approve, reject, or supersede |
| **Maintainer** | Keep `accepted/README.md` index current |

---

## When to use

| Situation | Action |
|-----------|--------|
| New port or layer boundary | Draft ADR → Proposed |
| Storage backend adoption | Draft ADR → Proposed |
| Hybrid retrieval (Phase 6) | ADR-001 must be **Approved** before code |
| Bug fix within existing design | No ADR |

---

## Structure

```
adr/
├── README.md           ← this file
├── template.md         → docs/adr/000-template.md
└── accepted/
    └── README.md       ← index of Approved ADRs
```

**Future (when volume grows):**

```
adr/proposed/           ← per-draft pointers
adr/superseded/         ← retired ADRs with successor links
```

---

## Documents

| File | Purpose | Immutable / evolving | AI reads when | Arch approval to modify |
|------|---------|----------------------|---------------|-------------------------|
| `README.md` | Lifecycle rules | Evolving | Before structural work | Owner |
| `template.md` | Blank form | Stable | Drafting ADR | Maintainer |
| `accepted/README.md` | Approved index | Evolving | Task-relevant ADRs | Maintainer |
| `docs/adr/NNN-*.md` | **Canonical ADR** | **Immutable once Approved** | Before implementing | **Owner** for status |

---

## Dependencies

| Depends on | Reason |
|------------|--------|
| `constitution/` | ADRs must align with immutable law |
| `governance/policy/adr-policy.md` | Process rules |
| `architecture/structural-law.md` | Layer boundaries |

| Depended on by | Reason |
|----------------|--------|
| `phases/` | Phase may require specific Approved ADRs |
| `review/04-PHASE-READINESS.md` | ADR gates before next phase |
| `workflow/decision-framework.md` | Escalation when Proposed but code requested |
| `templates/adr.md` | Blank form source |

---

## Rules

- **Proposed** ADRs MUST NOT be implemented.
- **Approved** ADRs MUST NOT be rewritten — supersede only.
- AI assistants MAY draft Proposed ADRs; owner MUST approve.

---

*Alias: [decisions/](../decisions/README.md) redirects here. Canonical ADRs live in `docs/adr/`.*
