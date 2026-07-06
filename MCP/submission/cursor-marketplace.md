# Cursor — marketplace / directory listing

Install guide: [docs/install/cursor.md](../../docs/install/cursor.md)  
Plugin bundle: [harness/cursor/](../../harness/cursor/) · Marketplace manifest: [.cursor-plugin/marketplace.json](../../.cursor-plugin/marketplace.json)

---

## Submit (operator)

1. Confirm `main` has `.cursor-plugin/marketplace.json` and `harness/cursor/` plugin.
2. Open **[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)**.
3. Submit repository URL: `https://github.com/ontorata/ratary`
4. Review typically **1–2 weeks**; status: marketplace-publishing@cursor.com

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

## Submission checklist (from Cursor docs)

- [x] `.cursor-plugin/marketplace.json` at repo root
- [x] `harness/cursor/.cursor-plugin/plugin.json`
- [x] `harness/cursor/mcp.json` (npm `@ratary/mcp-server`)
- [x] `harness/cursor/README.md`
- [ ] Operator submitted at cursor.com/marketplace/publish
- [ ] Listed — log URL in [directory-status.md](directory-status.md)

Log submission in [directory-status.md](directory-status.md).
