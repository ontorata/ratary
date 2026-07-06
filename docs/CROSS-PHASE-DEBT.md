# Cross-phase debt register

> **Maintainer / internal register** — not required reading for installing or running Ratary.  
> OSS users: see [CHANGELOG.md](../CHANGELOG.md) for release scope.

Last updated: 2026-07-06

---

## Closed in this release

| ID | Item | Resolution |
|----|------|------------|
| **D8-03** | Neptune graph traversal | **Closed** — Phase 33 `NeptuneGraphProvider` + HTTP Gremlin |
| **Fabric** | Google Drive live connector | **Closed** — `DriveLiveConnector` |
| **Fabric** | Universal memory fabric (Phase 32) | **Closed** — `UniversalMemoryFabricOrchestrator` |
| **Fabric** | SharePoint / Teams live (Phase 34) | **Closed** — Microsoft Graph connectors |
| **SC-28-02** | OpenAPI SDK codegen | **Closed** locally — `npm run generate:sdks` |

---

## Still open (ops — not code phases)

| Item | Owner action |
|------|----------------|
| SDK codegen CI on GitHub | Push `.github/workflows/sdk-codegen.yml` — [SDK-CODEGEN-CI.md](SDK-CODEGEN-CI.md) |
| ChatGPT MCP OAuth | Provision DCR-capable IdP — [MCP-CHATGPT-OAUTH.md](MCP-CHATGPT-OAUTH.md) |
| MCP directory PRs | [MCP/submission/directory-status.md](../MCP/submission/directory-status.md) |
| Connector creds in Vercel prod | Confluence, Drive, SharePoint, Teams |
| Universal fabric prod | Flags + `db:migrate` + federation peers |
| Neptune IAM SigV4 | Optional hardening when cluster requires signed requests |
| Dgraph adapter | Future graph phase (not proposed) |

---

## Enterprise modules

All Phase **10.5–25** extension tracks are **implemented in code** and **default OFF**. See [ENTERPRISE-MODULES.md](ENTERPRISE-MODULES.md).

---

*Public mirror · [PHASES-32-34.md](PHASES-32-34.md)*
