# Phase 7.5 — Runtime Compatibility

**Status:** ✅ Implemented (2026-07-04) · ADR-025 Accepted  
**Capability:** Machine-readable deployment manifest — feature flags, limits, MCP tool registry, protocol version. **No agent runtime in repo.**

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Discovery architecture, manifest shape, invariants |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Contract tests and verification |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist — all tracks ✅ |

**ADR:** [ADR-025](../../../docs/adr/025-capability-discovery-api.md)

---

## Discovery endpoints

| Protocol | Entry | Auth |
|----------|-------|------|
| REST | `GET /api/v1/capabilities` | Public (no auth required) |
| MCP | `get_capabilities` tool | MCP scope from env |
| OpenAPI | `GET /docs/json` | Public (existing) |

Response includes `X-Protocol-Version` header on REST.

---

## Quick start

```bash
curl http://localhost:3000/api/v1/capabilities
```

Or via MCP: call `get_capabilities` with no parameters.

---

## Related

- Phase 7 agent runtime boundary (external): [07-agent-runtime](../07-agent-runtime/README.md)
- Phase 10.5 transport section in manifest: [10.5-transport-connectivity](../10.5-transport-connectivity/README.md)
