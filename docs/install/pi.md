# Pi — Install Ratary Memory MCP

**Server id:** `ratary`

---

## Install from Git

```bash
pi install git:github.com/ontorata/ratary
```

Development checkout:

```bash
pi -e /path/to/ratary
```

Pi loads MCP config from the package metadata when published; until then use local path.

---

## MCP wiring

Ensure Pi points at stdio entry `src/mcp/stdio.ts` with repo `.env` loaded, or use `@ratary/mcp-server` — [remote.md](remote.md).

---

## Verify

Start a Pi session and invoke memory search tools.
