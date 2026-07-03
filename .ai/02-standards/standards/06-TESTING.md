# 06 — Testing Standard

**Status:** Permanent project standard.  
**Audience:** AI assistants and human maintainers.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [05-WORKFLOW.md](../workflow/05-WORKFLOW.md).

---

# Purpose

Define mandatory testing practices for the AI Brain memory foundation.

Ensure every change is verified at the appropriate level — unit, repository, service, API, MCP, integration, and regression — with consistent organization, naming, mocking, and coverage expectations.

Provide AI assistants objective criteria for what tests to write, where to place them, and when a testing gate passes.

---

# Scope

## Covered

- Unit, integration, API, repository, and MCP testing
- Regression and performance testing policy
- Test naming, organization, fixtures, and mocking
- Coverage expectations and quality gates
- Test double maintenance (MockD1)

## Not Covered

- Development workflow stages → [05-WORKFLOW.md](../workflow/05-WORKFLOW.md)
- Layer and port architecture → [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md)
- Code style and function size → [02-CODING.md](../standards/02-CODING.md)
- File and identifier naming → [03-NAMING.md](../standards/03-NAMING.md)
- Active task test deliverables → [../TASK_PROMPT.md](../TASK_PROMPT.md)

---

# Principles

1. **Test behavior, not implementation** — Assert observable outcomes and contracts, not private method calls.

2. **Proportional depth** — Test depth matches change risk: pure logic → unit; SQL → repository; HTTP → API.

3. **No regression** — Test count must not decrease; existing tests must pass before merge.

4. **Deterministic tests** — No network, no real D1, no wall-clock flakiness in default suite.

5. **Isolated tests** — Each test sets up its own state; no order dependency between tests.

6. **Mock at boundaries** — Replace I/O at persistence and external API boundaries, not domain logic under test.

7. **Mirror production wiring** — Service and API tests use the same stack composition as composition roots where practical.

8. **Owner scope always** — Repository and service tests include cross-owner isolation cases.

9. **Schema parity** — When DDL changes, update MockD1 and migration tests in the same commit.

10. **Fast default suite** — `npm test` completes in seconds; heavy tests are explicit opt-in.

---

# Standards

## Test runner and commands

| Command | Purpose |
|---------|---------|
| `npm test` | Full Vitest suite — **mandatory quality gate** |
| `npm run test:watch` | Local development watch mode |
| `npm run test:integration` | Live D1 integration script — **opt-in**, not default gate |
| `npm run typecheck` | Type safety — runs with quality gate |

- Framework: **Vitest** (`vitest.config.ts`).
- Test files: `tests/**/*.test.ts` only.
- Environment: Node; no browser.
- Globals: `describe`, `it`, `expect`, `vi` enabled.

## Test organization

```
tests/
  helpers/           shared fixtures, MockD1, test stacks
  api/               HTTP E2E (Fastify inject)
  auth/              auth E2E flows
  mcp/               MCP protocol tool tests
  repositories/      persistence adapter tests
  services/          application service tests
  embedding/         embedding domain tests
  memory/            memory intelligence tests
  search/            ranking engine tests
  knowledge/         pure generator tests
  db/                migration tests
  scripts/           CLI script tests
  types/             type/scope unit tests
  utils/             mapper/formatter tests
  *.test.ts          top-level integration (api.test.ts, memory.service.test.ts)
```

**Rules:**

- Mirror `src/` path where practical: `src/search/ranking.engine.ts` → `tests/search/ranking.engine.test.ts`.
- One primary subject per file.
- Shared setup in `tests/helpers/` — not duplicated across files.
- Helpers are not named `*.test.ts`.
- Do not place tests inside `src/`.

## Unit testing

**Applies to:** pure functions, domain engines, generators, normalizers, mappers, config-driven scoring.

**Characteristics:**

- No I/O, no database, no HTTP, no filesystem.
- No `beforeEach` mock setup unless injecting pure dependencies.
- Table-driven cases encouraged for scoring and normalization edge cases.

**Required cases:**

- Happy path
- Empty input / zero-length collections
- Boundary values (caps, limits from config)
- Invalid input where function defines behavior

**Examples in repo:** `ranking.engine.test.ts`, `cosine-similarity.test.ts`, `codename.generator.test.ts`, `embed-text.test.ts`.

## Repository testing

**Applies to:** `*Repository`, `*Store` adapters, SQL mapping.

**Characteristics:**

- Use `MockD1Client` from `tests/helpers/mock-d1.ts`.
- Instantiate real adapter class against mock — do not mock the adapter under test.
- Update MockD1 when adding tables, columns, indexes, or new query patterns.

**Required cases:**

- CRUD happy path
- **Owner scope isolation** — other owner receives null / empty / not found
- Not found / empty result
- Uniqueness or constraint behavior when applicable
- New query methods: filter correctness, limit, ordering

**Examples in repo:** `memory.repository.test.ts`, `d1-embedding.store.test.ts`, `embedding-migration.test.ts`.

## Integration testing

**Applies to:** cross-layer flows, multi-module orchestration, live D1 verification.

**Two tiers:**

| Tier | Tool | When |
|------|------|------|
| In-process integration | Vitest + MockD1 + real services | Default gate — service stacks, MCP in-memory transport |
| Live integration | `npm run test:integration` | Manual/CI opt-in; requires real D1 credentials |

**In-process integration rules:**

- Use `createTestMemoryStack()` or `createMemoryService(mockDb)` for wired stacks.
- Reset `setD1Client` / `resetD1Client` and `resetEnvCache()` in `beforeEach`/`afterEach`.
- Test flows across service + repository boundaries without HTTP when service test suffices.

**Live integration rules:**

- Never required for merge gate unless owner explicitly mandates.
- Do not commit credentials; use env from local `.env`.

## API testing

**Applies to:** REST routes, controllers, auth middleware, response shapes.

**Characteristics:**

- Build app via `buildApp({ logger: false, skipAuth: true })` for unauthenticated paths.
- Use `app.inject()` — no real TCP port.
- Stub env with `vi.stubEnv` before app build.
- Auth E2E: `tests/auth/api.test.ts`, `tests/auth/phase3.test.ts` — full auth chain when testing permissions.

**Required cases:**

- Status code
- Response JSON shape (required fields)
- Validation error shape `{ error, message, details? }` on 400
- Not found on 404
- Additive fields do not break existing assertions

**Examples in repo:** `api.test.ts`, `api/knowledge.test.ts`, `api/context.test.ts`, `auth/api.test.ts`.

## MCP testing

**Applies to:** MCP tool definitions, protocol wiring, tool list contract.

**Characteristics:**

- Use `InMemoryTransport` + MCP `Client` — no stdio subprocess in unit gate.
- Wire via `createMcpServer(memoryService, …)` with MockD1-backed services.
- Assert tool list matches `EXPECTED_TOOLS` constant when tools are part of public contract.

**Required cases:**

- Tool registration count and names (regression guard)
- At least one read tool and one write tool smoke invocation
- Tool output is valid JSON text payload
- Scope: memories created via MCP visible in subsequent tool calls

**Examples in repo:** `mcp/tools.test.ts`.

## Regression testing

**Definition:** Existing behavior remains unchanged after a change.

**Rules:**

- Full suite `npm test` is the primary regression gate.
- When fixing a bug: add a test that fails without the fix.
- When changing query semantics: update repository tests before changing implementation.
- MCP tool list and REST response shape tests are regression anchors — do not remove.
- Do not delete tests to make suite pass.

**Mandatory:** Test count ≥ pre-change count at merge.

## Performance testing

**Default policy:** Performance is not part of `npm test` unless task explicitly requires NFR.

**When required by task:**

- Assert bounded work: candidate caps, batch sizes, context budget limits.
- Use deterministic fixtures — no timing assertions with wall-clock thresholds in CI.
- Prefer asserting config caps are respected (e.g., result length ≤ `SEARCH_CANDIDATE_CAP`).
- Load and soak tests live outside default suite — document in task or ADR.

**Forbidden in default suite:** `setTimeout` timing races, real OpenAI calls, real D1 latency benchmarks.

## Naming

Per [03-NAMING.md](../standards/03-NAMING.md):

| Element | Convention |
|---------|------------|
| File | `{subject}.test.ts` |
| `describe` | Subject class or module name — `MemoryRepository`, `MCP tools` |
| Nested `describe` | Method or endpoint — `deleteMemory`, `GET /health` |
| `it` | `should {expected behavior}` |
| Mock class | `Mock{Name}` — `MockD1Client` |
| Factory | `createTest{Stack}` — `createTestMemoryStack` |
| Owner fixture | `'test-owner'` or `owner-repo-test` — descriptive string |

**Forbidden:** `test.ts`, `*.spec.ts`, `it('works')`, `it('test 1')`.

## Coverage

**Policy:**

- Coverage is tracked via Vitest v8 provider; not a merge blocker at fixed percentage today.
- **Required:** every changed production file has corresponding test change unless explicitly exempt (types-only, re-exports).
- **Exempt without tests:** pure type definitions, barrel `index.ts`, config constants with no logic.
- **Not exempt:** repositories, services, engines, providers, controllers, routes, MCP handlers.

**Minimum expectations by layer:**

| Layer | Expectation |
|-------|-------------|
| Pure engine / generator | 100% branch coverage target |
| Provider adapter | happy path + primary error path |
| Repository | all public methods touched |
| Service | each public use case |
| API route | status + body shape per endpoint changed |
| MCP tool | smoke per tool changed |

**Trend rule:** Coverage must not decrease on modules touched by the diff.

## Mocking

**Mock boundaries:**

| Boundary | Mock approach |
|----------|---------------|
| D1 / SQL | `MockD1Client` |
| OpenAI / HTTP APIs | inject `fetchImpl` or `vi.fn()` passed to constructor |
| Environment | `vi.stubEnv` + `resetEnvCache()` |
| Time | `vi.useFakeTimers()` only when necessary; restore after |
| Auth identity | `skipAuth: true` or bootstrap test identity in API tests |

**Rules:**

- Do not mock the class under test.
- Do not mock pure functions — call them directly.
- Prefer constructor injection over `vi.mock` module hoisting unless module has no injection point.
- Reset mocks in `beforeEach` / `afterEach`.
- MockD1 must implement new SQL patterns when repositories add queries — same commit.

## Fixtures

**Helpers (`tests/helpers/`):**

| Helper | Purpose |
|--------|---------|
| `mock-d1.ts` | In-memory D1 test double |
| `test-stack.ts` | `createTestMemoryStack(mockDb)` — wired memory stack |

**Fixture rules:**

- Minimal valid entity factory inline or via helper — avoid 50-line copy-paste per test.
- Use realistic domain values: valid UUID, codename pattern, slug.
- Default owner: `test-owner` or file-scoped `ownerId` constant.
- Do not share mutable state across tests via module-level maps unless reset in `beforeEach`.
- Large fixtures: build with factory functions, not committed JSON blobs, unless testing import format.

**Insert payloads:** use typed shapes matching `InsertMemoryData` / schemas — required fields complete.

---

# Required

1. Add or update tests for every behavior change before merge.
2. Run `npm test` — full suite green — as part of quality gate.
3. Include owner-scope isolation test for new repository or service queries.
4. Update MockD1 when schema or SQL patterns change.
5. Add migration test for DDL changes in `tests/db/`.
6. Add API test for new or changed REST endpoints.
7. Add MCP smoke test when adding or changing tools.
8. Stub environment variables in tests that build app or read config.
9. Reset D1 client and env cache between API/MCP tests.
10. Name tests per 03-NAMING.
11. Keep tests deterministic — no default-suite network calls.
12. Add regression test for every bug fix.

---

# Forbidden

1. Deleting or skipping tests to pass CI.
2. `it.skip` / `describe.skip` in committed code without owner approval.
3. Real D1, real OpenAI, or real HTTP in `npm test` default suite.
4. Hardcoded production credentials in test files.
5. Tests that depend on execution order across files.
6. Mocking the system under test.
7. Empty `it` blocks or assertion-free tests.
8. `any` in test code except when testing intentionally invalid input.
9. Sleep-based async waits (`setTimeout`) for synchronization.
10. Tests in `src/` directory.
11. Committing without running full suite when tests were changed.
12. Repository tests that omit owner isolation verification.
13. Changing MCP tool list without updating `EXPECTED_TOOLS` regression test.

---

# Decision Rules

## Which test type to write?

| Change | Required tests |
|--------|----------------|
| Pure function / engine | Unit |
| New repository method | Repository + MockD1 update |
| New service method | Service (mock or MockD1 stack) |
| New REST route | API inject test |
| New MCP tool | MCP tool test + EXPECTED_TOOLS update |
| Schema / migration | `tests/db/*-migration.test.ts` |
| CLI script | `tests/scripts/*.test.ts` |
| Bug fix | Regression test proving fix |
| Refactor only | Existing tests must pass unchanged |

## MockD1 vs real D1?

| Situation | Use |
|-----------|-----|
| Default PR / commit gate | MockD1 |
| SQL correctness unit | MockD1 |
| Pre-release manual verification | `test:integration` |
| CI without D1 secrets | MockD1 only |

## Service test: mock or stack?

| Situation | Approach |
|-----------|----------|
| Single service logic | Mock ports with `vi.fn()` |
| Multi-module integration | `createTestMemoryStack(mockDb)` |
| Composition root factory | `createMemoryService(mockDb)` |

## Performance assertion?

| Situation | Action |
|-----------|--------|
| No NFR in task | Assert cap/bound only if relevant |
| NFR in task | Add bounded-work assertion |
| Load test needed | Separate script; not in `npm test` |

## Coverage gap acceptable?

| File type | Tests required? |
|-----------|-----------------|
| `*.repository.ts` | Yes |
| `*.service.ts` | Yes |
| `*.engine.ts` / `*.generator.ts` | Yes |
| `types/*.ts` pure types | No |
| `index.ts` barrel | No |
| `*.config.ts` constants only | No |

---

# Examples

## Good

```typescript
describe('MemoryRepository', () => {
  it('should not find memory for different owner', async () => {
    const memory = await repository.insert({ ...baseData, ownerId });
    expect(await repository.findById(memory.id, 'other-owner')).toBeNull();
  });
});
```

```typescript
const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => ({ data: [] }) }));
const provider = new OpenAIEmbeddingProvider({ apiKey: 'test-key', fetchImpl, ... });
```

```typescript
beforeEach(async () => {
  resetEnvCache();
  mockDb = new MockD1Client();
  setD1Client(mockDb);
  app = await buildApp({ logger: false, skipAuth: true });
});
```

## Bad

```typescript
it('works', async () => {
  const result = await service.createMemory(data);
  expect(result).toBeTruthy(); // vague
});
```

```typescript
it('should insert', async () => {
  vi.mock('../../src/repositories/memory.repository.js'); // mocking SUT
});
```

```typescript
it('should call API', async () => {
  await fetch('https://api.openai.com/...'); // real network in default suite
});
```

```typescript
// deleted test file to fix CI
```

---

# Checklist

## New feature

- [ ] Unit tests for pure logic
- [ ] Repository tests + MockD1 if SQL changed
- [ ] Service tests for orchestration
- [ ] API test if REST surface changed
- [ ] MCP test if tools changed
- [ ] Migration test if DDL changed
- [ ] Owner isolation case included
- [ ] `npm test` passes

## Bug fix

- [ ] Regression test added (fails without fix)
- [ ] No unrelated test deletions
- [ ] Full suite green

## Schema change

- [ ] MockD1 updated
- [ ] Migration test added/updated
- [ ] Repository tests updated

## Pre-merge (testing gate T1–T6)

- [ ] Every changed behavior has test
- [ ] Full `npm test` green
- [ ] Test doubles updated
- [ ] Migration/backfill tests if applicable
- [ ] Test count ≥ before change
- [ ] No skip, no network, no secrets in tests

---

*Inherits from [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [05-WORKFLOW.md](../workflow/05-WORKFLOW.md). Amend only with project owner approval.*
