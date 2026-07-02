# 07 — Documentation Standard

**Status:** Permanent project standard.  
**Audience:** AI assistants and human maintainers.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [06-TESTING.md](../standards/06-TESTING.md).

---

# Purpose

Define what documentation must exist, where it lives, when it is updated, and what quality bar it must meet.

Ensure humans and AI assistants can onboard, implement, review, and operate the system without relying on chat history or tribal knowledge.

Prevent documentation drift, duplication of immutable rules, and contradictions between written artifacts and shipped behavior.

---

# Scope

## Covered

- README and repository entry documentation
- Architecture documentation (governance and operational)
- ADR authoring and lifecycle documentation
- API documentation and Swagger/OpenAPI
- Changelog policy
- Migration and operations documentation
- Phase design and archive documentation
- Diagrams and visual architecture artifacts

## Not Covered

- Immutable engineering law → [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) – [06-TESTING.md](../standards/06-TESTING.md)
- When to update docs in workflow → [05-WORKFLOW.md](../workflow/05-WORKFLOW.md) Documentation gate
- Code comments and JSDoc → [02-CODING.md](../standards/02-CODING.md)
- Test documentation → [06-TESTING.md](../standards/06-TESTING.md)
- End-user prose style for PANDUAN → [../PANDUAN.md](../../docs/PANDUAN.md) (reference example)

---

# Principles

1. **Single source of truth** — Each fact has one authoritative document. Others link; they do not copy.

2. **Hierarchy respected** — Governance standards (`00–07`) define law; operational docs describe current state; archive holds history.

3. **Docs are deliverables** — Documentation updates ship with the code change that triggers them — not as follow-up.

4. **No rule duplication** — Do not restate constitution or `00–07` standards in README, ADRs, or phase docs. Link instead.

5. **Audience-aware** — User docs (Indonesian, task-oriented) vs AI/governance docs (English, rule-oriented) vs API docs (schema-accurate).

6. **Accuracy over aspiration** — Document what is implemented. Planned work is labeled Proposed and lives in ADRs or TASK_PROMPT.

7. **Stable links** — Prefer relative markdown links within `docs/`. Do not link to chat or ephemeral URLs as authority.

8. **Diagrams clarify** — Use diagrams when structure or flow is hard to convey in prose; keep them maintained when architecture changes.

---

# Standards

## Document hierarchy

```
.ai/constitution/00-CONSTITUTION.md     immutable law
.ai/standards/01–08, 13                 permanent engineering standards
.ai/ai-rules/11-AI-RULES.md             module registry + AI protocol
.ai/glossary/GLOSSARY.md                canonical vocabulary (concepts only)
.ai/architecture/10-PHASE-STATUS.md     operational metrics and debt (mutable)
.ai/architecture/04-ARCHITECTURE.md     structural law (permanent)
.ai/workflow/05-WORKFLOW.md             workflow + pre-implementation analysis
.ai/TASK_PROMPT.md                      active scoped work
docs/adr/POLICY.md + docs/adr/          structural decisions (ADR text immutable)
docs/archive/                           historical phase designs (read-only)
docs/PANDUAN.md                         end-user guide (Indonesian)
README.md (root)                        public entry + quick start
docs/README.md                          human documentation index
.ai/README.md                           AI Operating System entry
```

**Conflict resolution:** Higher row wins. Update lower doc to match — never weaken upper doc in lower file.

## README

**Path:** `README.md` (repository root)

**Audience:** New developers and users discovering the project.

**Must contain:**

- Project name and one-paragraph purpose
- Link to [../PANDUAN.md](../../docs/PANDUAN.md) for daily use
- Tech stack summary
- Links to governance docs (`00-CONSTITUTION`, `ARCHITECTURE`, `ENGINEERING`, `TASK_PROMPT`)
- Phase roadmap table with status and doc links
- Quick start (minimal — defer detail to PANDUAN)
- Environment and migrate commands
- MCP setup pointer

**Must not contain:**

- Full API reference (use Swagger)
- Duplicated constitutional rules
- Phase implementation detail superseded by 10-PHASE-STATUS.md
- Secrets or real credentials

**Update triggers:**

- New public command or script in `package.json`
- New phase completed (roadmap row)
- Public API surface change (high-level mention + link)
- Default deployment URL change

**Language:** Mixed acceptable — user-facing sections may be Indonesian; technical labels English.

## Architecture docs

Two layers — do not merge:

| Document | Role | Update trigger |
|----------|------|----------------|
| [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) | Permanent structural law: layers, ports, flows | Layer boundary or port family change (owner approval) |
| [10-PHASE-STATUS.md](../architecture/10-PHASE-STATUS.md) | Operational snapshot: phase status, extension table, ops commands, debt | Every phase completion; port implementation; deployment change |

**10-PHASE-STATUS.md must include when applicable:**

- Target capability stack diagram (text or mermaid)
- Implemented phase table with status
- Project structure tree
- Dependency graph (REST + MCP)
- Extension points table (port → adapter → future)
- API surface summary (prefix, permissions)
- Deployment and ops command table
- Known technical debt table

**04-ARCHITECTURE.md must not include:**

- Live test counts
- Phase completion dates
- Vendor-specific deployment URLs

**Rules:**

- Phase status ✅ / 🔲 only in 10-PHASE-STATUS.md
- New port → update extension table in 10-PHASE-STATUS.md and port section in 04-ARCHITECTURE.md if structural

## ADR

**Policy:** [../adr/POLICY.md](../../docs/adr/POLICY.md)  
**Template:** [adr/000-template.md](../../docs/adr/000-template.md)  
**Index:** [adr/README.md](../../docs/adr/README.md)

**When to write:** Every structural change per ADR-POLICY. Proposed before code.

**Required sections (all):** Context, Problem, Constraints, Alternatives (≥2), Decision, Tradeoffs, Migration, Rollback, Impact on future phases.

**Naming:** `docs/adr/NNN-short-title.md` — three-digit sequence, kebab-case.

**Status lifecycle:** `Proposed` → `Approved` → `Implemented` → `Superseded`

**Rules:**

- Link to constitution and 04-ARCHITECTURE.md in Context — do not duplicate their rules
- Decision is one clear statement
- Migration section lists phased commits
- Update `adr/README.md` index on every new ADR or status change
- Mark **Implemented** when code merges, same PR or immediate follow-up
- Superseded ADRs link forward to replacement

**AI assistants:** Do not implement Proposed ADRs. Reference ADR id in structural commit messages.

## API docs

**Sources of truth (in priority order):**

1. Route handlers + Zod schemas in `src/routes/` and `src/types/`
2. Swagger/OpenAPI generated at runtime
3. README / ARCHITECTURE high-level summary

**Rules:**

- Request and response shapes are defined by Zod schemas — docs must not invent fields not in schema.
- Public prefix: `/api/v1`.
- Error shape: `{ error, message, details? }`.
- Permission requirements documented in route schema tags or 10-PHASE-STATUS.md endpoint table.
- MCP tools are not duplicated in REST Swagger — cross-reference MCP-SETUP or PANDUAN.

**Update triggers:**

- New endpoint → route schema tags + Swagger visibility
- New request/response field → Zod schema + integration test
- Breaking change → ADR + owner approval + changelog entry

## Swagger

**Implementation:** `src/plugins/swagger.ts` — Fastify Swagger + Swagger UI.

**Availability:**

- Local dev: enabled by default
- Production Vercel: disabled when `VERCEL` env set (serverless constraint)
- Tests: `skipSwagger` option in `buildApp`

**Standards:**

- Every public route registers `schema: { tags, summary }` in route definition.
- Tags match ARCHITECTURE API groupings: Health, Auth, Memory, Knowledge, Search, Backup, Context.
- `openapi.info.version` tracks API major version (`1.0.0` until breaking release).
- Security schemes document `X-API-Key` and Bearer.
- Do not hand-maintain separate OpenAPI YAML — generate from Fastify registration.

**Update triggers:**

- New route file or endpoint → add tag and summary
- New auth scheme → update `components.securitySchemes`

## Changelog

**Path:** `CHANGELOG.md` (repository root) — create when first release-tag workflow is adopted.

**Format:** [Keep a Changelog](https://keepachangelog.com/) — `## [Unreleased]` + `## [x.y.z] - YYYY-MM-DD`

**Categories:** Added, Changed, Deprecated, Removed, Fixed, Security

**Rules:**

- User-visible REST, MCP, CLI, and migration changes are logged
- Internal refactors with no external impact are omitted
- Breaking changes labeled **BREAKING** with migration instructions
- Link to ADR for structural entries
- Update on merge to main when owner requests release or version bump

**Until CHANGELOG.md exists:** Record phase completion in TASK_PROMPT completion report and 10-PHASE-STATUS.md phase table.

## Migration docs

**Sources:**

| Artifact | Documents |
|----------|-----------|
| `src/db/migrations.ts` | DDL functions, idempotent SQL |
| `scripts/migrate.ts` | Run order |
| `10-PHASE-STATUS.md` § deployment | `npm run db:migrate` |
| `PANDUAN.md` | User-facing migrate + backfill commands |
| ADR Migration section | Phased rollout, rollback |
| `tests/db/*-migration.test.ts` | Executable migration verification |

**Rules:**

- Every new migration function includes comment: phase id, purpose, idempotency note.
- Backfill scripts: document dry-run default and `--execute` flag in PANDUAN and ARCHITECTURE ops table.
- New env vars for migration/backfill → `.env.example` + PANDUAN + `env.ts` schema.
- Rollback steps live in ADR — not only in chat.
- Do not document destructive DDL without ADR and owner approval.

**Naming:** `migrate{Feature}{Phase}` per [03-NAMING.md](../standards/03-NAMING.md).

## Phase docs

| Document | Role | Lifecycle |
|----------|------|-----------|
| [../TASK_PROMPT.md](../TASK_PROMPT.md) | Active work, requirements, definition of done | Replaced from template when phase starts |
| [12-TASK-TEMPLATE.md](../workflow/12-TASK-TEMPLATE.md) | Blank phase template | Updated when process changes |
| `docs/archive/PHASE-*.md` | Historical design for completed phases | Write-once; append errata only |
| [archive/README.md](../../docs/archive/README.md) | Index of phase archives | Update when new archive added |

**Rules:**

- Active implementation follows TASK_PROMPT — not archive design directly (archive feeds ADRs).
- On phase completion:
  1. Mark phase ✅ in 10-PHASE-STATUS.md
  2. Complete TASK_PROMPT definition of done + completion report
  3. Update ADR statuses to Implemented
  4. Move or confirm design doc in `archive/` if not already there
  5. Copy [12-TASK-TEMPLATE.md](../workflow/12-TASK-TEMPLATE.md) → new TASK_PROMPT for next phase (when starting)
- Archive docs are **historical** — do not edit to reflect new architecture; add new ADR or ARCHITECTURE instead.
- Phase design docs may use Indonesian or English; governance docs (`00–07`) remain English.

## Diagrams

**When to use:**

- Layer dependency graphs
- Request flows (REST, MCP)
- Pipelines (retrieval, embedding backfill)
- Capability stack

**Formats (preference order):**

1. **Mermaid** in markdown — preferred for flows and layers in 10-PHASE-STATUS.md and 04-ARCHITECTURE.md
2. **ASCII** — acceptable for simple stacks in README or terminals
3. **External images** — avoid; they rot quickly unless versioned in `docs/assets/`

**Rules:**

- Diagram must match current architecture — update in same PR as structural change
- Label layers and ports consistently with 04-ARCHITECTURE.md vocabulary
- No implementation-specific class names in governance diagrams unless illustrating canonical example
- Keep diagrams small; split if more than 15 nodes

**Example locations:** 10-PHASE-STATUS.md §1 stack, 04-ARCHITECTURE.md capability stack, ADR Context sections.

---

# Required

1. Update documentation in the same merge as the behavior change when triggers apply.
2. Link to authoritative docs instead of copying immutable rules.
3. Keep 10-PHASE-STATUS.md phase and extension tables current.
4. Write ADR before structural implementation; update index and status on merge.
5. Add Swagger tag and summary for every new REST endpoint.
6. Document new scripts and env vars in PANDUAN and `.env.example`.
7. Add migration test and ops table entry for DDL changes.
8. Deliver TASK_PROMPT completion report when phase task finishes.
9. Use English for governance docs (`00–07`); PANDUAN for end-user Indonesian.
10. Mark planned work as Proposed — not as implemented.

---

# Forbidden

1. Duplicating `00-CONSTITUTION.md` or `00–07` content in README, ADRs, or comments.
2. Documenting unimplemented features as shipped.
3. Hand-maintaining OpenAPI YAML separate from Fastify schemas.
4. Editing archive phase docs to rewrite history for current architecture.
5. Removing ADR rollback or migration sections.
6. Documenting secrets, tokens, or real credentials.
7. Stale diagrams that contradict 04-ARCHITECTURE.md.
8. API docs that describe fields absent from Zod schemas.
9. Creating parallel architecture docs outside `docs/` hierarchy without owner approval.
10. Implementing without updating ADR status when structural work merges.
11. User-facing breaking changes without changelog or completion report note.
12. TASK_PROMPT scope living only in chat — not committed.

---

# Decision Rules

## Which document to update?

| Change | Update |
|--------|--------|
| New port or layer boundary | ADR + 04-ARCHITECTURE + ARCHITECTURE extension table |
| New adapter (no new port) | ARCHITECTURE extension table |
| Phase completed | ARCHITECTURE phase table + TASK_PROMPT report |
| New REST endpoint | Route schema + Swagger + API test; ARCHITECTURE if new permission group |
| New MCP tool | PANDUAN/MCP-SETUP mention; ARCHITECTURE if contract change |
| New npm script (user-facing) | README + PANDUAN + ARCHITECTURE ops |
| New env var | `.env.example` + PANDUAN + `env.ts` |
| DDL / migration | migrations.ts + migration test + ARCHITECTURE ops + PANDUAN if user runs it |
| Bug fix, no contract change | None unless misleading doc exists |
| Constitutional rule change | 00-CONSTITUTION only — owner approval |

## ADR vs archive phase doc?

| Need | Use |
|------|-----|
| Approval gate before coding | ADR |
| Historical design context | archive/PHASE-*.md |
| Active task scope | TASK_PROMPT.md |
| Permanent structural law | 04-ARCHITECTURE.md |

## README vs PANDUAN?

| Content | Location |
|---------|----------|
| GitHub first impression, quick start | README |
| Daily use, MCP setup, troubleshooting | PANDUAN |
| Developer governance links | README → docs/ |

## Swagger vs written API docs?

| Detail | Source |
|--------|--------|
| Field types, required/optional | Zod + Swagger |
| Permission model | 10-PHASE-STATUS.md |
| Example curl | README or PANDUAN |
| Error codes | 01-ENGINEERING + route behavior |

## Changelog entry needed?

| Change | Changelog |
|--------|-----------|
| New public endpoint or field | Yes |
| Breaking contract | Yes — BREAKING |
| Internal refactor | No |
| New backfill script users run | Yes |

---

# Examples

## Good

- Phase 5 merges → 10-PHASE-STATUS.md row ✅, ADR-003/004 → Implemented, PANDUAN backfill section added, TASK_PROMPT completion report with commit table.
- New `POST /api/v1/context` → Zod schema, route tag `Context`, `api/context.test.ts`, ARCHITECTURE endpoint row.
- ADR-001 Proposed → lists alternatives, rollback, phase impact — no code until Approved.
- 04-ARCHITECTURE.md links to 10-PHASE-STATUS.md for live status — does not duplicate test counts.

## Bad

- Paste full layer rules from constitution into README "for convenience."
- 10-PHASE-STATUS.md says Phase 6 complete while code has no vector source.
- New endpoint without Swagger tag.
- Migration drops column — documented only in PR chat, no ADR rollback.
- archive/PHASE-5 rewritten to match Phase 6 design.
- Swagger field documented that Zod schema does not include.

---

# Checklist

## Per PR / task

- [ ] Correct docs identified via decision table
- [ ] No duplication of 00–07 rules
- [ ] 10-PHASE-STATUS.md updated if ports/phases/ops changed
- [ ] ADR status/index updated if structural
- [ ] PANDUAN updated if user-visible
- [ ] `.env.example` updated if new env vars
- [ ] Swagger tags for new routes
- [ ] Migration test + ops docs if DDL
- [ ] Diagrams updated if flows changed
- [ ] TASK_PROMPT completion report if task done

## New ADR

- [ ] Uses 000-template.md
- [ ] All nine sections complete
- [ ] Listed in adr/README.md
- [ ] Status Proposed until owner approves

## Phase completion

- [ ] ARCHITECTURE phase table ✅
- [ ] ADRs → Implemented
- [ ] Archive index current
- [ ] TASK_PROMPT definition of done checked
- [ ] Completion report delivered
- [ ] README roadmap row updated

## New release (when adopted)

- [ ] CHANGELOG.md Unreleased section complete
- [ ] Version bumped in package.json / Swagger info if applicable
- [ ] REL gate from 05-WORKFLOW satisfied

---

*Inherits from [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [06-TESTING.md](../standards/06-TESTING.md). Amend only with project owner approval.*
