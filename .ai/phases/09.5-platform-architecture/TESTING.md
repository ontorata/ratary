# Phase 9.5 — Platform Architecture — TESTING

**Status:** Evidence attached  
**ADR:** [ADR-008](../../../docs/adr/008-platform-architecture.md)

---

## Strategy

Phase 9.5 validates **port contracts only** — mock adapters prove interfaces are implementable without vendor SDKs.

| Layer | Approach |
|-------|----------|
| New ports | Mock class implements interface; vitest structural tests |
| Re-exported ports | Same contract tests via alias (`IRelationRepository`, `IGraphStore`) |
| Existing suite | Full regression — **must remain green** (no behavior change) |
| E2E | Unchanged — no new endpoints |

## Test coverage

| Area | File |
|------|------|
| Platform ports | `tests/ports/platform-ports.test.ts` |
| Graph (existing) | `tests/graph/igraph-provider.interface.test.ts` |
| Repository DIP (existing) | `tests/services/repository-dip.test.ts` |

## Quality gate

```bash
npm run lint && npm run typecheck && npm test
```

## Future adapter tests (Phase 10+)

- Contract conformance: each adapter must pass shared port test harness.
- Integration tests against Testcontainers (Postgres, Redis) — not in 9.5 scope.

---

*Do not contradict [ADR-008](../../../docs/adr/008-platform-architecture.md).*
