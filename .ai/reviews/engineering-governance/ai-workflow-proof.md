# AI Workflow Governance — Evidence (P0-B Wave 3)

| Field | Value |
|-------|-------|
| **Wave** | 3 — AI Engineering Workflow Governance |
| **Branch** | `forge/engineering-governance` |
| **Baseline lock** | `engineering-governance-wave-2-locked` |
| **Date** | 2026-07-08 |

---

## Acceptance gate

| Gate | Evidence |
|------|----------|
| AI-DEVELOPMENT-PROTOCOL.md | `.ai/workflows/AI-DEVELOPMENT-PROTOCOL.md` |
| CHANGE-EVIDENCE.md | `.ai/workflows/CHANGE-EVIDENCE.md` |
| SESSION-HANDOFF.md | `.ai/workflows/SESSION-HANDOFF.md` |
| Workflows README | `.ai/workflows/README.md` |
| Implementation report template | `.ai/workflows/IMPLEMENTATION-REPORT-TEMPLATE.md` |
| PR template AI section | `.github/pull_request_template.md` |
| Cursor rule compatibility | `.cursor/rules/ontorata-execution-governance.mdc` |
| INDEX integration | `.ai/INDEX.md` |
| Wave checkpoint | `.ai/governance/waves/WAVE-3-AI-WORKFLOW.md` |
| Lock tag | `engineering-governance-wave-3-locked` |

---

## Sample completion mapping

| Protocol step | Artifact |
|---------------|----------|
| Planning | Read wave checkpoint + blueprint |
| Implementation | Governance-only `.ai/workflows/` files |
| Validation | `npm run ci:governance` |
| Evidence | This file + wave checkpoint |
| Governance review | Owner approval implicit via wave execution |
| Commit | Single-intent docs commit |

---

## PR checklist mapping (AI-assisted section)

| PR field | Source doc |
|----------|------------|
| Agent role | AI-DEVELOPMENT-PROTOCOL.md § Agent roles |
| Evidence path | CHANGE-EVIDENCE.md |
| Handoff report | IMPLEMENTATION-REPORT-TEMPLATE.md |
| ci:governance | CI-RULES.md |

---

## Non-goals verification

| Non-goal | Verified |
|----------|----------|
| Application source modified | ✅ no `src/` in Wave 3 |
| Auth / authorization changed | ✅ none |
| CI pipeline changed | ✅ no `ci.yml` / `package.json` script changes |
| Permission model changed | ✅ none |
| Repository structure redesign | ✅ only `.ai/workflows/` added |

---

## Validation output

```bash
npm test                 # 88/88 PASS
npm run ci:governance    # PASS
```

---

## Decision

Wave 3 complete. AI agents have operational protocol, evidence requirements, and handoff format aligned with Implementation Completion Protocol and Wave 2 CI gates.
