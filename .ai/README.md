# AI Operating System

**Purpose:** Single source of truth for all AI assistants working on this repository.  
**Rule:** `.ai/` is the **only** implementation authority. `docs/` is human documentation and must not override `.ai/`.

**Mandatory entry:** [constitution/INDEX.md](constitution/INDEX.md)

---

## Corpus layout

```
.ai/
├── constitution/          Immutable law + session index
├── decision-framework/    How AI makes engineering decisions
├── architecture/          Structural law + live phase status
├── standards/             Engineering, coding, naming, testing, docs, review
├── workflow/              Process gates + task template
├── ai-rules/              Module registry + Multi-AI communication protocol
├── roadmap/               Phase 1–10 evolution
├── glossary/              Canonical vocabulary
├── supplementary/         Security, performance, writing
├── TASK_PROMPT.md         Active scoped work (rotates per phase)
├── prompts/               Prompt library + entries/
├── phases/                Per-phase operational artifacts
├── checklists/            Pass/fail gates
├── playbooks/             Multi-step procedures
├── review/                Phase gate methodology
└── INDEX.md               Machine registry
```

---

## Human documentation (reference only)

| Path | Role |
|------|------|
| [docs/README.md](../docs/README.md) | Human doc index |
| [docs/PANDUAN.md](../docs/PANDUAN.md) | User guide (Indonesian) |
| [docs/adr/](../docs/adr/) | Architecture Decision Records |
| [docs/archive/](../docs/archive/) | Historical designs (read-only) |

---

## Authority hierarchy

```
Owner instruction
  → constitution/00-CONSTITUTION.md
  → decision-framework/13-AI-DECISION-FRAMEWORK.md
  → architecture/04-ARCHITECTURE.md
  → docs/adr/ (approved)
  → standards/*
  → ai-rules/11-AI-RULES.md
  → TASK_PROMPT.md
  → src/
```

---

*AI Operating System. Amend per [OWNERSHIP.md](OWNERSHIP.md).*
