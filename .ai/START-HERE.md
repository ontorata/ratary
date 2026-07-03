# AI Brain — Start Here

**ONE ENTRY POINT FOR ALL AI ASSISTANTS**

---

## Before Any Work

**Baca ini dulu:**

```
1. core/constitution/INDEX.md   — Mandatory entry index
2. core/constitution/00-CONSTITUTION.md  — Immutable rules
3. core/architecture/04-ARCHITECTURE.md — Layer patterns
4. core/glossary/GLOSSARY.md   — Terminology
```

---

## Structure

```
.ai/
├── START-HERE.md            ← YOU ARE HERE
├── core/                    ← Baca sekali (permanent rules)
│   ├── constitution/        — Constitution + INDEX
│   ├── architecture/        — Layer patterns, phase status
│   ├── standards/           — Engineering, coding, testing, etc.
│   ├── decision-framework/  — Decision procedure
│   ├── ai-rules/            — AI behavior rules
│   ├── glossary/            — Terminology
│   ├── supplementary/      — Security, performance, writing
│   ├── templates/           — ADR, task, completion templates
│   └── adr/                 — Architecture Decision Records
├── workflow/                ← Baca saat bekerja
│   ├── prompts/             — Prompt templates
│   ├── playbooks/           — Runbooks
│   ├── checklists/          — Decision, pre-merge, release
│   ├── communication/       — AI protocol
│   └── workflow/            — Development workflow
└── phases/                  ← Baca jika terkait phase
    ├── phases/              — Phase documents (01-10)
    ├── roadmap/             — Roadmap
    └── audits/              — Phase audits
```

---

## Quick Reference

| Kebutuhan | Lokasi |
|-----------|--------|
| Entry index | `core/constitution/INDEX.md` |
| Apa yang boleh diimplementasi | `core/constitution/00-CONSTITUTION.md` |
| Layer pattern | `core/architecture/04-ARCHITECTURE.md` |
| Terminologi | `core/glossary/GLOSSARY.md` |
| Prompt templates | `workflow/prompts/` |
| Checklist | `workflow/checklists/` |
| Phase saat ini | `phases/phases/` |

---

## Phase Status

| Phase | Status |
|-------|--------|
| 1 Foundation | ✅ Complete |
| 2 Knowledge | ✅ Complete |
| 3 Authorization | ✅ Complete |
| 4 Intelligence | ✅ Complete |
| 5 Embedding | ✅ Complete |
| 6 Hybrid Retrieval | ✅ Complete |
| 7 Agent Runtime | ✅ Complete |
| 8 Knowledge Graph | ✅ Ready |
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
   AI Brain
        │
        ▼
   Memory → Knowledge → Retrieval → Context
```

---

## Forbidden

AI Brain does NOT contain:

- ❌ Planner / Executor
- ❌ Workflow Engine
- ❌ Reasoning Engine
- ❌ Autonomous Loop
- ❌ Tool Orchestrator

These belong to external agent systems.

---

## Read Order

1. **Session Start** → Baca `core/constitution/INDEX.md`
2. **Before Implementation** → Baca `core/constitution/00-CONSTITUTION.md` + `core/architecture/04-ARCHITECTURE.md`
3. **During Work** → Gunakan `workflow/prompts/`
4. **Phase-specific** → Baca di `phases/phases/`

---

## Human Documentation

Human docs (not for AI implementation authority):
- [docs/README.md](../docs/README.md) — Human documentation index
- [docs/PANDUAN.md](../docs/PANDUAN.md) — Setup & usage guide

---

*AI Brain — Memory Foundation for AI*
