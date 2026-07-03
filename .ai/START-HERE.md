# AI Brain — Start Here

**ONE ENTRY POINT FOR ALL AI ASSISTANTS**

`.ai/` is **normative** — it defines how AI must work on this repository.  
`docs/` is **descriptive** — for humans only; never overrides `.ai/`.

---

## Before Any Work

Read in order:

| Step | Document |
|------|----------|
| 1 | [core/constitution/INDEX.md](core/constitution/INDEX.md) — mandatory index |
| 2 | [core/constitution/00-CONSTITUTION.md](core/constitution/00-CONSTITUTION.md) — immutable rules |
| 3 | [core/architecture/04-ARCHITECTURE.md](core/architecture/04-ARCHITECTURE.md) — layer patterns |
| 4 | [core/glossary/GLOSSARY.md](core/glossary/GLOSSARY.md) — terminology |

---

## Structure

```
.ai/
├── START-HERE.md              ← YOU ARE HERE
├── README.md                  ← AI OS overview
├── TASK_PROMPT.md             ← Active scoped work
│
├── core/                      ← Permanent rules (read once per session)
│   ├── constitution/          — Constitution + INDEX
│   ├── architecture/          — Structural law + phase status
│   ├── standards/             — Engineering, coding, testing, review, docs
│   ├── decision-framework/    — Decision procedure
│   ├── ai-rules/              — Module registry + AI communication
│   ├── glossary/              — Canonical vocabulary
│   ├── supplementary/         — Security, performance, writing
│   ├── templates/             — ADR, task, completion blanks
│   └── governance/            — Registry stubs → canonical files above
│
├── workflow/                  ← Use while working
│   ├── 05-WORKFLOW.md         — Development process gates
│   ├── 12-TASK-TEMPLATE.md    — Task prompt blank form
│   ├── prompts/               — Prompt library
│   ├── playbooks/             — Runbooks
│   ├── checklists/            — Decision, pre-merge, release
│   ├── communication/         — AI protocol stubs
│   └── review/                — Phase gate methodology
│
└── phases/                    ← Phase-specific evidence
    ├── 01-foundation/ … 10-enterprise/
    ├── roadmap/               — 09-ROADMAP.md
    └── audits/                — Phase audit records
```

**ADR canonical text:** [docs/adr/](../docs/adr/) (human-readable decision records; subordinate to `.ai/core/`).

---

## Quick Reference

| Need | Path |
|------|------|
| Entry index | `core/constitution/INDEX.md` |
| What may be implemented | `core/constitution/00-CONSTITUTION.md` |
| Layer / port law | `core/architecture/04-ARCHITECTURE.md` |
| Live metrics & debt | `core/architecture/10-PHASE-STATUS.md` |
| Terminology | `core/glossary/GLOSSARY.md` |
| Prompt templates | `workflow/prompts/` |
| Checklists | `workflow/checklists/` |
| Current phase docs | `phases/08-knowledge-graph/` (implementation complete) |
| Active task | `TASK_PROMPT.md` |

---

## Phase Status

Source of truth: [phases/roadmap/09-ROADMAP.md](phases/roadmap/09-ROADMAP.md)

| Phase | Status |
|-------|--------|
| 1 Foundation | ✅ Complete |
| 2 Knowledge (2.5 + 2.6) | ✅ Complete |
| 3 Authorization | ✅ Complete |
| 4 Memory Intelligence | ✅ Complete |
| 5 Embedding | ✅ Complete |
| 6 Hybrid Retrieval | ✅ Complete |
| 7 Agent Runtime | ✅ Complete |
| 8 Knowledge Graph | 🟡 **Gate pending** (implementation complete) |
| 9 Multi-AI | 🔲 Future |
| 10 Enterprise | 🔲 Future |

---

## Layer Boundary

```
External Agent Runtime
        │
        ▼
   MCP / REST
        │
        ▼
   AI Brain (this repo)
        │
        ▼
   Memory → Knowledge → Retrieval → Context
```

---

## Forbidden Inside This Repo

- ❌ Planner / Executor
- ❌ Workflow Engine
- ❌ Reasoning Engine
- ❌ Autonomous Loop
- ❌ Tool Orchestrator

These belong to **external** agent systems (Phase 7+ boundary).

---

## Read Order

1. **Session start** → `core/constitution/INDEX.md` (full chain through roadmap)
2. **Before implementation** → constitution + architecture + relevant ADR
3. **During work** → `workflow/prompts/` + `TASK_PROMPT.md`
4. **Phase-specific** → `phases/NN-name/`

---

## Human Documentation

Not implementation authority for AI:

- [docs/README.md](../docs/README.md) — human doc index
- [docs/PANDUAN.md](../docs/PANDUAN.md) — setup & usage (Indonesian)

---

*AI Brain — Memory Foundation for AI*
