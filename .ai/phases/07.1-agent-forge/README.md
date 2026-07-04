# Phase 07.1 — Agent Forge

**Status:** ✅ Implemented (2026-07-05) · extension track of Phase 7 (external agent boundary)  
**Capability:** Memory-governed Cursor agent pipeline — mandatory skills, MCP recall/remember bookends, design drafts. **No agent runtime in `src/`.**

**Artifacts:** `.cursor/skills/forge-*` · `.cursor/rules/agent-forge.mdc` · [manifest.json](manifest.json)

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Skills, rule, manifest | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema migrations | ✅ N/A |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Gate verdict | ✅ PASS |
| [COMPLETION.md](COMPLETION.md) | Success criteria | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |
| [PIPELINE.md](PIPELINE.md) | Stage flow diagram | ✅ Complete |

---

## Pipeline (summary)

Recall → Intent → Isolate → Blueprint → Execute (+ Prove, Inspect) → Land → Remember

Full detail: [PIPELINE.md](PIPELINE.md) · machine-readable: [manifest.json](manifest.json)

---

## Relation to Phase 7

| Phase 7 | Phase 07.1 |
|---------|------------|
| Defines **boundary** — agent runtime stays external | Defines **workflow law** for external agents on this repo |
| MCP tools for memory | Forge **Recall/Remember** wraps those tools in mandatory stages |
| No planner in repo | Forge is process docs + Cursor skills — not runtime code |

Parent: [07-agent-runtime](../07-agent-runtime/README.md)

---

## Design drafts

Working intent/blueprint files: [`.ai/designs/drafts/`](../../designs/drafts/README.md)

Promote to phase `DESIGN.md` only after gate PASS on the feature itself.
