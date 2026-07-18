# Production ops verification

Run after Vercel env changes or ops closeout:

```powershell
.\scripts\ops-verify-production.ps1
```

Checks (no secrets printed):

| Check | Pass criteria |
|-------|---------------|
| Hosted health | `https://ratary.ontorata.com` responds |
| Knowledge fabric flag | `supportsKnowledgeFabric: true` |
| Notion connector | dry-run succeeds (token on Vercel) |
| Optional connectors | Confluence / Drive / SharePoint / Teams env on Vercel |
| Universal fabric flags | `UNIVERSAL_MEMORY_FABRIC_ENABLED`, `FEDERATION_*` on Vercel |
| D1 migrations | `npm run db:migrate` succeeds locally |
| OAuth IdP | `OIDC_ISSUER_URL` host returns OpenID configuration |
| MCP OAuth mode | PRM includes `authorization_servers` when OAuth enabled |
| Smithery mode | PRM has no `authorization_servers` when OAuth disabled |

## Blockers requiring owner secrets

Set in local `.env`, then push with `.\scripts\vercel-production-env.ps1`:

- `CONFLUENCE_*`
- `GOOGLE_DRIVE_*`
- `SHAREPOINT_*`
- `TEAMS_*`

## OAuth vs Smithery (production tradeoff)

| Mode | `REMOTE_MCP_OAUTH_ENABLED` | Use case |
|------|----------------------------|----------|
| Smithery / API key | `false` | Current prod default — `@ratary/mcp-server` gateway |
| ChatGPT OAuth | `true` + live IdP | Requires DCR IdP at `OIDC_ISSUER_URL` |

Deploy IdP: [MCP-CHATGPT-OAUTH.md](MCP-CHATGPT-OAUTH.md) · `infra/keycloak/render.yaml`

**DNS note:** `auth.ontorata.com` currently resolves to Vercel. Point it to Render (Keycloak) before enabling OAuth on production.

---

*Ops mirror · [README roadmap](../README.md#roadmap)*
