# 08 — Review Checklist

**Status:** Permanent project standard.  
**Audience:** AI assistants and human maintainers.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [07-DOCUMENTATION.md](../../core/standards/07-DOCUMENTATION.md).  
**When:** Code review, pre-merge, pre-release.

---

## Architecture

- [x] Change classified: additive (new sources, no existing change)
- [x] Design gate completed before implementation (ADR-001 Approved)
- [x] Layer assignment correct per [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)
- [x] Canonical owner module used — no duplicate logic
- [x] Dependency direction inward only
- [x] No layer bypass (SQL in services, business logic in repositories)
- [x] Ports used for swappable infrastructure (IRetrievalCandidateSource)
- [x] Adapters wired only at composition root
- [x] REST and MCP share application services
- [x] Search and Retriever pipelines remain separate
- [x] No `*V2` / Manager / parallel implementations
- [x] Approved ADR exists and is referenced if structural (ADR-001)
- [x] Diff matches approved Files To Change
- [x] One concern per commit

## Security

- [x] No secrets, tokens, or credentials in diff
- [x] No secrets in logs or test fixtures
- [x] `ownerId` / scope on all persistence operations
- [x] Cross-scope access returns not-found — no enumeration
- [x] Auth middleware on protected REST routes
- [x] Permissions enforced (`memory.read`, `memory.write`)
- [x] Input validated at edge (Zod / schema)
- [x] Typed errors — no raw stack traces to clients
- [x] `MCP_OWNER_ID` required in production MCP path
- [x] Env vars validated via `env.ts` schema
- [x] No string-concatenated SQL
- [x] External HTTP clients injectable for testing

## Performance

- [x] No synchronous heavy inference on CRUD hot path
- [x] Caps from config — no magic numbers (`ranking.config`, `context.config`)
- [x] Batch/async for embedding, backfill, bulk import
- [x] No unbounded `Promise.all` on full datasets
- [x] No premature optimization without task NFR
- [x] N+1 queries not introduced
- [x] Connection/client reuse at composition root
- [x] Performance NFR tests added if task requires

## Scalability

- [x] Design does not hard-bind single storage engine where port exists
- [x] Owner-scoped indexes on new hot query paths
- [x] Stateless request handlers
- [x] MVP scale ceilings documented if shortcut introduced
- [x] Vector/blob/graph concerns not embedded in metadata repository
- [x] Adapter swap path preserved for growth beyond MVP

## Testing

- [x] Tests added/updated for every changed behavior (13 new tests)
- [x] `npm test` passes (192 tests)
- [x] `npm run lint` passes
- [x] `npm run format:check` passes
- [x] `npm run typecheck` passes
- [x] Test count did not decrease (172 → 192)
- [x] Owner isolation test for new queries (cross-owner-leak.test.ts)
- [x] MockD1 updated if schema/SQL changed
- [x] Migration test if DDL changed (N/A - no DDL)
- [x] API test if REST endpoint changed (N/A - no change)
- [x] MCP test if tool changed (N/A - no change)
- [x] Regression test for bug fixes
- [x] No `it.skip` / deleted tests without approval
- [x] No real network/D1 in default suite

## Documentation

- [x] [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md) updated
- [x] [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) updated
- [x] ADR status/index updated (ADR-001 Implemented)
- [x] [../PANDUAN.md](../../docs/PANDUAN.md) updated if user-visible (N/A)
- [x] [README.md](../../docs/README.md) updated if public surface changed (N/A)
- [x] `.env.example` updated if new env vars (HYBRID_RETRIEVAL)
- [x] Swagger tag/summary on new routes (N/A)
- [x] TASK_PROMPT definition of done checked
- [x] Completion report delivered (COMPLETION.md)
- [x] No duplication of `00–07` rules in other docs
- [x] Diagrams updated if flows changed

## Migration

- [x] Migration idempotent (`IF NOT EXISTS`, safe re-run) (N/A - no migration)
- [x] Phased: add → backfill → index (N/A)
- [x] No destructive drop without approved ADR + owner sign-off
- [x] `migrate{Feature}{Phase}` naming (N/A)
- [x] Migration test in `tests/db/` (N/A)
- [x] Backfill dry-run default documented and tested (N/A)
- [x] Rollback documented in ADR if structural (ADR-001 rollback section)
- [x] `npm run db:migrate` verified on target environment (N/A)

## Breaking changes

- [x] No breaking REST field removal/rename without owner approval
- [x] No breaking MCP tool schema change without owner approval
- [x] No breaking permission model change without ADR + owner approval
- [x] Additive defaults preferred over removal
- [x] ADR written if contract break (ADR-001)
- [x] Changelog / completion report notes BREAKING if applicable (N/A)
- [x] Migration path documented for consumers (N/A)

## Future compatibility

- [x] Valid through next three planned phases
- [x] No forced rewrite in Phase 6 hybrid retrieval path
- [x] No forced rewrite in Phase 7 agent boundary
- [x] No forced rewrite in Phase 8 graph path
- [x] `embedding_id` / ports not bypassed
- [x] `MemoryScope` extensible per ADR-002
- [x] Public contracts additive unless approved break
- [x] Structural pivot has ADR supersede plan

---

## Sign-off

| Gate | Pass |
|------|------|
| Architecture | [x] |
| Security | [x] |
| Performance | [x] |
| Scalability | [x] |
| Testing | [x] |
| Documentation | [x] |
| Migration | [x] |
| Breaking changes | [x] |
| Future compatibility | [x] |

**Phase 6 Gate: READY FOR OWNER SIGN-OFF**

---

*Inherits from [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) through [07-DOCUMENTATION.md](../../core/standards/07-DOCUMENTATION.md).*
