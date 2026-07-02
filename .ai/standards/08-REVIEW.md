# 08 — Review Checklist

**Status:** Permanent project standard.  
**Audience:** AI assistants and human maintainers.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [07-DOCUMENTATION.md](../standards/07-DOCUMENTATION.md).  
**When:** Code review, pre-merge, pre-release.

---

## Architecture

- [ ] Change classified: bug fix / additive / structural
- [ ] Design gate completed before implementation
- [ ] Layer assignment correct per [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md)
- [ ] Canonical owner module used — no duplicate logic
- [ ] Dependency direction inward only
- [ ] No layer bypass (SQL in services, business logic in repositories)
- [ ] Ports used for swappable infrastructure
- [ ] Adapters wired only at composition root
- [ ] REST and MCP share application services
- [ ] Search and Retriever pipelines remain separate
- [ ] No `*V2` / Manager / parallel implementations
- [ ] Approved ADR exists and is referenced if structural
- [ ] Diff matches approved Files To Change
- [ ] One concern per commit

## Security

- [ ] No secrets, tokens, or credentials in diff
- [ ] No secrets in logs or test fixtures
- [ ] `ownerId` / scope on all persistence operations
- [ ] Cross-scope access returns not-found — no enumeration
- [ ] Auth middleware on protected REST routes
- [ ] Permissions enforced (`memory.read`, `memory.write`)
- [ ] Input validated at edge (Zod / schema)
- [ ] Typed errors — no raw stack traces to clients
- [ ] `MCP_OWNER_ID` required in production MCP path
- [ ] Env vars validated via `env.ts` schema
- [ ] No string-concatenated SQL
- [ ] External HTTP clients injectable for testing

## Performance

- [ ] No synchronous heavy inference on CRUD hot path
- [ ] Caps from config — no magic numbers (`ranking.config`, `context.config`)
- [ ] Batch/async for embedding, backfill, bulk import
- [ ] No unbounded `Promise.all` on full datasets
- [ ] No premature optimization without task NFR
- [ ] N+1 queries not introduced
- [ ] Connection/client reuse at composition root
- [ ] Performance NFR tests added if task requires

## Scalability

- [ ] Design does not hard-bind single storage engine where port exists
- [ ] Owner-scoped indexes on new hot query paths
- [ ] Stateless request handlers
- [ ] MVP scale ceilings documented if shortcut introduced
- [ ] Vector/blob/graph concerns not embedded in metadata repository
- [ ] Adapter swap path preserved for growth beyond MVP

## Testing

- [ ] Tests added/updated for every changed behavior
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npm run typecheck` passes
- [ ] Test count did not decrease
- [ ] Owner isolation test for new queries
- [ ] MockD1 updated if schema/SQL changed
- [ ] Migration test if DDL changed
- [ ] API test if REST endpoint changed
- [ ] MCP test if tool changed
- [ ] Regression test for bug fixes
- [ ] No `it.skip` / deleted tests without approval
- [ ] No real network/D1 in default suite

## Documentation

- [ ] [10-PHASE-STATUS.md](../architecture/10-PHASE-STATUS.md) updated if ports/phases/ops changed
- [ ] [04-ARCHITECTURE.md](../architecture/04-ARCHITECTURE.md) updated if structural law changed
- [ ] ADR status/index updated if structural
- [ ] [../PANDUAN.md](../../docs/PANDUAN.md) updated if user-visible
- [ ] [README.md](../../docs/README.md) updated if public surface changed
- [ ] `.env.example` updated if new env vars
- [ ] Swagger tag/summary on new routes
- [ ] TASK_PROMPT definition of done checked
- [ ] Completion report delivered if task complete
- [ ] No duplication of `00–07` rules in other docs
- [ ] Diagrams updated if flows changed

## Migration

- [ ] Migration idempotent (`IF NOT EXISTS`, safe re-run)
- [ ] Phased: add → backfill → index
- [ ] No destructive drop without approved ADR + owner sign-off
- [ ] `migrate{Feature}{Phase}` naming
- [ ] Migration test in `tests/db/`
- [ ] Backfill dry-run default documented and tested
- [ ] Rollback documented in ADR if structural
- [ ] `npm run db:migrate` verified on target environment (release)

## Breaking changes

- [ ] No breaking REST field removal/rename without owner approval
- [ ] No breaking MCP tool schema change without owner approval
- [ ] No breaking permission model change without ADR + owner approval
- [ ] Additive defaults preferred over removal
- [ ] ADR written if contract break
- [ ] Changelog / completion report notes BREAKING if applicable
- [ ] Migration path documented for consumers

## Future compatibility

- [ ] Valid through next three planned phases
- [ ] No forced rewrite in Phase 6 hybrid retrieval path
- [ ] No forced rewrite in Phase 7 agent boundary
- [ ] No forced rewrite in Phase 8 graph path
- [ ] `embedding_id` / ports not bypassed
- [ ] `MemoryScope` extensible per ADR-002
- [ ] Public contracts additive unless approved break
- [ ] Structural pivot has ADR supersede plan

---

## Sign-off

| Gate | Pass |
|------|------|
| Architecture | [ ] |
| Security | [ ] |
| Performance | [ ] |
| Scalability | [ ] |
| Testing | [ ] |
| Documentation | [ ] |
| Migration | [ ] |
| Breaking changes | [ ] |
| Future compatibility | [ ] |

**Merge blocked until all applicable items are checked.**

---

*Inherits from [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md) through [07-DOCUMENTATION.md](../standards/07-DOCUMENTATION.md).*
