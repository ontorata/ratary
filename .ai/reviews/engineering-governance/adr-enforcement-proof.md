# ADR Enforcement — Evidence (P0-B Wave 1)

| Field | Value |
|-------|-------|
| **Wave** | 1 — ADR Enforcement |
| **Branch** | `forge/engineering-governance` |
| **Baseline** | P0-A RELEASED · `identity-foundation-p0-a-complete` |
| **Date** | 2026-07-08 |

---

## Acceptance gate

| Gate | Evidence |
|------|----------|
| ADR template | `.ai/core/architecture/ADR-TEMPLATE.md` |
| ADR index | `.ai/core/architecture/ADR-INDEX.md` · `README.md` |
| ADR-0001–0004 | `.ai/core/architecture/ADR-0001` … `ADR-0004` |
| Architecture reference rules | `.ai/core/governance/ARCHITECTURE-CHANGE-MAP.md` |
| CHANGE-GATING update | Identity boundary triggers section |
| CI script | `scripts/ci/adr-impact-check.mjs` |
| npm script | `npm run ci:adr-impact` |
| PR template | ADR reference block |
| Public index | `docs/architecture/governance/adr-index.md` |
| Wave checkpoint | `.ai/governance/waves/WAVE-1-ADR-ENFORCEMENT.md` |
| Lock tag | `engineering-governance-wave-1-locked` |

---

## Validation commands

```bash
npm run ci:adr-impact
npm test
```

Expected:

- `adr-impact-check: no architecture-boundary paths changed — OK` (Wave 1 is docs/CI only)
- Full suite **88/88** unchanged

---

## Non-goals verification

| Non-goal | Verified |
|----------|----------|
| Identity implementation unchanged | ✅ no `src/auth/` diff in Wave 1 commit |
| Authorization refactor | ✅ none |
| Permission model change | ✅ none |
| MCP boundary change | ✅ none |
| Database schema change | ✅ none |

---

## Sample failure mode (future PR)

If `src/auth/permission-context.ts` changes without ADR in diff:

```
❌ ADR IMPACT CHECK FAILED
Architecture-boundary paths changed without ADR decision record
```

---

## Decision

Wave 1 deliverable complete. Governance layer documents P0-A locked decisions; enforcement ready for Wave 2 CI integration.
