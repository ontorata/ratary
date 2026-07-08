# Architecture ADR Index — Identity Foundation

**Directory:** `.ai/core/architecture/`  
**Status:** Active — P0-B Wave 1  
**Public mirror:** [docs/architecture/governance/adr-index.md](../../../docs/architecture/governance/adr-index.md)

| ID | File | Status | Summary |
|----|------|--------|---------|
| ADR-0001 | [ADR-0001-identity-boundary.md](./ADR-0001-identity-boundary.md) | Accepted | Auth identity · owner · org/workspace context · bootstrap vs data-plane |
| ADR-0002 | [ADR-0002-tenant-isolation.md](./ADR-0002-tenant-isolation.md) | Accepted | Organization tenant boundary · Org A ≠ Org B |
| ADR-0003 | [ADR-0003-authorization-model.md](./ADR-0003-authorization-model.md) | Accepted | Permission contract · tenant-before-permission · authorization-boundary |
| ADR-0006 | [ADR-0006-recall-intelligence-boundary.md](./ADR-0006-recall-intelligence-boundary.md) | Accepted | Recall intelligence ownership · candidate/policy/assembly separation |
| ADR-0007 | [ADR-0007-ontory-runtime-kernel-boundary.md](./ADR-0007-ontory-runtime-kernel-boundary.md) | **Accepted** | Ontory runtime kernel · separate repo · REST adapter · stub-first · stateless |
| ADR-0008 | [ADR-0008-ontory-provider-integration.md](./ADR-0008-ontory-provider-integration.md) | **Accepted · Closed** | P2-B · OpenAI first · official SDK in adapter only · gpt-4o-mini config · no SDK types across port · streaming deferred · tag `org-memory-p2-b-complete` |
| ADR-0009 | [ADR-0009-provider-conformance-harness.md](./ADR-0009-provider-conformance-harness.md) | **Accepted · Closed** | P2-C.0 · conformance harness · freeze P2-B contract · block Anthropic until PASS · no new vendors |
| ADR-0010 | [ADR-0010-ontory-anthropic-provider-integration.md](./ADR-0010-ontory-anthropic-provider-integration.md) | **Accepted** | P2-C.1 · Anthropic thin adapter · plug into ADR-0009 contract · conformance gate · no Kernel changes |
| ADR-0011 | [ADR-0011-ontory-gemini-provider-integration.md](./ADR-0011-ontory-gemini-provider-integration.md) | **Proposed** | P2-C.2 · Gemini thin adapter · third conformance subject · capability negotiation deferred |

**Template:** [ADR-TEMPLATE.md](./ADR-TEMPLATE.md)

**Enforcement:** `npm run ci:adr-impact` — see [ARCHITECTURE-CHANGE-MAP.md](../governance/ARCHITECTURE-CHANGE-MAP.md)
