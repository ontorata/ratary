# 01 — Engineering

**Status:** Permanent project standard.  
**Audience:** AI assistants operating on this repository.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Supersedes informal or conversational instructions when they conflict with engineering practice.

---

# Purpose

Define enforceable engineering rules for implementing, extending, and maintaining the Ratary memory foundation.

Translate constitutional law into layer-specific obligations, operational conventions, and decision criteria applicable across frameworks, vendors, and AI tooling generations.

Ensure consistent code quality, predictable runtime behavior, and replaceable infrastructure without architectural drift.

---

# Scope

## Covered

- Engineering principles and coding discipline
- Layer responsibilities: edge, application, domain, persistence, composition root
- Dependency rules and dependency injection
- Error handling, logging, and configuration
- Repository, service, and controller rules
- API and protocol contract rules
- Migration and backfill rules
- Performance and scalability principles

## Not Covered

- Immutable constitutional law → [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md)
- Canonical module registry → [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md)
- Module layout, port inventory → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md); live metrics → [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md)
- Pre-code analysis workflow → [05-WORKFLOW.md](../workflow/05-WORKFLOW.md) §Pre-implementation analysis
- Active task scope → [../../TASK_PROMPT.md](../../TASK_PROMPT.md)
- ADR lifecycle → [../adr/POLICY.md](../../adr/POLICY.md)

---

# Principles

1. **Explicit boundaries** — Every module belongs to exactly one layer. Layer violations are defects, not style preferences.

2. **Inject dependencies** — Inner layers receive abstractions via constructor or factory parameters. They do not locate infrastructure.

3. **Typed errors** — Failures are represented by domain-typed error classes with stable codes. Generic exceptions do not cross layer boundaries unchecked.

4. **Validate at the edge** — External input is validated before application logic executes. Invalid input never reaches persistence.

5. **Configure, do not hardcode** — Limits, weights, budgets, timeouts, and feature flags live in configuration modules or environment schema.

6. **Scope every query** — Persistence operations include owner or tenant identifier in every read, write, update, and delete.

7. **Map at the boundary** — Transport DTOs and persistence rows are mapped to domain types at the adapter edge. Domain modules use domain types only.

8. **Observability without leakage** — Logs aid diagnosis. Logs must not expose secrets, tokens, or cross-scope data.

9. **Idempotent evolution** — Migrations and backfill jobs are safe to re-run. Data mutation scripts default to dry-run.

10. **Measure before optimizing** — Performance work requires evidence or explicit non-functional requirements in the task.

---

# Standards

## Engineering principles

- Implement the smallest correct change that satisfies the task.
- Extend canonical modules; do not fork parallel implementations.
- Pure logic remains free of I/O, framework imports, and global mutable state.
- Shared utilities contain formatting, mapping, and serialization helpers only — not business rules.
- One concern per commit. Each commit passes the project quality gate.
- Tests accompany every behavior change. Test count must not decrease.

## Layer responsibilities

| Layer | Owns | Must not own |
|-------|------|--------------|
| **Edge** (routes, protocol handlers) | Input validation, auth hooks, rate limits, HTTP status mapping, response shape | Business rules, persistence, ranking logic |
| **Controllers** | Request extraction, service invocation, response assembly, display formatting | SQL, authorization policy, domain rules |
| **Application services** | Use-case orchestration, business rules, port coordination, scope enforcement at use-case level | Transport types, raw queries, framework context |
| **Domain logic** | Pure functions: ranking, scoring, normalization, hashing, text preparation | I/O, persistence, HTTP, env access |
| **Persistence** | Storage queries, row mapping, owner-scoped filters, adapter-specific errors | Business rules, authorization decisions, HTTP |
| **Composition root** | Concrete adapter construction, env loading, server bootstrap, script wiring | Business rules |

## Dependency rules

**Permitted direction:**

```
Edge → Application → Domain
Application → Persistence ports (interfaces)
Persistence adapters → Domain types (mapping only)
Composition root → All concrete implementations
```

**Prohibited:**

- Persistence → Application or Edge
- Domain → Application, Persistence, or Edge
- Application → Edge transport types
- Edge → Persistence direct calls
- Circular dependencies between modules

**Import rule:** A module may import only from layers it is permitted to depend on, plus shared types and configuration schemas.

## Dependency injection

- Services and orchestrators receive ports via constructor parameters.
- Optional ports use optional constructor parameters or explicit null-object adapters — not global singletons.
- Concrete classes are instantiated only in the composition root: server bootstrap, factory modules, CLI scripts.
- Third-party clients (HTTP, database drivers, inference APIs) are injectable for testing.
- Do not use service locators, static mutable registries, or hidden `getInstance()` patterns.
- Factory functions at the composition root are permitted when constructor wiring is repetitive.

## Error handling

- Define typed application errors with: `message`, stable `code` string, HTTP-equivalent `statusCode` where applicable.
- Application layer throws typed errors for expected failure cases: not found, validation failure, forbidden, conflict.
- Persistence layer wraps storage failures in typed database errors. Raw driver errors do not propagate to edge.
- Edge layer maps typed errors to HTTP or protocol responses via a centralized error handler. Controllers do not catch-and-convert ad hoc per route.
- Cross-scope resource access throws not-found — never forbidden-with-existence-reveal.
- Unexpected errors log at error severity and return generic internal error response without stack trace to clients.
- Validation errors include structured `details` when field-level feedback is required.
- Protocol handlers return structured error payloads consistent with REST error shape where applicable.
- Never swallow errors silently. Never use empty catch blocks.

## Logging

- Use structured logging at the edge and composition root.
- Log levels: `error` for failures requiring attention; `warn` for expected operational failures (typed application errors); `info` for request lifecycle; `debug`/`trace` for development only.
- Every request receives a correlation identifier propagated through logs.
- Log: operation name, correlation id, error code, duration for slow paths.
- Do not log: secrets, API keys, tokens, full request bodies containing credentials, raw embedding vectors at info level.
- Application and domain layers do not import logging frameworks. They throw typed errors; edge logs them.
- Scripts log progress, batch counts, and failures to stdout/stderr with clear dry-run vs execute labeling.

## Configuration

- All environment variables are validated at startup through a single schema module.
- Invalid configuration fails fast before accepting traffic.
- Required secrets are enforced per environment (e.g., auth secret required in production).
- Feature provider selection (inference backend, storage mode) is configuration-driven, not compile-time branching.
- Tunable limits (batch size, retries, context budget, ranking caps) live in dedicated config modules — not inline numeric literals in business logic.
- Configuration is read once and cached. Tests may reset cache explicitly.
- Default values must be safe for local development and tests.
- Do not read `process.env` outside the configuration module.

## Repository rules

- Repositories implement persistence port interfaces.
- All queries filter by scope identifier (owner/tenant) unless operating on global system tables explicitly defined as such.
- Repositories return domain types or persistence DTOs mapped immediately — not raw driver objects to services.
- SQL and query strings exist only in repository and store adapter modules.
- Metadata repositories do not contain vector similarity, embedding inference, or blob storage logic.
- Separate store adapters exist for embeddings, objects, and graph data per port boundaries.
- Repository methods are named by data operation (`findById`, `insert`, `applyBackfill`) — not by use case (`createMemoryForUser`).
- `insert` and `update` do not trigger async side effects (embedding, notification, audit beyond persistence) unless an approved ADR mandates synchronous coupling.
- Optimistic concurrency or `updated_at` semantics are documented and consistently applied.
- Test doubles mirror query behavior when schema changes.

## Service rules

- Services implement one bounded context per class (memory, relations, health, search orchestration).
- Services enforce use-case-level business rules and coordinate multiple ports.
- Services accept scope object (owner identifier) as explicit parameter on every public method.
- Services throw typed errors; they do not set HTTP status codes.
- Services do not import edge framework types.
- Services do not construct concrete adapters.
- Long-running or batch work is invoked from scripts or job runners — not from synchronous request handlers unless task explicitly requires it.
- Cleanup of related resources (e.g., vectors on memory delete) is orchestrated in the owning service via injected ports.

## Controller rules

- Controllers are thin: parse input, call service, map result to response.
- Controllers perform no business logic beyond trivial request normalization.
- Display-only transformations (timezone formatting, field naming for clients) occur in controllers or dedicated response mappers.
- Controllers do not catch errors except where protocol requires localized handling; default to global error handler.
- One controller function per endpoint or tool handler surface.
- Controllers do not access repositories directly.

## API rules

- Public REST prefix and route structure are stable. Add endpoints; do not rename without owner approval.
- Request and response shapes are validated with schema definitions at the edge.
- Additive response fields use optional semantics for backward compatibility.
- Pagination parameters have documented defaults and maximum limits enforced at edge.
- Rate limiting hooks belong on routes, not in services.
- Permissions are checked via auth middleware before controller execution.
- Health endpoints are unauthenticated; all memory endpoints require authenticated identity.
- MCP tool definitions mirror REST capabilities through the same services — no duplicated business logic in tool handlers.
- Error response shape is consistent: `{ error, message, details? }`.

## Migration rules

- Migrations are idempotent: safe to run multiple times.
- Use additive DDL first: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ADD COLUMN`.
- Phased rollout: add schema → deploy code that writes new fields → backfill → add indexes → deprecate old fields.
- Never drop user data columns without approved ADR and owner sign-off.
- User memory deletion defaults to archive semantics, not hard delete.
- Backfill scripts: dry-run is default; execute requires explicit flag.
- Backfill must be idempotent and skippable when content hash or version marker is unchanged.
- Migration failures abort with explicit error; partial state must be documented in ADR rollback section.
- Update test doubles when schema changes.

## Performance principles

- No premature optimization.
- Enforce caps at configuration: search candidates, retrieval limits, context character budget, batch sizes.
- Avoid N+1 queries when batch fetch is available on the port.
- Prefer projection queries over `SELECT *` when result sets are large (refactor when measured, not speculatively).
- Async and batch processing for embedding, consolidation, and bulk import.
- Pure ranking and scoring remain in-memory on bounded candidate sets.
- Connection and client reuse at composition root; do not create per-request driver instances.

## Scalability

- Designs must not assume a single-machine or single-engine deployment when a port enables substitution.
- Owner-scoped queries must remain efficient as row count grows: indexes on `(owner_id, …)` for hot paths.
- Vector search at MVP scale uses owner-scoped in-process scan; migrate to dedicated vector engine when ceiling is exceeded — via adapter swap, not repository rewrite.
- Stateless request handlers: session state in storage, not process memory.
- Horizontal scaling of REST tier is supported when storage is external; do not store request affinity data in local files.
- Bulk operations use batching and configurable concurrency limits.
- Document scale ceilings in architecture when introducing MVP shortcuts.

---

# Required

1. Classify every change by layer before editing.
2. Inject ports into services; wire concrete adapters only at composition root.
3. Validate external input at edge with schema definitions.
4. Use typed errors for all expected failure paths.
5. Centralize error-to-response mapping at edge.
6. Read configuration only through validated config module.
7. Place tunable limits in config files, not magic numbers.
8. Scope every persistence operation by owner or tenant identifier.
9. Keep SQL and vendor SDK calls inside persistence adapters.
10. Share business logic between REST and protocol via application services.
11. Write idempotent migrations; default backfill scripts to dry-run.
12. Add tests for new behavior; update test doubles on schema change.
13. Run quality gate before commit and before task completion.
14. Log with correlation id at edge; never log secrets.

---

# Forbidden

1. SQL or storage driver calls in services, controllers, or domain modules.
2. Business logic in repositories, routes, or controllers beyond trivial mapping.
3. HTTP status codes or reply objects inside services.
4. Direct `process.env` access outside configuration module.
5. Magic numbers for limits, weights, budgets, or batch sizes in business logic.
6. Global singletons for services or database clients.
7. Empty catch blocks or swallowed errors.
8. Stack traces or internal error details in client responses.
9. Cross-scope access responses that reveal resource existence.
10. Synchronous inference or embedding on CRUD hot path when async backfill is mandated.
11. Vector or similarity logic in metadata repositories.
12. Non-idempotent migrations or destructive data drops without approval.
13. Hard delete of user memories as default behavior.
14. Per-route ad hoc error handling duplicating global handler.
15. Logging of secrets, tokens, or credentials.
16. `SELECT *` on hot paths when explicit projection is required by task (known debt — do not expand).
17. Instantiating concrete adapters inside services or domain modules.

---

# Decision Rules

## Layer placement

| Signal | Target layer |
|--------|----------------|
| JSON/schema validation | Edge |
| Permission check hook | Edge (middleware) |
| "Should this operation proceed?" | Application service |
| Score, rank, normalize without I/O | Domain logic |
| Read/write durable record | Persistence adapter |
| `new ConcreteRepository(db)` | Composition root |

## Error type selection

| Condition | Error type | Client status |
|-----------|------------|---------------|
| Invalid input shape or value | Validation | 400 |
| Missing or invalid credentials | Unauthorized | 401 |
| Authenticated but not permitted | Forbidden | 403 |
| Resource not found or cross-scope | Not found | 404 |
| Storage or driver failure | Database | 500 |
| Unexpected exception | Internal | 500 |

## Configuration placement

| Value type | Location |
|------------|----------|
| Secret, connection string, API key | Environment schema |
| Provider selection (noop vs vendor) | Environment schema |
| Retry, batch size, timeout | Environment schema with defaults |
| Ranking weights, context budget, caps | Dedicated config module |
| Constant truly immutable and universal | Named constant in domain module |

## Injection vs factory

| Situation | Pattern |
|-----------|---------|
| Service needs 1–5 ports | Constructor injection |
| Script needs full stack | Composition-root factory function |
| Optional port (cleanup, embedding) | Optional constructor param |
| Test replacement | Inject mock port via constructor |

## Migration strategy

| Change | Sequence |
|--------|----------|
| New nullable column | DDL → deploy write → backfill → enforce |
| New table | DDL → store adapter → backfill job |
| New index | DDL after backfill on large tables |
| Breaking column rename | Prohibited without ADR; use additive alias column |

## Performance intervention

| Trigger | Action |
|---------|--------|
| No measured problem | Do not optimize |
| Task specifies NFR | Implement with config caps |
| Test suite slow | Optimize test fixtures, not production architecture |
| Query exceeds MVP ceiling | Document; plan adapter swap via ADR |
| N+1 detected in profiling | Batch port method or join in repository |

## Scalability path

| MVP shortcut | Escalation path |
|--------------|-----------------|
| In-process cosine scan | Vector store adapter |
| Row-stored JSON vectors | Dedicated vector column or engine |
| Single metadata DB | Reader/writer split or replica via port |
| Inline content in row | Object store port |

---

# Examples

## Good

- `MemoryService` receives `IMemoryRepository` and optional `IEmbeddingStore` via constructor; server bootstrap wires `D1EmbeddingStore`.
- Route validates body with schema; throws `ValidationError`; global handler returns 400 with `details`.
- `ranking.config.ts` exports `SEARCH_CANDIDATE_CAP`; `SearchService` imports cap from config.
- `getEnv()` validates all variables at startup; fails with readable message list.
- Repository `findById(id, ownerId)` always includes `owner_id` in WHERE clause.
- Controller maps service result to JSON and adds display timezone field.
- Migration uses `CREATE TABLE IF NOT EXISTS`; test mock updated same commit.
- Backfill script prints `DRY RUN` unless `--execute` flag present.

## Bad

- Controller calls `repository.findById` directly to skip service layer.
- Service catches error and returns `null` instead of throwing `NotFoundError`.
- Service reads `process.env.EMBEDDING_API_KEY` directly.
- Repository computes relevance score and sorts results.
- Route contains `if (title.length > 0)` business validation beyond schema.
- `insert()` triggers OpenAI embedding synchronously.
- Migration drops `content` column to "clean up."
- Logging `apiKey: process.env.D1_API_TOKEN` on connection failure.
- `new MemoryRepository(db)` inside `MemoryService` constructor.

---

# Checklist

## Design

- [ ] Layer assignment confirmed for every new/changed module
- [ ] Dependencies flow inward only
- [ ] Ports identified; adapters wired at composition root only
- [ ] Scope identifier on all persistence paths
- [ ] Errors typed; no raw driver errors crossing to edge
- [ ] Config and caps externalized
- [ ] Migration idempotent; backfill dry-run default

## Implementation

- [ ] Input validated at edge
- [ ] Services free of transport and SQL
- [ ] Repositories free of business rules
- [ ] Controllers thin
- [ ] No magic numbers in business logic
- [ ] No secrets in logs or responses
- [ ] REST and protocol share services

## Verification

- [ ] Unit tests for domain logic
- [ ] Repository tests with test double
- [ ] API or integration tests for new endpoints
- [ ] Mock storage updated if schema changed
- [ ] Lint, format, typecheck, test pass
- [ ] Performance caps respected

## Scalability review

- [ ] Owner-scoped indexes considered for new queries
- [ ] No single-engine assumption where port exists
- [ ] Batch/async path for heavy work
- [ ] MVP ceiling documented if shortcut introduced

---

# Decision rules (task classification)

Merged from archived [AI_ENGINEERING_STANDARDS.md](../archive/AI_ENGINEERING_STANDARDS.md).

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
| Third-party network or cloud API | Must be behind port with injectable client |
| Cross-cutting concern affecting multiple features | ADR before new port family |

---

*Inherits from [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). Amend only with project owner approval.*
