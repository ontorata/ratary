# AI Brain — Constitution

**Purpose:** Immutable rules for AI-assisted development.  
**Authority:** Highest priority. No exceptions without owner approval.

---

## Core Principle

AI Brain adalah **Memory Foundation**, bukan Agent Framework.

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
   Memory
   Knowledge
   Retrieval
   Context
```

---

## What AI Brain Owns

| Capability | Phase |
|------------|-------|
| Memory CRUD | 1+ |
| Knowledge enrichment | 2+ |
| Retrieval pipeline | 4+ |
| Embedding | 5+ |
| Hybrid retrieval | 6+ |
| MCP tools | 1+ |
| REST API | 1+ |
| Auth | 3+ |

---

## What AI Brain Does NOT Own

**FORBIDDEN inside `src/`:**

- Planner
- Executor
- Workflow Engine
- State Machine
- Task Scheduler
- Prompt Chain
- Autonomous Agent
- Loop
- Goal Manager
- Reflection Engine
- Reasoning Engine
- Tool Calling Pipeline
- Self Planning
- Decision Tree
- Auto Retry Agent
- Conversation Loop

**Agent frameworks yang DILARANG:**
- CrewAI
- LangGraph Runtime
- AutoGen Runtime
- DSPy Runtime

---

## Layer Rules

### All implementations must follow:

```
Controller → Service → Repository → D1
```

**FORBIDDEN:**
- Controller → Repository (skip service)
- Service → SQL (skip repository)

---

## MCP Boundary

| Allowed | Forbidden |
|---------|-----------|
| Call service methods | Business logic |
| HTTP → service mapping | Reasoning |
| Type transformation | Agent behavior |

MCP hanya boleh menjadi **adapter**.

---

## REST Boundary

| Allowed | Forbidden |
|---------|-----------|
| Expose API | Logic agent |
| HTTP routing | Prompt engineering |
| Schema validation | Planning |

REST hanya expose API.

---

## Future Compatibility

Semua perubahan harus kompatibel dengan:

| Phase | Focus |
|-------|-------|
| 8 | Knowledge Graph |
| 9 | Multi AI |
| 10 | Enterprise |

---

## Before Any Change

Jawab terlebih dahulu:

1. Layer mana yang berubah?
2. Mengapa perubahan diperlukan?
3. Apakah melanggar Constitution?
4. Apakah melanggar ADR?
5. Apakah backward compatible?
6. Apakah future compatible?

---

## Version Rules

| Version | Policy |
|---------|--------|
| Protocol | Major.Minor; minor additions only |
| API | `/api/v1/` prefix |
| ADR | Sequential `ADR-NNN` |
| Breaking changes | 12-month deprecation window |

---

## Enforcement

Jika ada request yang melanggar Constitution ini:

1. TOLAK dengan penjelasan
2. Kembalikan ke caller
3. Jangan implement

---

*Immutable. No exceptions without owner approval.*
