# Open phases (32–34)

**Status:** Design-ready — run Agent Forge `forge-intent` before implementation.  
**Governance mirror:** `.ai/phases/` (local, not in git).

---

## Phase 32 — Universal memory fabric

**Goal:** Unify knowledge fabric ingest (Notion, Drive, Confluence, …) with federation cross-org exchange under one provenance and cursor model.

| ID | Criterion (draft) |
|----|-------------------|
| SC-32-01 | Single provenance schema for fabric + federated memories |
| SC-32-02 | Cross-source context build with org boundary enforcement |
| SC-32-03 | Federation pull can target fabric connector scope (policy-gated) |
| SC-32-04 | Flag-off preserves Phase 23 + Phase 14 behavior |

**Depends on:** Phase 23, 14, 29 · **Flag (proposed):** `UNIVERSAL_MEMORY_FABRIC_ENABLED`

---

## Phase 33 — Neptune full graph traversal

**Goal:** Replace `NeptuneGraphProvider` stub with Gremlin traversal — parity with Neo4j adapter + `graph/traversal.ts`.

| ID | Criterion (draft) |
|----|-------------------|
| SC-33-01 | `GRAPH_PROVIDER=neptune` traverses neighbors |
| SC-33-02 | Owner-scoped edges; depth limits from `graph.config.ts` |
| SC-33-03 | IAM auth path documented |
| SC-33-04 | `neo4j` / `d1` unchanged when off |

**Code today:** `src/infrastructure/graph/neptune/neptune-graph-provider.ts` (throws).

---

## Phase 34 — Enterprise connectors (SharePoint, Teams)

**Goal:** Live Microsoft 365 adapters (Graph API) following Phase 29 / Drive pattern.

| ID | Criterion (draft) |
|----|-------------------|
| SC-34-01 | SharePoint live pull E2E |
| SC-34-02 | Teams ingest via Graph (not webhook-only) |
| SC-34-03 | Env + `vercel-production-env.ps1` + CONFIGURATION.md |
| SC-34-04 | `test-connector-sync.ts --connector sharepoint|teams` |

**Blocker:** Azure AD app registration + admin consent.

---

## No new phase (implemented / ops)

| Track | Location |
|-------|----------|
| **SC-28-02** SDK codegen | `npm run generate:sdks` · [CI sdk-codegen.yml](../.github/workflows/sdk-codegen.yml) |
| **ChatGPT OAuth** | [MCP-CHATGPT-OAUTH.md](MCP-CHATGPT-OAUTH.md) — DCR IdP (Keycloak/Okta), not Supabase |

---

*Index: [README roadmap](../README.md#roadmap)*
