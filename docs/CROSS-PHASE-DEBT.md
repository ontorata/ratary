# Cross-phase debt register

> **Maintainer / internal register** — not required reading for installing or running Ratary.  
> OSS users: see [CHANGELOG.md](../CHANGELOG.md) for release scope.

Last updated: 2026-07-18

---

## Closed in this release

| ID | Item | Resolution |
|----|------|------------|
| **D8-03** | Neptune graph traversal | **Closed** — Phase 33 `NeptuneGraphProvider` + HTTP Gremlin |
| **Fabric** | Google Drive live connector | **Closed** — `DriveLiveConnector` |
| **Fabric** | Universal memory fabric (Phase 32) | **Closed** — `UniversalMemoryFabricOrchestrator` |
| **Fabric** | SharePoint / Teams live (Phase 34) | **Closed** — Microsoft Graph connectors |
| **SC-28-02** | OpenAPI SDK codegen | **Closed** — `npm run generate:sdks` + CI verify script |
| **Ops-2026-07-18** | SDK codegen CI on GitHub | **Closed** — `.github/workflows/sdk-codegen.yml` + timestamp-tolerant verify |
| **Ops-2026-07-18** | D1 provenance migration | **Closed** — `npm run db:migrate` against prod D1 |
| **Ops-2026-07-18** | Notion + fabric flags on Vercel | **Closed** — `supportsKnowledgeFabric: true` on prod |

---

## Still open (ops — not code phases)

| Item | Owner action |
|------|----------------|
| Phase 4 operational proof (30-day · external org) | Run [RATARY-VALIDATION-RUNBOOK.md](RATARY-VALIDATION-RUNBOOK.md) weekly · collect usage evidence |
| **Prod connector creds** (Confluence · Drive · SharePoint · Teams) | Add to `.env` → `.\scripts\vercel-production-env.ps1` → `vercel --prod` |
| **ChatGPT OAuth IdP** | Deploy `infra/keycloak` on Render · point `auth.ontorata.com` DNS away from Vercel → Keycloak · then `vercel-mcp-oauth-env.ps1` (conflicts with Smithery API-key mode — see [OPS-PRODUCTION-VERIFY.md](OPS-PRODUCTION-VERIFY.md)) |
| MCP directory follow-ups | [MCP/submission/directory-status.md](../MCP/submission/directory-status.md) — PulseMCP ✅ · awesome-mcp PR #9454 open · appcypher PR · Cursor marketplace manual submit |
| Neptune IAM SigV4 | Optional hardening when cluster requires signed requests |
| Dgraph adapter | Future graph phase (not proposed) |

---

## Enterprise modules

All Phase **10.5–25** extension tracks are **implemented in code** and **default OFF**. See [ENTERPRISE-MODULES.md](ENTERPRISE-MODULES.md).

---

*Public mirror · [PHASES-32-34.md](PHASES-32-34.md)*
