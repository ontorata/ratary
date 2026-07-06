# Claude Code — plugin marketplace

Install guide: [docs/install/claude-code.md](../../docs/install/claude-code.md)  
Marketplace manifest: [harness/marketplace/ratary-marketplace.json](../../harness/marketplace/ratary-marketplace.json)

---

## Marketplace commands (published)

```text
/plugin marketplace add ontorata/ratary-marketplace
/plugin install ratary@ratary-marketplace
```

**Marketplace repo:** https://github.com/ontorata/ratary-marketplace (sync via `scripts/publish-marketplace.ps1`)

---

## Marketplace manifest (in-repo source)

File: `harness/marketplace/ratary-marketplace.json`

| Field | Value |
|-------|-------|
| Plugin id | `ratary` |
| Name | Ratary Memory MCP |
| Repository | `https://github.com/ontorata/ratary` |
| Install doc | `docs/install/claude-code.md` |

---

## Claude plugin metadata

Optional plugin stub: [harness/claude-code/plugin.json](../../harness/claude-code/plugin.json) — metadata only; MCP wiring remains `npm run setup` / `.mcp.json`.

---

## Fallback (always works)

```bash
npm run setup
claude   # approve MCP server "ratary" when prompted
```

---

## Submission notes

- Claude official marketplace: submit via Anthropic partner / plugin program when open.
- Include MIT license, install URL, and boundary note (Ratary ≠ Ontorata MCP).

Log submission in [directory-status.md](directory-status.md).
