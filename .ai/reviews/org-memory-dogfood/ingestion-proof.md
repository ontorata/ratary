# P1-A Org Memory Dogfood — Ingestion Scope Proof

| Field | Value |
|-------|-------|
| **Status** | Active |
| **Milestone** | P1-A Org Memory Dogfood |
| **Task** | Blueprint Task 2 — Define ingestion scope contract |
| **Branch** | `forge/org-memory-dogfood` |
| **Updated** | 2026-07-08 |

---

## Objective

Define and lock ingestion scope contract before implementing ingest runner logic, so dogfood evidence can be audited and reproduced.

---

## Contract source

- `.ai/sync/ratary-sync-config.yaml` → `p1a_org_memory_contract`

Required fields present:

- `acceptance_gates`
- `ingest_sources`
- `operational_constraints`

---

## Ingestion sources (P1-A)

| Source | Paths | Refresh | Tags |
|--------|-------|---------|------|
| Engineering docs | `.ai/core/`, `docs/architecture/` | `on_commit` | `org-memory`, `engineering`, `governance` |
| ADRs | `.ai/core/architecture/ADR-*.md` | `on_commit` | `org-memory`, `adr` |
| Governance releases | `.ai/governance/releases/` | `on_commit` | `org-memory`, `release`, `governance` |
| Evidence reviews | `.ai/reviews/` | `on_session_end` | `org-memory`, `evidence`, `phase-4` |
| Session handoffs | `.ai/sessions/CURRENT.md` | `on_session_end` | `org-memory`, `session`, `handoff` |

---

## Operational constraints

1. Repository remains source of truth.
2. P0 baseline is frozen; no runtime mutation.
3. `save_memory` required on session handoff.
4. Evidence trace must link decision, release, and review.

---

## Verification commands

```bash
rg "org-memory|ingest|handoff|governance" .ai/sync/ratary-sync-config.yaml .ai/governance/ci/CI-RULES.md .ai/reviews/org-memory-dogfood/ingestion-proof.md
```

Pass condition: all contract sections and source mappings discoverable via grep.
