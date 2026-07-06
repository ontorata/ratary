# ChatGPT / MCP OAuth (DCR-capable IdP)

**Scope:** Enabling OAuth for MCP clients (ChatGPT, Claude connectors with OIDC) on hosted Ratary.  
**Not covered:** API-key mode (`REMOTE_MCP_OAUTH_ENABLED=false`) — see [GUIDE — Remote MCP](GUIDE.md).

---

## Why not Supabase Auth?

ChatGPT and strict MCP OAuth clients require **OAuth 2.0 Dynamic Client Registration (DCR)** at the authorization server. **Supabase Auth does not expose DCR** for third-party MCP clients — use a DCR-capable IdP instead.

| IdP | DCR | Notes |
|-----|-----|-------|
| **Keycloak** | ✅ | Self-host; `client-registration` realm setting |
| **Okta** | ✅ | Custom authorization server + DCR policy |
| **Auth0** | Partial | Dynamic application registration (tenant setting) |
| **Azure AD** | Limited | Prefer Keycloak/Okta in front for MCP |
| **Supabase** | ❌ | API keys + JWT only — **not for ChatGPT MCP** |

---

## Ratary server flags

```env
REMOTE_MCP_ENABLED=true
REMOTE_MCP_OAUTH_ENABLED=true
REMOTE_MCP_PUBLIC_URL=https://ratary.ontorata.com
OIDC_ISSUER_URL=https://auth.example.com/realms/ratary
OIDC_MCP_OWNER_ID=<ratary-owner-uuid>
```

**Discovery:** `GET /.well-known/oauth-protected-resource/mcp` returns `authorization_servers` when OAuth is enabled.

**Code paths:**

- `src/transport/mcp/remote/mcp-oauth-metadata.ts` — PRM + WWW-Authenticate
- `src/auth/providers/oidc-access-token.provider.ts` — bearer validation
- `src/transport/mcp/remote/register-remote-mcp-oauth-routes.ts` — metadata routes

---

## Keycloak quick setup (example)

1. Create realm `ratary`.
2. Enable **Client registration** (Realm settings → Client policies / dynamic registration).
3. Create confidential client `ratary-mcp` for the Ratary server (client credentials or JWT for token introspection if needed).
4. Set `OIDC_ISSUER_URL=https://<keycloak-host>/realms/ratary`.
5. Map ChatGPT DCR-registered client to allowed scopes: `openid`, `profile`, `email`, `mcp:tools`.
6. Ensure access tokens include `sub` mappable to `OIDC_MCP_OWNER_ID` or configure claim mapping.

---

## ChatGPT connector flow

1. User adds MCP server URL: `https://ratary.ontorata.com/mcp`
2. Client fetches PRM → discovers `authorization_servers`
3. Client performs DCR + authorization code flow against IdP
4. Ratary validates bearer via OIDC issuer JWKS (`OidcAccessTokenProvider`)

---

## Smithery vs Glama (API key mode)

When `REMOTE_MCP_OAUTH_ENABLED=false`, PRM omits `authorization_servers` (Smithery setup needs HTTP 200). Glama must not treat server as OAuth-required — see PR #26/#27.

**Do not enable OAuth on production until IdP DCR is tested end-to-end.**

---

## Verification

```powershell
# PRM with OAuth off (API key)
Invoke-RestMethod https://ratary.ontorata.com/.well-known/oauth-protected-resource/mcp

# After OAuth on + IdP configured
# Expect authorization_servers array in JSON
```

---

*Ops runbook — no new phase. Blocker is IdP provisioning, not Ratary code.*
