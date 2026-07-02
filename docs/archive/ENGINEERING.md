# Principal Engineer — Development Process

**Role:** Evolve architecture while preserving Clean Architecture, SOLID, backward compatibility, extensibility, multi-tenant readiness, and the AI Brain roadmap.

**Not the goal:** "Make the code work" at the cost of structure.

---

## Before starting

Read completely — **do not assume**:

| # | Document | Purpose |
|---|----------|---------|
| 1 | [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md) | Immutable rules |
| 2 | [ARCHITECTURE.md](ARCHITECTURE.md) | Structure, layers, extension points |
| 3 | [TASK_PROMPT.md](TASK_PROMPT.md) | Current phase work only |
| 4 | [PANDUAN.md](PANDUAN.md) | User-facing behavior & ops |
| 5 | Phase design in [archive/](archive/) | Historical design context |
| 6 | Existing implementation | Inspect `src/` — verify against docs |

If a task conflicts with the constitution → **stop and ask**.

---

## Project state

| Phase | Status |
|-------|--------|
| 1 Foundation | ✅ |
| 2 / 2.5 / 2.6 | ✅ |
| 3 Authorization | ✅ |
| 4 Memory Intelligence | ✅ |
| 5 Embedding | 📋 [TASK_PROMPT.md](TASK_PROMPT.md) |
| 6 Hybrid Retrieval | 🔲 |
| 7 Agent Runtime | 🔲 |
| 8 Knowledge Graph | 🔲 |
| 9 Multi AI | 🔲 |
| 10 Enterprise | 🔲 |

---

## Development objective

- Implement **only** the requested feature.
- **Never** redesign unrelated modules.
- **Never** rewrite working code.
- **Prefer extension** over modification.
- **Preserve** public REST and MCP contracts.

Structural changes → approved [ADR](ADR-POLICY.md) first.

---

## Required analysis (before any code)

Produce all eight sections below. **No implementation until analysis is complete.**

### 1. Current architecture

Where does this feature belong in the layer stack? Which canonical owner from the constitution?

### 2. Layer impact

| Layer | Impact |
|-------|--------|
| `routes/` | |
| `controllers/` | |
| `services/` | |
| `repositories/` | |
| `memory/` | |
| `knowledge/` | |
| `search/` | |
| `mcp/` | |
| Database | |

### 3. Dependencies

- What new dependencies are introduced?
- Can they be abstracted behind ports?
- Should they become interfaces (`I*`)?

### 4. Storage impact

- Schema changes?
- Migration (idempotent, `ALTER` preferred)?
- Backfill?
- Indexes?
- Rollback plan?

### 5. API impact

- New endpoint?
- Modified endpoint?
- Breaking change? (must be **no** without owner approval)
- Response backward compatibility?

### 6. MCP impact

- New tool needed?
- Existing tools affected?

### 7. Future compatibility

| Phase | Helps? | Explain |
|-------|--------|---------|
| 5 Embedding | | |
| 6 Hybrid | | |
| 7 Agent Runtime | | |
| 8 Knowledge Graph | | |
| 9 Multi AI | | |
| 10 Enterprise | | |

### 8. Risks

- Performance
- Security
- Migration
- Scalability
- Maintainability

---

## Layer rules (summary)

Full rules: [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md) §2–7.

```
routes → controllers → services | memory/ | knowledge/ | search/ | auth/
                              → repositories → storage
MCP → mcp/server.ts → same services
```

| Layer | Owns | Never |
|-------|------|-------|
| `routes/` | Validation, rate limits | Business logic, SQL |
| `controllers/` | HTTP status, response mapping | SQL, auth logic |
| `services/` | Orchestration, business rules | HTTP, SQL |
| `repositories/` | SQL, persistence, mapping | Business rules, ranking, HTTP |
| `knowledge/` | Pure generators + `KnowledgeService` | Direct repo access (except via orchestrator) |
| `search/` | `SearchService` orchestrates; `RankingEngine` pure | Repo, D1, HTTP in engine |
| `memory/` | Retrieval, context, prompt, consolidation | SQL |

---

## Database rules

- Migrations: **idempotent**, backward compatible, zero-downtime intent.
- Prefer `ALTER TABLE` — never recreate tables, never lose user data.
- Phased: add columns → backfill → indexes.
- Archive memories — **never hard-delete**.

---

## API & MCP rules

- Existing APIs and MCP tools **must keep working**.
- Prefer **additive** changes (new fields, new tools, new endpoints).
- No renamed fields, removed endpoints, or broken tool schemas without owner approval.

---

## Performance

- No premature optimization.
- No D1-only assumptions that block Postgres / vector / object store.
- Caps and weights in config files — **no magic numbers**.

---

## Testing requirements

Every implementation includes tests appropriate to the change:

| Type | When |
|------|------|
| Unit | Pure logic, providers, engines |
| Repository | SQL, mapping, owner scope |
| Service | Orchestration, rules |
| API | Route + auth + response shape |
| Integration | Cross-layer flows |
| Regression | Existing behavior unchanged |

Update **MockD1** when schema changes.

---

## Documentation updates

When architecture or public behavior changes, update:

| Document | When |
|----------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Ports, layers, deployment, phase status |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Definition of done, commit plan |
| [PANDUAN.md](PANDUAN.md) | User-visible setup or usage |
| [archive/](archive/) or [adr/](adr/) | Phase design or structural decision |
| [README.md](../README.md) | Public API surface change |

Do **not** duplicate immutable rules outside the constitution.

---

## Quality gate

Complete only when **all** pass:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
```

Plus, when applicable:

- Migration runs cleanly
- Backfill script tested (dry-run default)
- No `TODO`, `FIXME`, or dead code
- ADR status updated if structural

---

## Output format (mandatory)

Every implementation response **must** use this structure **before** writing code:

```markdown
## Requirement Understanding

## Architecture Impact

## Design Decision

## Files To Change

## Implementation Plan

## Risks

## Compatibility

## Test Plan
```

After analysis is approved (or scope is unambiguous), proceed commit-by-commit per [TASK_PROMPT.md](TASK_PROMPT.md).

When the task is **complete**, deliver a **final completion report** using the same analysis sections plus the **Definition of done** checklist from TASK_PROMPT.

### TASK_PROMPT structure

Active work in [TASK_PROMPT.md](TASK_PROMPT.md) follows:

```
# TASK          → what to implement (one clear scope)
Requirements    → functional reqs, ADR gates, future compatibility
Constraints     → constitution, backward compat, forbidden patterns
Expected deliverables → code, tests, migration, docs, completion report
```

New phases: copy [TASK_PROMPT.template.md](TASK_PROMPT.template.md).

---

## Document hierarchy

```
AI_BRAIN_CONSTITUTION.md   immutable rules
ARCHITECTURE.md            structure & extension points
ENGINEERING.md             this file — process & analysis
TASK_PROMPT.md             current phase work
ADR-POLICY.md → adr/       structural decisions
```
