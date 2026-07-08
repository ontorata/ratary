# Session Handoff — Cross-Agent Continuity

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 3 |
| **Primary memory** | Ratary MCP (`save_memory` / `search_memory` tags: `handoff`) |
| **Audit trail** | [.ai/sessions/CURRENT.md](../sessions/CURRENT.md) |
| **Repository** | Source of truth — always validate against Git + `.ai/` |

---

## Purpose

Enable transitions between **Cursor · Claude Code · ChatGPT · human engineer** without losing operational context.

> Chat history is not authoritative. Repository documents are.

---

## Handoff format (mandatory sections)

Copy into Ratary `save_memory`, PR comment, or agent prompt:

```markdown
## Handoff — YYYY-MM-DD

### Current state
- Branch:
- Baseline tag / commit:
- Active wave / milestone:
- Lock tags on branch:

### Completed work
- Commits (hash + one line):
- Artifacts created/updated:
- Tests last run + result:

### Pending work
- Next wave or task:
- Blockers:

### Known constraints
- Locked boundaries (ADR / tags):
- Non-goals for next task:
- CI requirements:

### Next action
- Single concrete step for receiving agent:
```

---

## Session start (receiving agent)

1. **Ratary** — `search_memory` project `ontorata`/`ratary` tags `handoff` · `phase-4`
2. **Repository** — `git status` · `git log -3` · active branch
3. **Governance** — read `.ai/governance/releases/` for P0-A/P0-B status
4. **Wave** — read latest `.ai/governance/waves/WAVE-*` checkpoint
5. **Fallback** — `.ai/sessions/CURRENT.md`
6. **Restate task** before editing

---

## Session end (sending agent)

1. **Ratary** — `save_memory` with handoff tags
2. **CURRENT.md** — update audit trail (secondary)
3. **Evidence** — wave proof if implementation completed
4. **Report** — Implementation or Completion Report attached

---

## P1-A handoff trace standard (Org Memory Dogfood)

For P1-A sessions, handoff must also record an MCP interaction chain:

```
session_id
   -> handoff_id
      -> ingestion_run_id
         -> recall_run_id
            -> evidence_run_id
               -> ratary_codename
```

### Recommended command

```bash
npm run trace:org-memory-handoff -- --ratary-codename TASK-XXXX
```

Defaults:

- `ingestion_run_id` = latest from `.ai/reviews/org-memory-dogfood/ingestion-log.md`
- `recall_run_id` = latest from `.ai/reviews/org-memory-dogfood/recall-log.md`
- `evidence_run_id` = `recall_run_id` unless overridden

Trace output path:

- `.ai/reviews/org-memory-dogfood/mcp-interaction-log.md`

This keeps session evidence searchable without manual stitching across logs.

---

## Recommended multi-agent pipeline

```
┌─────────────────────────────────────────────────────────┐
│ ChatGPT — Governance authority                          │
│ Wave approval · ADR · scope lock · next wave decision   │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Cursor — Execution agent                                │
│ Implement · test · docs · Generate Implementation Report│
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Claude Code — Execute / Review / Refactor               │
│ Scoped execution · validation · evidence update           │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Human — Merge · release · remote verification           │
└─────────────────────────────────────────────────────────┘
```

Use [IMPLEMENTATION-REPORT-TEMPLATE.md](./IMPLEMENTATION-REPORT-TEMPLATE.md) at Cursor → Claude boundary.

---

## Claude Code entry prompt (minimal)

```
Continue Ontorata/Ratary work on branch <branch>.
Do not assume chat context. Read .ai/workflows/ and latest wave checkpoint.
Task: <single scoped task>.
Run npm run ci:governance before claiming complete.
Produce Implementation Completion Report.
```

Full handoff: attach completed **Handoff** section + link to proof artifacts.

---

## What not to hand off via chat alone

| Item | Use instead |
|------|-------------|
| Architecture decisions | ADR in `.ai/core/architecture/` |
| Wave completion | Lock tag + `WAVE-N-*.md` |
| Test proof | `*-proof.md` in `.ai/reviews/` |
| Permission changes | ADR-0003 + PERMISSION-CONTRACT |

---

## Related

- [AI-DEVELOPMENT-PROTOCOL.md](./AI-DEVELOPMENT-PROTOCOL.md)
- [SESSION-BOOTSTRAP.md](../core/governance/SESSION-BOOTSTRAP.md)
- [.ai/sync/README.md](../sync/README.md)
