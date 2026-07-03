# AI Brain — Documentation

**Purpose:** AI Brain is a Memory Foundation for AI agents.  
**Repository:** Memory storage, knowledge enrichment, retrieval, context, and MCP tools.  
**Not Included:** Agent planning, reasoning, execution, or orchestration (external).

---

## Structure

```
.ai/
├── 01-core/        # Constitution, architecture, glossary, rules
├── 02-standards/  # Engineering, coding, testing standards
├── 03-workflow/   # Development, prompts, playbooks, checklists
├── 04-phases/     # Phase documents (1-10)
├── 05-adr/        # Architecture Decision Records
├── 06-templates/  # Templates
└── README.md      # This file
```

---

## Quick Start

### For AI Assistants

```
1. Baca: 01-core/CONSTITUTION.md
2. Baca: 01-core/ARCHITECTURE.md
3. Baca: 01-core/GLOSSARY.md
```

### Before Any Implementation

```
1. Jalankan: 03-workflow/pre-implementation-gate.md
2. Verify: Constitution compliance
3. Verify: ADR compliance
```

---

## Phase Roadmap

| Phase | Status | Focus |
|-------|--------|-------|
| 1 | ✅ Complete | Foundation |
| 2 | ✅ Complete | Knowledge |
| 3 | ✅ Complete | Authorization |
| 4 | ✅ Complete | Intelligence |
| 5 | ✅ Complete | Embedding |
| 6 | ✅ Complete | Hybrid Retrieval |
| 7 | ✅ Complete | Agent Runtime Boundary |
| 8 | ✅ Ready | Knowledge Graph |
| 9 | 🔲 Future | Multi-AI |
| 10 | 🔲 Future | Enterprise |

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

## Core Rules

1. **AI Brain = Memory Foundation** — Not Agent Framework
2. **MCP/REST only** — No agent logic inside
3. **Clean Architecture** — Layers inward only
4. **Port Pattern** — Interfaces for swappable parts
5. **Additive First** — Never breaking changes

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [01-core/CONSTITUTION.md](01-core/constitution/00-CONSTITUTION.md) | Immutable rules |
| [01-core/ARCHITECTURE.md](01-core/architecture/04-ARCHITECTURE.md) | Layer patterns |
| [01-core/GLOSSARY.md](01-core/glossary/GLOSSARY.md) | Terminology |
| [04-phases/roadmap/09-ROADMAP.md](04-phases/roadmap/09-ROADMAP.md) | Phase timeline |

---

## Forbidden

AI Brain does NOT contain:

- Planner / Executor
- Workflow Engine
- Reasoning Engine
- Autonomous Loop
- Tool Orchestrator

These belong to external agent systems.

---

## Reading Order

1. Constitution
2. Architecture
3. Roadmap (current phase)
4. Phase Design
5. ADRs (if structural change)

---

*AI Brain — Memory Foundation for AI*
