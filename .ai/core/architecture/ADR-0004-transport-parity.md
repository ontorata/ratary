# ADR-0004 — Transport Parity

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — codifies P0-A Wave 4 |
| **Date** | 2026-07-08 |
| **Baseline** | `identity-wave-4-locked` @ `459f925` |
| **Related** | ADR-0003 · P0-A Wave 4–5 |

---

## Context

Ratary exposes **REST** and **MCP (remote HTTP)** surfaces. If each transport implements separate authorization logic, security drift is inevitable.

---

## Decision

1. **Transport is NOT a permission boundary.** Permission and tenant rules are identical regardless of entry surface.
2. **REST and MCP remote** MUST use the same chain:

   ```
   Same Identity → Same Tenant Context → Same Permission Context → Same Resource Decision
   ```

3. **MCP remote authenticated path** wires through `authorization-boundary.ts` — same as REST middleware sequence conceptually.
4. **MCP tool handlers** resolve scope via shared tenant + permission context (no env-owner bypass on authenticated remote path).
5. **SDK / Studio** propagate `X-Organization-Id` and `X-Workspace-Id` so consumer transport matches server expectations.

**Out of proof surface (documented limitation):**

- **MCP stdio** — single-tenant env bootstrap (`owner_id` / workspace from environment). Multi-tenant stdio rewrite is explicitly deferred.

**Primary implementation references:**

- `src/auth/authorization-boundary.ts`
- `src/transport/mcp/remote/register-remote-mcp-routes.ts`
- `src/transport/mcp/remote/resolve-handler-scope.ts`
- `tests/identity/rest-mcp-parity.test.ts` · `mcp-scope-recall.test.ts`

---

## Consequences

### Positive

- Parity tests prevent regression when adding MCP tools or REST routes.
- Studio E2E (Wave 5) validates end-to-end header propagation.

### Negative / tradeoffs

- Stdio MCP users remain on env-scoped bootstrap until future ADR.

### Non-goals

- Unifying stdio and remote MCP bootstrap in P0-A/P0-B
- Transport-specific permission namespaces
- OAuth scope per transport

---

## Evidence

| Type | Location |
|------|----------|
| Tests | `tests/identity/rest-mcp-parity.test.ts` · `studio-identity-e2e.test.ts` |
| Wave checkpoints | `.ai/governance/waves/WAVE-4-TRANSPORT-PARITY.md` · `WAVE-5-STUDIO-E2E.md` |
| Lock tags | `identity-wave-4-locked` · `identity-wave-5-locked` |

---

## Compliance

Changes to MCP remote auth wiring, transport scope resolution, or REST/MCP parity tests require ADR amendment and `ci:adr-impact` pass.
