# Phase 7.5 — Runtime Compatibility

**Status:** ✅ Implemented (2026-07-04) · ADR-025 Accepted · **D7.5 deferred closed 2026-07-05**  
**Capability:** Machine-readable deployment manifest — feature flags, limits, MCP tool registry, protocol version, condensed init snapshot, and bidirectional capability negotiation. **No agent runtime in repo.**

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ N/A (no DDL) |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04; D7.5-01/03 follow-up closed 2026-07-05.*

---

## Discovery endpoints

| Protocol | Entry | Auth |
|----------|-------|------|
| REST | `GET /api/v1/capabilities` | Public |
| REST | `POST /api/v1/capabilities/negotiate` | Public (D7.5-03) |
| MCP | `get_capabilities` tool | MCP scope from env |
| MCP | `negotiate_capabilities` tool | MCP scope from env (D7.5-03) |
| MCP | `initialize` `_meta['io.aibrain/capabilities']` | Condensed snapshot (D7.5-01) |
| MCP | `initialize` `_meta` request/negotiation keys | Bidirectional handshake (D7.5-03) |
| OpenAPI | `GET /docs/json` | Public (existing) |
| SDK | `@ratary/sdk` `CapabilitiesApi.get()` / `.negotiate()` | Phase 16 (D7.5-02) |

Response includes `X-Protocol-Version` header on REST capabilities and negotiate routes.

---

## Quick start

```bash
curl http://localhost:3000/api/v1/capabilities

curl -X POST http://localhost:3000/api/v1/capabilities/negotiate \
  -H "Content-Type: application/json" \
  -d '{"protocolVersion":"1.0.0","requiredCapabilities":["supportsMemoryCRUD"],"transports":["rest"]}'
```

MCP: call `get_capabilities` or `negotiate_capabilities`; on remote connect, send client declaration in `initialize.params._meta['io.aibrain/capabilities-request']`.

---

## Related

- Phase 7 agent runtime boundary (external): [07-agent-runtime](../07-agent-runtime/README.md)
- Phase 13.1 remote MCP: [13.1-remote-mcp-clients](../13.1-remote-mcp-clients/README.md)
- Phase 16 SDK: [16-developer-platform](../16-developer-platform/README.md)
