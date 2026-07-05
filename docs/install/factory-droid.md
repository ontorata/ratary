# Factory Droid — Install Ratary Memory MCP

**Server id:** `ratary`

---

## Marketplace

```bash
droid plugin marketplace add https://github.com/ontorata/ratary
droid plugin install ratary@ratary
```

Adjust marketplace id when the official listing is published.

---

## Fallback

Use local stdio or `@ratary/mcp-server` — [remote.md](remote.md) · [cursor.md](cursor.md).

---

## Verify

```bash
droid plugin list
```

Confirm **`ratary`** MCP is active in a Droid session.
