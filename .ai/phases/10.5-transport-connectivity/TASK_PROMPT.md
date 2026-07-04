# Task Prompt — Phase 10.5 Transport & Connectivity Layer

**Status:** 🔄 In Progress — ADR-027 ✅ Approved (2026-07-04); track 10.5A ✅  
**Template:** [workflow/12-TASK-TEMPLATE.md](../../workflow/12-TASK-TEMPLATE.md)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-027](../../adr/027-transport-connectivity-layer.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 10.5

**Note:** Active root [TASK_PROMPT.md](../../TASK_PROMPT.md) remains Phase 11 until owner rotates after 10.5 approval.

---

# TASK

Implement **Phase 10.5 — Transport & Connectivity Layer**: formalize `src/transport/`, shared application handlers, optional gRPC (default OFF), and manifest transport section — **without changing** `MemoryService`, `SearchService`, `KnowledgeService`, repositories, or storage ports.

---

## Requirements

- ADR-027 **Approved** before first implementation commit
- Phase 10 ✅ and Phase 7.5 ✅ complete
- Phase 11 SC-11-01 / SC-11-05 **not blocked** — coordinate with owner if parallel
- Default env: D1 + REST + MCP stdio unchanged
- `GRPC_ENABLED=false` default

### Tracks

| Track | Scope |
|-------|-------|
| 10.5A | `TransportContext`, `resolve-transport-scope`, transport errors |
| 10.5B | Shared `IApplicationHandler` for ≥10 use cases |
| 10.5C | REST → `transport/rest/` (strangler re-exports) |
| 10.5D | MCP → `transport/mcp/` (strangler re-exports) |
| 10.5E | gRPC v1: Memory, Context (stream), Health |
| 10.5F | Manifest `transport` section; PANDUAN; architecture doc sync |

### ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| [027](../../adr/027-transport-connectivity-layer.md) | Transport & Connectivity Layer | **Proposed → approve** |
| [025](../../../docs/adr/025-capability-discovery-api.md) | Capability discovery (amend transport block) | **Implemented** — additive amend only |

### Future compatibility

| Phase | Requirement |
|-------|-------------|
| 11 | No Postgres/service rewrite |
| 12 | gRPC consumer-ready interceptors |
| 13 | EmbeddingIngest gRPC stub extensible |
| 14 | Reindex trigger RPC defer OK |

---

## Constraints

- Follow [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md)
- Preserve Clean Architecture — no `fastify`/`@grpc/grpc-js` in `services/`
- Backward compatible REST v1 + MCP tool schemas
- No `*V2` classes, no agent runtime
- One concern per commit
- SDK (`@ai-brain/client`) **not** in this repo

### Forbidden

- Business logic in transport handlers (mapping only)
- Repository or SQL in transport layer
- Breaking MCP tool renames
- gRPC on Vercel default deploy path
- Blocking Phase 11 Postgres staging

---

## Expected deliverables

| Deliverable | Detail |
|-------------|--------|
| **Code** | `src/transport/**`, registry, optional gRPC |
| **Tests** | Handler parity, transport contract, layer lint gate |
| **Migration** | None (schema) — folder strangler only |
| **Scripts** | None required |
| **Documentation** | 04-ARCHITECTURE, PANDUAN § transport, POST-ROADMAP, ADR-027 Implemented |
| **Completion** | [COMPLETION_TEMPLATE.md](COMPLETION_TEMPLATE.md) filled → COMPLETION.md |

---

## Implementation plan (commits)

| # | Commit | Scope |
|---|--------|-------|
| 1 | `docs(adr): approve ADR-027` | ADR status + README index |
| 2 | `refactor(transport): add TransportContext and shared scope` | 10.5A |
| 3 | `refactor(transport): extract shared application handlers` | 10.5B |
| 4 | `refactor(transport): move REST to transport/rest with re-exports` | 10.5C |
| 5 | `refactor(transport): move MCP to transport/mcp with re-exports` | 10.5D |
| 6 | `feat(transport): add gRPC server behind GRPC_ENABLED flag` | 10.5E |
| 7 | `feat(capabilities): extend manifest transport section` | 10.5F |
| 8 | `docs(phase): Phase 10.5 gate evidence` | TESTING, REVIEW, COMPLETION |

**Quality gate (every commit):**

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

---

## Definition of done

- [ ] ADR-027 **Approved** and marked **Implemented** at gate
- [ ] SC-10.5-01 through SC-10.5-08 PASS ([DESIGN.md](DESIGN.md) §10)
- [ ] 457+ tests green at default env
- [ ] Handler parity suite ≥10 use cases
- [ ] No service/repository logic diff (review verified)
- [ ] Manifest reports transport accurately
- [ ] CHECKLIST.md gate PASS
- [ ] REVIEW.md records owner authorization

---

## References

- [DESIGN.md](DESIGN.md)
- [CHECKLIST.md](CHECKLIST.md)
- [RISKS.md](RISKS.md)
- [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)
- [13-AI-DECISION-FRAMEWORK.md](../../core/decision-framework/13-AI-DECISION-FRAMEWORK.md)

---

*Activate by rotating root [TASK_PROMPT.md](../../TASK_PROMPT.md) after owner approval. Implementation blocked until then.*
