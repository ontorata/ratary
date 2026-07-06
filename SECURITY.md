# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `1.0.x` (Ratary Server) | Yes |

Client packages (`@ratary/sdk`, `@ratary/cli`, `@ratary/mcp-server`) at **1.1.0** are supported against Ratary Server **1.0.x**. See [CHANGELOG.md](CHANGELOG.md).

## Reporting a vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

Email **hello@ontorata.com** with:

- Description and impact
- Steps to reproduce
- Affected version / commit

We aim to acknowledge within **5 business days**. We will coordinate disclosure and credit if you wish.

## Secure deployment reminders

- Rotate `AUTH_SECRET` before production — never use the `.env.example` placeholder
- Set `MCP_OWNER_ID` in production (`NODE_ENV=production`) for scoped MCP stdio
- Use `RATE_LIMIT_REDIS_URL` on multi-instance hosts (e.g. Vercel)

See [docs/GUIDE.md — Security](docs/GUIDE.md#3-security).
