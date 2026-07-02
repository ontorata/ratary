# AI Engineering Standards

**Status:** Permanent project standard.  
**Audience:** AI assistants operating on this repository.  
**Authority:** Subordinate to [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md). Supersedes informal or conversational instructions when they conflict.

---

# Purpose

Define durable engineering rules that govern how AI assistants analyze, design, implement, test, and document changes in this repository.

Establish a single, model-agnostic contract so behavior remains consistent across tools, vendors, and future model generations.

Prevent architectural drift, scope creep, undocumented structural change, and incompatible shortcuts.

---

# Scope

## Covered

- Engineering principles and constraints
- Layer responsibilities and dependency rules
- Port-based extensibility requirements
- Change classification and decision criteria
- Quality, testing, documentation, and commit discipline
- Conflict resolution among instructions

## Not Covered

- Product vision and roadmap phase details → [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md), [ARCHITECTURE.md](ARCHITECTURE.md)
- Session workflow and pre-code analysis format → [ENGINEERING.md](ENGINEERING.md)
- Active task scope and deliverables → [TASK_PROMPT.md](TASK_PROMPT.md)
- Structural decision records → [ADR-POLICY.md](ADR-POLICY.md), [adr/](adr/)
- End-user setup and operations → [PANDUAN.md](PANDUAN.md)
- Language, framework, or vendor selection for new greenfield projects outside this repository

---

# Principles

1. **Layer integrity** — Dependencies flow inward. Outer layers orchestrate; inner layers persist and compute. Never invert control across boundaries.

2. **Single ownership** — Each concern has exactly one canonical module. Extend; do not duplicate or fork parallel implementations.

3. **Port before adapter** — Behavior that may vary by environment, vendor, or storage backend is defined behind an interface at the composition root.

4. **Additive evolution** — Prefer extending contracts over modifying or removing them. Breaking changes require explicit owner approval.

5. **Phase-aware design** — A change must remain valid for at least the next three planned capability phases. If a later phase would force a rewrite, stop and record an ADR.

6. **Fail closed on ambiguity** — When requirements, architecture, or authority conflict, halt implementation and request clarification. Do not guess.

7. **Evidence over assertion** — Claims about behavior, compatibility, or completion require tests, migrations, or documented verification.

8. **Minimal diff** — Solve the stated problem with the smallest correct change. Unrelated refactors are out of scope.

9. **No deferred debt markers** — Do not land placeholders, stubs, TODO comments, or FIXME comments as substitutes for finished work.

10. **Repository as system of record** — Durable rules live in versioned documents. Chat instructions do not override written standards.

---

# Standards

## Analysis

- Read, in order: constitution → architecture → engineering process → active task prompt → relevant ADRs → existing code in the affected area.
- Produce written impact analysis before code when the task touches more than one layer, any port, any schema, or any public contract.
- Map every change to a layer and a canonical owner before editing files.

## Layering

- **Edge layer** (routes, protocol handlers): input validation, authentication hooks, rate limits, response mapping. No business rules. No persistence access.
- **Application layer** (services, orchestrators): business rules, transaction boundaries, coordination across ports. No transport objects. No direct persistence queries.
- **Domain logic** (pure modules, engines): deterministic functions with explicit inputs and outputs. No I/O. No framework imports.
- **Persistence layer** (repositories, stores): storage access, mapping, owner-scoped queries. No business rules. No transport concerns.
- **Composition root** (server bootstrap, factories, scripts): sole location for concrete adapter instantiation.

## Ports and adapters

- Define interfaces for: persistence, external inference, vector storage, object storage, graph traversal, and identity when swap is anticipated.
- Keep vector, embedding, and blob operations out of metadata repositories.
- Inject adapters at the composition root; services depend on interfaces only.
- One adapter per port per runtime context unless an ADR defines composite behavior.

## Data and migrations

- Migrations must be idempotent and safe to re-run.
- Schema changes follow: add → backfill → index → deprecate. Never drop user data without an approved ADR and owner sign-off.
- Scope all tenant or owner data by identifier in every read, write, and delete path.
- Backfill jobs default to dry-run. Jobs must be idempotent and skippable when content hash is unchanged.

## Public contracts

- REST and protocol tool schemas are stable interfaces. Add fields and endpoints; do not rename or remove without approval.
- Cross-owner access attempts return not-found semantics; never leak existence across scopes.
- Display formatting belongs at the edge; canonical storage uses normalized formats.

## Security

- Secrets never appear in source, tests, or commits.
- Authentication and authorization decisions occur in designated modules; repositories enforce scope only.
- Audit sensitive identity and access events when the active phase requires it.

## Performance

- Caps, weights, and budgets live in configuration files, not inline literals.
- Optimize only with measured need or explicit task requirement.
- Designs must not assume a single storage engine when a port exists for substitution.

## Testing

- Every behavior change includes tests proportional to risk.
- Pure logic: unit tests. Persistence mapping: repository tests with test doubles. HTTP and protocol surfaces: integration or end-to-end tests.
- Test doubles must reflect schema and query behavior when storage shape changes.
- Test count must not decrease. Existing tests must pass before completion.

## Documentation

- Update architecture and user-facing docs when ports, phases, or public behavior change.
- Do not restate immutable constitution rules in other files; link instead.
- Mark ADR lifecycle state accurately: Proposed, Approved, Implemented, Superseded.

## Commits

- One concern per commit.
- Each commit passes the project quality gate.
- Reference ADR identifier in commit message when implementing structural decisions.

---

# Required

1. Read governing documents before editing.
2. Classify the task: bug fix, additive feature, contract change, or structural change.
3. Obtain an approved ADR before structural or boundary-changing work.
4. Identify the canonical owner module for each concern touched.
5. Preserve dependency direction and layer prohibitions.
6. Keep public contracts backward compatible unless owner explicitly approves breakage.
7. Add or update tests for all changed behavior.
8. Run the full quality gate before declaring completion: lint, format check, type check, test suite.
9. Update relevant documentation when architecture, ADR status, or user-visible behavior changes.
10. Deliver a completion report against the active task definition of done when the task scope is finished.
11. Stop and ask when instructions conflict with constitution, ADR policy, or an unapproved structural change.
12. Use the composition root for wiring concrete implementations.

---

# Forbidden

1. Bypassing layers (e.g., persistence calls from edge handlers, business rules in repositories).
2. Duplicating canonical logic in a second module or `*V2` class.
3. Embedding vendor SDK calls inside domain or persistence modules without a port.
4. Synchronous heavy inference on the critical CRUD path when the active phase defines async backfill.
5. Vector or similarity SQL inside metadata repositories when a vector store port exists.
6. Hard-deleting user memories unless an approved ADR and task explicitly require it.
7. Breaking, renaming, or removing public API or protocol fields without owner approval.
8. Committing secrets, credentials, or environment-specific tokens.
9. Landing TODO, FIXME, stub implementations, or dead code paths.
10. Implementing proposed ADRs before owner approval.
11. Scope expansion beyond the active task prompt without explicit approval.
12. Skipping tests, quality gate commands, or migration verification.
13. Subjective completion claims without executable verification.
14. God-module creation that merges unrelated concerns without an ADR.
15. Business logic in shared utility folders reserved for formatting and mapping.

---

# Decision Rules

## Task classification

| Signal | Classification | Action |
|--------|----------------|--------|
| Single-layer fix; no contract change | Bug fix / local refactor | Implement within layer rules; no ADR |
| New fields, endpoints, tools; same boundaries | Additive feature | Implement per task prompt; verify compatibility |
| Port split, storage swap, layer move, contract break | Structural change | ADR required before code |
| Unclear boundary impact | Unknown | Stop; analyze; write Proposed ADR if structural |

## Layer placement

| Question | If yes | Place in |
|----------|--------|----------|
| Parses HTTP or protocol input? | | Edge layer |
| Enforces business rule or workflow? | | Application layer |
| Pure calculation on in-memory data? | | Domain logic module |
| Reads or writes durable storage? | | Persistence layer |
| Instantiates concrete backend? | | Composition root |

## Port vs inline

| Condition | Decision |
|-----------|----------|
| Backend may change across phases or environments | Interface required |
| Single stable utility with no swap plan | May remain concrete if task and architecture agree |
| Third-party network or cloud API | Must be behind port with injectable client |
| Cross-cutting concern affecting multiple features | ADR before new port family |

## ADR gate

| State | AI action |
|-------|-----------|
| No ADR; structural need identified | Write Proposed ADR; stop |
| Proposed | Stop; request owner approval |
| Approved | Implement per ADR and task prompt |
| Implemented | Extend only within ADR decision; supersede via new ADR if pivot needed |

## Conflict resolution (priority order)

1. Explicit owner instruction in the current session
2. [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md)
3. Approved ADRs
4. This document
5. [ENGINEERING.md](ENGINEERING.md) process requirements
6. [ARCHITECTURE.md](ARCHITECTURE.md)
7. [TASK_PROMPT.md](TASK_PROMPT.md)
8. Conversational or tool-default suggestions

When two sources at the same level conflict, stop and ask the owner.

## Scope control

- Implement only what the active task prompt requires.
- Do not refactor unrelated modules.
- Do not rewrite working code unless required by the task or an approved ADR.

## Completion criteria

A task is complete only when: all definition-of-done items in the task prompt are satisfied; quality gate passes; tests cover changed behavior; documentation updates are merged where required; no forbidden patterns remain in the diff.

---

# Examples

## Good

- Add a method to an existing repository interface that was already specified in an approved ADR; implement in the concrete adapter and mock; add repository tests.
- Introduce a new optional field on a REST response; document it; retain all existing fields.
- Wire a new adapter at the composition root; inject the interface into the service constructor.
- Run backfill script in dry-run mode first; document execute flag in user guide.
- Single commit: "Add deleteByOwner to embedding store per ADR-003."

## Bad

- Call embedding API inside repository insert method.
- Create `MemoryServiceV2` to avoid modifying the existing service.
- Add vector similarity SQL to the metadata repository because it is faster for now.
- Remove an MCP tool parameter without owner approval.
- Merge structural port split without an ADR because "it is obvious."
- Commit with failing tests after adding `// TODO: fix later`.
- Expand task to redesign search because "while we are here."

---

# Checklist

Before writing code:

- [ ] Constitution, architecture, engineering process, and task prompt read
- [ ] Task classified (bug / additive / structural)
- [ ] ADR status verified for any boundary or storage change
- [ ] Canonical owner module identified for each concern
- [ ] Layer impact table completed
- [ ] Public contract impact assessed (none / additive / breaking)
- [ ] Test plan defined

Before commit:

- [ ] Diff limited to one concern
- [ ] No forbidden patterns in changed files
- [ ] Tests added or updated
- [ ] Mock or test doubles updated if schema changed
- [ ] Lint, format check, type check, and tests pass

Before task completion:

- [ ] Definition of done satisfied
- [ ] Documentation updated where required
- [ ] ADR marked Implemented if structural work shipped
- [ ] Completion report delivered per engineering process
- [ ] No secrets, TODO, FIXME, or stub code in deliverables
