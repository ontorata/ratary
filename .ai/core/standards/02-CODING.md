# 02 — Coding Style

**Status:** Permanent project standard.  
**Audience:** AI assistants operating on this repository.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) and [01-05-WORKFLOW.md](01-05-WORKFLOW.md). Tool configuration enforces a subset of these rules automatically.

---

# Purpose

Define consistent code style rules that apply to all source files in this repository.

Reduce cognitive load for AI assistants and maintainers by enforcing predictable structure, naming, and expression patterns across modules and phases.

Prevent style drift, hidden complexity, and unreadable diffs that obscure architectural intent.

---

# Scope

## Covered

- Formatting and file layout
- Function and class size limits
- Composition versus inheritance
- Immutability and pure functions
- Constants and magic numbers
- Comments and documentation in code
- Error-handling expression style
- Async and concurrency style
- Naming conventions
- Code smells and refactoring rules

## Not Covered

- Layer boundaries and dependency law → [01-05-WORKFLOW.md](01-05-WORKFLOW.md)
- Constitutional and architectural law → [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md)
- Pre-code analysis workflow → [05-WORKFLOW.md](../workflow/05-WORKFLOW.md)
- Lint and format command definitions → project `package.json` scripts
- Active task scope → [../../TASK_PROMPT.md](../../TASK_PROMPT.md)

---

# Principles

1. **Clarity over cleverness** — Code is read more than written. Prefer obvious structure over compact tricks.

2. **Small surface area** — Functions and classes expose minimal responsibility. Size limits are soft caps; exceed only with justification.

3. **Composition by default** — Build behavior by combining modules and injected ports. Inheritance is for interface implementation only.

4. **Immutability at boundaries** — Inputs are not mutated unless mutation is the explicit purpose of the function.

5. **Pure where possible** — Side-effect-free logic is isolated and testable without mocks.

6. **Named meaning** — Identifiers and constants encode intent. Numeric and string literals in business logic require names.

7. **Comments explain why** — Comments document non-obvious decisions, invariants, and constraints — not what the code already states.

8. **Explicit async** — Asynchronous control flow is visible. Hidden concurrency and floating promises are defects.

9. **Consistent vocabulary** — The same concept uses the same name across layers, files, and tests.

10. **Refactor in scope** — Improve code touched by the task; do not expand into unrelated style crusades.

---

# Standards

## Formatting

- Project formatter is authoritative. Run format check before commit.
- Indentation: 2 spaces. No tabs.
- Line length target: 100 characters. Break long expressions at logical boundaries.
- Strings: single quotes in source. Template literals for interpolation.
- Semicolons: required.
- Trailing commas: required in multiline lists and objects.
- Imports: grouped — external packages, then internal absolute/relative. One blank line between groups.
- Exports: prefer named exports. Default export only for framework entrypoints that require it.
- File layout order: imports → types → constants → implementation → exports not already inline.
- One primary type or class per file unless tightly coupled helpers are private to that module.

## Function size

- Target: **≤ 40 lines** per function (excluding blank lines and comments).
- Hard cap: **60 lines**. Exceeding requires splitting or extracting helpers in the same commit.
- One function performs one operation at one abstraction level.
- Parameter count target: **≤ 4**. Exceeding requires parameter object or split function.
- Nesting depth target: **≤ 3** levels. Use guard clauses and early return to flatten.
- Boolean parameters that change behavior are discouraged; prefer two named functions.

## Class size

- Target: **≤ 200 lines** per class (excluding blank lines and comments).
- Hard cap: **300 lines**. Exceeding requires split by responsibility or ADR for god-class remediation.
- One public class per file for services, repositories, and controllers.
- Class methods follow function size rules.
- Private methods ordered below public methods.
- State: minimize mutable instance fields. Prefer constructor-injected dependencies over mutable properties.

## Composition vs inheritance

- **Prefer composition:** services contain port references; functions accept dependencies as parameters.
- **Inheritance permitted for:** implementing port interfaces (`implements I*`), extending typed error base classes, framework plugin registration patterns required by the host.
- **Inheritance forbidden for:** code reuse between unrelated domains, sharing logic across layers, avoiding duplication of business rules.
- **No deep hierarchies:** maximum inheritance depth of one (class implements interface or extends single base error type).
- Extract shared pure logic into standalone functions or domain modules — not base classes.

## Immutability

- Do not mutate function parameters unless the function name and contract explicitly indicate mutation (e.g., `sortInPlace` — avoid; prefer returning new value).
- Prefer `const` for all bindings. Use `let` only when reassignment is required.
- Return new objects and arrays from pure transforms. Use spread or explicit copy.
- Domain types passed between layers are treated as immutable at the application boundary.
- Configuration objects loaded at startup are not mutated after validation.

## Pure functions

- Pure function: same inputs always produce same outputs; no I/O, no mutation of external state, no time/random/env reads.
- Ranking, scoring, normalization, hashing, text building, and mapping belong in pure functions.
- Pure functions live in domain modules with no framework imports.
- Pure functions are fully covered by unit tests without mocks.
- Mark impure boundaries explicitly: repository calls, HTTP, filesystem, `Date.now()`, randomness.

## Constants

- Named constants use `UPPER_SNAKE_CASE` for module-level immutable values tied to domain or config.
- Config caps and weights live in dedicated `*.config.ts` modules — not scattered literals.
- Enum-like fixed sets use `as const` objects or union types — not bare string repetition.
- Constants are defined at the narrowest scope that satisfies reuse: block → module → config file.
- Export constants only when consumed outside the module.

## Magic numbers

- A magic number is any numeric literal in business logic without named meaning.
- **Forbidden** in: services, domain logic, controllers, repositories (except SQL limit parameters bound to named constants).
- **Permitted without naming:** `0`, `1`, `-1` in obvious loop/index/array contexts; `100` for percentage only when domain-standard.
- Pagination defaults, batch sizes, timeouts, retry counts, score weights, character budgets → named constants.
- SQL `LIMIT` and `OFFSET` arguments must reference named constants or parameters.

## Comments

- **Write comments for:** non-obvious business rules, performance constraints, security invariants, compatibility shims, spec deviations approved by ADR.
- **Do not comment:** obvious code, commented-out code, change history (use git), TODO/FIXME (forbidden as deliverables).
- Use block comments sparingly above functions only when behavior is not inferable from name and types.
- No narrative comments inside every line.
- Public port interfaces may document preconditions, scope requirements, and side effects in JSDoc — concise, factual.
- Comments must remain accurate after edit. Stale comments are removed or updated in the same commit.

## Error handling (style)

- Throw typed errors. Do not return `null` for error conditions in services.
- Do not use generic `Error` for expected domain failures.
- Catch only to: wrap with context, translate to typed error, or release resources. Re-throw or map — never swallow.
- Error messages are factual and user-safe. No stack fragments in message strings.
- Avoid error-driven control flow for non-error branches (e.g., try/catch for parsing when validation schema exists).
- Async functions throw; they do not return `{ success: false }` unless that pattern is the established port contract.

## Async

- All I/O functions are `async`. Do not mix callback and promise patterns.
- Always `await` promises or explicitly `return` them. No floating promises.
- Use `Promise.all` for independent parallel I/O. Use sequential `await` when order or resource limits matter.
- Batch jobs process in configurable chunk sizes — not unbounded `Promise.all` on full dataset.
- Async iteration for streams and large sets when memory-bound.
- Do not use `async` on functions with no `await` unless required by interface contract.
- Scripts: top-level await permitted in CLI entry modules.

## Naming consistency

| Element | Convention | Example |
|---------|------------|-----------|
| Files | kebab-case | `memory.service.ts`, `ranking.engine.ts` |
| Classes | PascalCase | `MemoryService`, `NotFoundError` |
| Interfaces | `I` prefix + PascalCase | `IMemoryRepository` |
| Functions, methods | camelCase | `findById`, `applyBackfill` |
| Variables, parameters | camelCase | `ownerId`, `contentHash` |
| Constants | UPPER_SNAKE_CASE | `SEARCH_CANDIDATE_CAP` |
| Types, enums | PascalCase | `MemoryScope`, `StoredEmbedding` |
| Boolean | `is`, `has`, `can`, `should` prefix | `isArchived`, `hasEmbedding` |
| Async | no `Async` suffix | `findById` not `findByIdAsync` |
| Repositories | noun + `Repository` | `MemoryRepository` |
| Services | noun + `Service` | `MemoryService` |
| Ports | adjective/noun + role | `IEmbeddingProvider`, `IEmbeddingStore` |
| Tests | describe unit; `should` or imperative phrase | `should return null when not found` |

- Same entity uses same term across layers: `ownerId` not `userId` in one file and `owner_id` in domain (map at persistence boundary only).
- Avoid abbreviations except established domain terms: `id`, `url`, `api`, `jwt`, `mcp`.

## Code smells

| Smell | Definition | Response |
|-------|------------|----------|
| Long function | > 60 lines | Extract helpers |
| Long class | > 300 lines | Split by responsibility or ADR |
| God module | Unrelated exports in one file | Split files |
| Feature envy | Method uses another module's data more than its own | Move function |
| Primitive obsession | Bare strings for domain concepts | Introduce type |
| Shotgun surgery | One change touches many unrelated files | Consolidate ownership |
| Duplicate logic | Same algorithm in two modules | Extract to canonical owner |
| Dead code | Unreachable or unused export | Remove |
| Boolean trap | `doThing(true, false)` | Named functions or options object |
| Nested ternary | > 1 level | `if` or lookup table |
| Console logging in library code | `console.log` in service/domain | Throw or let edge log |
| Any type | `any` annotation | Proper type or generic |

## Refactoring guidelines

- Refactor only code in the task's blast radius unless owner approves broader scope.
- Refactor in commits separate from behavior change when possible: one commit refactor (no behavior change), next commit feature.
- When refactor and feature cannot separate, tests must prove behavior unchanged before and after.
- Extract function before extract class.
- Rename for clarity in dedicated commit when rename is wide-ranging.
- Do not refactor and add feature in ways that obscure review.
- After extract, delete the old duplicate — no commented legacy path.
- Repository refactors preserve query semantics; add regression tests first.
- Performance refactor requires measured baseline or explicit task NFR.

---

# Required

1. Run formatter and linter before commit.
2. Keep functions ≤ 60 lines and classes ≤ 300 lines unless split is infeasible in current task — then split.
3. Use `const` by default; avoid parameter mutation.
4. Extract pure logic into testable functions without I/O.
5. Name all non-trivial numeric literals used in business logic.
6. Place caps and weights in config modules.
7. Use typed errors; no swallowed exceptions.
8. Await or return all promises explicitly.
9. Follow naming table for new files, types, and identifiers.
10. Remove dead code and unused imports in touched files.
11. Update or delete comments affected by the change.
12. Prefer composition and interface implementation over class inheritance for reuse.

---

# Forbidden

1. `any` type except where external library provides no types and wrapper is in adapter — document with narrow cast at boundary only.
2. `// @ts-ignore` or `eslint-disable` without owner approval and inline justification.
3. TODO, FIXME, HACK, XXX comments in committed code.
4. Commented-out code blocks.
5. `console.log` in services, repositories, or domain modules (scripts and composition root excepted).
6. Magic numbers in business logic.
7. Functions exceeding 60 lines without extraction.
8. Classes exceeding 300 lines without split plan.
9. Deep inheritance chains for behavior reuse.
10. Mutating shared objects passed across layer boundaries without explicit contract.
11. Floating promises (unhandled async).
12. `async` functions with empty `try/catch` that swallow errors.
13. Inconsistent naming for the same domain concept within a module.
14. Default exports for domain modules (non-framework).
15. Hungarian notation and redundant type prefixes (`strName`, `IUserInterface`).
16. Empty blocks (`if (x) {}`).
17. Refactoring unrelated modules during feature tasks without approval.

---

# Decision Rules

## Function split

| Condition | Action |
|-----------|--------|
| Function > 40 lines | Consider extract at next logical block |
| Function > 60 lines | Must extract before merge |
| > 4 parameters | Introduce options type |
| Nesting > 3 | Guard clauses or extract |
| Two abstraction levels mixed | Extract lower level to helper |

## Class split

| Condition | Action |
|-----------|--------|
| Class > 200 lines | Review responsibilities |
| Class > 300 lines | Split or ADR |
| Class name contains `And` or `Manager` | Suspect SRP violation — rename or split |
| Multiple unrelated public method groups | Split by bounded context |

## Composition vs inheritance

| Need | Use |
|------|-----|
| Implement port contract | `implements I*` |
| Share pure algorithm | Standalone function |
| Share orchestration | Injected service |
| Extend error taxonomy | Extend base error class |
| Framework requires subclass | Minimal subclass at edge only |

## Constant placement

| Scope | Location |
|-------|----------|
| Used in one function | `const` at top of function |
| Used in one module | Module-level `const` |
| Tunable operational cap | `*.config.ts` |
| Environment-specific | Env schema with default |

## Comment decision

| Situation | Comment? |
|-----------|----------|
| Function name + types express behavior | No |
| SQL or query order matters for correctness | Yes — why |
| Public API security or scope precondition | Yes — JSDoc |
| Temporary workaround | No — fix or ADR |
| Complex algorithm with invariant | Yes — invariant only |

## Async pattern

| Situation | Pattern |
|-----------|---------|
| Independent I/O | `Promise.all` |
| Dependent steps | Sequential `await` |
| Large batch | Chunked loop with `await` per chunk |
| Optional parallel cap | Config-driven concurrency limit |
| Sync pure transform | No `async` |

## Refactor scope

| Situation | Allowed |
|-----------|---------|
| File must change for task | Style fix in that file |
| Smell blocks correct feature | Minimal refactor same PR |
| Widespread rename | Dedicated commit |
| Unrelated module smell | Defer unless owner approves |

---

# Examples

## Good

```typescript
const SEARCH_CANDIDATE_CAP = 500;

export function rankMemories(candidates: SearchCandidate[], query: string): RankedMemory[] {
  const normalized = normalizeQuery(query);
  return candidates
    .map((c) => ({ memory: c, score: computeScore(c, normalized) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, SEARCH_CANDIDATE_CAP);
}
```

- Named cap constant.
- Pure function.
- No mutation of `candidates`.
- Single responsibility.

```typescript
async findById(id: string, ownerId: string): Promise<Memory | null> {
  const rows = await this.db.query<MemoryRow>(
    `SELECT id, title FROM memories WHERE id = ? AND owner_id = ?`,
    [id, ownerId],
  );
  const row = rows[0];
  return row ? mapRowToMemory(row) : null;
}
```

- Scoped query.
- Short method.
- Maps at boundary.

## Bad

```typescript
async function handle(x: any) {
  // check if valid
  if (x.t.length > 0) {
    try {
      const r = await db.query('SELECT * FROM memories WHERE id=' + x.id);
      return r;
    } catch (e) {}
  }
}
```

- `any` type.
- Magic number implied in logic without name.
- String SQL concatenation.
- Empty catch.
- `SELECT *`.
- Vague names (`x`, `r`, `handle`).
- Comment restates code.

```typescript
class MemoryAndSearchAndBackupService extends BaseService {
  async doEverything(input: boolean) {
    if (input) { /* 120 lines */ } else { /* 120 lines */ }
  }
}
```

- God class name.
- Boolean trap.
- Oversized method.
- Inheritance for unrelated reuse.

---

# Checklist

## Before commit

- [ ] Formatter and linter pass
- [ ] No `any`, TODO, FIXME, or commented-out code
- [ ] Functions ≤ 60 lines; classes ≤ 300 lines
- [ ] No magic numbers in business logic
- [ ] `const` preferred; no unintended mutation
- [ ] Pure logic extracted from I/O
- [ ] Typed errors; no empty catch
- [ ] All promises awaited or returned
- [ ] Names follow convention table
- [ ] Comments only where why is non-obvious

## New module

- [ ] File name kebab-case matches primary export
- [ ] Single clear responsibility
- [ ] Named exports (unless framework entry)
- [ ] Imports grouped and ordered
- [ ] Tests for public behavior

## Refactor

- [ ] Scope limited to task or approved
- [ ] Tests green before and after
- [ ] No behavior change unless intended
- [ ] Duplicates removed, not commented out
- [ ] Comment accuracy verified

---

*Inherits from [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) and [01-05-WORKFLOW.md](01-05-WORKFLOW.md). Amend only with project owner approval.*
