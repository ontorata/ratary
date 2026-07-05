# Cursor — marketplace / directory listing

Install guide: [docs/install/cursor.md](../../docs/install/cursor.md)

---

## Listing metadata

| Field | Value |
|-------|-------|
| **Plugin id** | `ratary` |
| **Display name** | Ratary Memory MCP |
| **Publisher** | Ontorata |
| **Category** | Memory · Developer tools |
| **Repository** | `https://github.com/ontorata/ratary` |
| **Install doc** | `https://github.com/ontorata/ratary/blob/main/docs/install/cursor.md` |
| **MCP server id** | `ratary` (must not rename) |

---

## User-facing install (when listed)

In Cursor chat:

```text
/add-plugin ratary
```

Or search **Ratary** in Cursor plugin marketplace.

---

## Fallback (always works)

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary && npm install && cp .env.example .env
npm run db:migrate && npm run setup
```

Writes `.cursor/mcp.json` automatically.

---

## Submission notes

- Cursor marketplace submission is **manual** — use Cursor publisher program / partner form when available.
- Attach [mcpservers-org.md](mcpservers-org.md) short description and link to `docs/install/cursor.md`.
- Plugin bundle may reference repo URL; stdio MCP requires user clone + `.env` (document in listing).

Log submission in [directory-status.md](directory-status.md).
