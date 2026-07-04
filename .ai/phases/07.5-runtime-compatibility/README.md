# Phase 7.5 — Runtime Compatibility

**Status:** ✅ Implemented (2026-07-04) · ADR-025 Accepted  
**Capability:** Machine-readable deployment manifest — feature flags, limits, MCP tool registry, protocol version. **No agent runtime in repo.**

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ N/A (no DDL) or prior phase |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04.*


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
