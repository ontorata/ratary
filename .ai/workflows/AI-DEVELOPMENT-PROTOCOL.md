# AI Development Protocol

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 3 |
| **Applies to** | Cursor · Claude Code · any AI execution agent |
| **Authority** | [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md) |
| **Governance authority** | Human owner · ChatGPT (architecture/governance decisions) — not execution agents |

---

## Principle

> **AI is an accelerator, not a substitute for engineering control.**

Every AI-assisted change must leave the same evidence trail as human-authored work.

---

## Agent roles

| Role | Typical tool | May do | Must not |
|------|--------------|--------|----------|
| **Governance authority** | ChatGPT · human owner | Approve intent/blueprint/waves · ADR decisions · scope lock | Silent scope expansion via execution |
| **Execution agent** | Cursor · Claude Code | Implement approved scope · tests · docs sync · evidence | Redefine architecture · skip validation · merge without review |
| **Review agent** | Claude Code · human | Refactor within scope · code review · diagnose failures | Change locked boundaries without ADR |

---

## Mandatory workflow

```
1. Planning        — read repo docs; confirm wave scope; no assumed chat context
2. Implementation  — minimal diff; match conventions; no drive-by refactor
3. Validation      — npm test · npm run ci:governance (when code changes)
4. Evidence        — .ai/ + docs/ per CHANGE-EVIDENCE.md
5. Governance      — completion report · PR checklist · owner review
6. Commit          — single-intent message; no secrets; no --no-verify unless owner requests
```

Aligns with:

```
Change classification → Impact assessment → Code → Documentation sync → Validation → Completion report
```

---

## How AI agents should modify code

### Before coding

1. Read `.ai/INDEX.md` and wave/governance docs for active branch.
2. Validate task against **locked boundaries** (P0-A ADR-0001–0004).
3. Restate task and files to touch — **stop if scope ambiguous**.
4. For structural/multi-file work: Intent → Isolate → Blueprint (Agent Forge) when applicable.

### During coding

- One concern per commit.
- No changes to locked invariants without ADR (see [ARCHITECTURE-CHANGE-MAP.md](../core/governance/ARCHITECTURE-CHANGE-MAP.md)).
- Do not modify permission strings without ADR-0003 + [PERMISSION-CONTRACT.md](../core/governance/PERMISSION-CONTRACT.md).
- Do not weaken identity/isolation tests to make CI green.
- Comments in English; user-facing governance responses may be Indonesian per project rules.

### Before commit

| Check | Command / artifact |
|-------|-------------------|
| Tests | `npm test` |
| Identity | `npm run test:identity` (if auth/scope/transport touched) |
| Governance CI | `npm run ci:governance` (if any code change) |
| Docs / `.ai/` | Updated per impact check |
| Evidence | [CHANGE-EVIDENCE.md](./CHANGE-EVIDENCE.md) |
| Report | [COMPLETION-REPORT-TEMPLATE.md](../core/governance/COMPLETION-REPORT-TEMPLATE.md) or [IMPLEMENTATION-REPORT-TEMPLATE.md](./IMPLEMENTATION-REPORT-TEMPLATE.md) |

---

## Documentation update requirement

Implementation is **incomplete** until documentation is synchronized.

| Change type | Minimum docs |
|-------------|--------------|
| Code behavior | `docs/` if user-visible + `.ai/` if governance/architecture |
| Governance wave | `.ai/governance/waves/` + `.ai/reviews/` |
| Architecture | ADR + `ci:adr-impact` pass |
| AI workflow only | `.ai/workflows/` + checkpoint + proof |

`ci:docs-impact` fails when code changes without `docs/` or `.ai/` evidence (Wave 2).

---

## Evidence requirement

See [CHANGE-EVIDENCE.md](./CHANGE-EVIDENCE.md).

Minimum for code changes:

- Change summary
- Files changed
- Architecture impact
- Tests executed (with results)
- Governance artifacts updated
- Known risks
- Ready for merge: yes/no

Phase 4: evidence under `.ai/reviews/<package>/`.

---

## Forbidden actions

| Forbidden | Why |
|-----------|-----|
| Commit without evidence / doc sync | Violates completion protocol |
| Change identity/tenant/permission/transport without ADR | P0-A + Wave 1 locked |
| Alter permission contract strings silently | Security invariant |
| Force-push `main` / move lock tags | Release governance |
| Skip `ci:governance` on code PRs | Wave 2 contract |
| Assume prior chat context over repository | Source of truth = Git + `.ai/` |
| Agent runtime in `src/` | Agent Forge constitution |
| Scope creep / refactor outside wave | Forge discipline |

---

## Session boundaries

**Start:** Ratary recall (if MCP) → validate against repo → read [SESSION-HANDOFF.md](./SESSION-HANDOFF.md) if transitioning agents.

**End:** `save_memory` (handoff tag) + update `.ai/sessions/CURRENT.md` + implementation/completion report.

---

## Tool-specific notes

### Cursor

- Rules: `.cursor/rules/ontorata-execution-governance.mdc` · `agent-forge.mdc` · `ai-memory.mdc`
- Forge pipeline for non-trivial features: intent → isolate → blueprint → execute

### Claude Code

- Use repository handoff prompt; **do not** assume conversation history.
- Prefer: read `.ai/workflows/` → execute scoped task → produce Implementation Report → run validation.

### ChatGPT (governance authority)

- Wave approval · blueprint approval · architecture decisions recorded in `.ai/`
- Does not replace PR review or CI green gate.

---

## Related

- [SESSION-HANDOFF.md](./SESSION-HANDOFF.md)
- [CHANGE-EVIDENCE.md](./CHANGE-EVIDENCE.md)
- [CI-RULES.md](../governance/ci/CI-RULES.md)
