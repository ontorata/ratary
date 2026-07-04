# Phase 10.5 — Transport & Connectivity Layer

**Status:** ✅ Implemented (2026-07-04) · ADR-027 Implemented  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 10.5

---

## Summary

Formalize **Transport & Connectivity** as a canonical outer layer. REST and MCP remain default; optional gRPC for internal/enterprise workloads. Application services unchanged.

| Track | Focus |
|-------|-------|
| 10.5A | `TransportContext` + shared scope resolution |
| 10.5B | Shared application handlers (anti-drift) |
| 10.5C | REST folder migration (`transport/rest/`) |
| 10.5D | MCP consolidation (`transport/mcp/`) |
| 10.5E | gRPC opt-in (`GRPC_ENABLED=false` default) |
| 10.5F | Manifest + documentation |

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Approved design intent |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [MIGRATION.md](MIGRATION.md) | Strangler re-exports (no DDL) |
| [TESTING.md](TESTING.md) | Verification strategy |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |
| [REVIEW.md](REVIEW.md) | Gate verdict |
| [COMPLETION.md](COMPLETION.md) | Closure evidence |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned |
| [RISKS.md](RISKS.md) | Phase risk register |

**ADR:** [ADR-027](../../adr/027-transport-connectivity-layer.md)

---

## Quick start

```bash
# Default — REST + MCP only (no change)
npm run dev

# Optional gRPC (long-running Node, not Vercel)
GRPC_ENABLED=true
GRPC_PORT=50051
npm run dev

# Check active transports
curl http://localhost:3000/api/v1/capabilities | jq .transport
```

---

## Non-goals

- Business logic changes in application services
- Repository or storage port changes
- Breaking REST v1 or MCP tool schemas
- In-repo `@ai-brain/client` SDK

---

## Related

- Phase 13 Protocol Layer (extends streaming): [13-protocol-layer](../13-protocol-layer/README.md)
- Phase 7.5 capabilities discovery: [07.5-runtime-compatibility](../07.5-runtime-compatibility/README.md)
