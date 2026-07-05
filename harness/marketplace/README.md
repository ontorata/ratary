# Harness marketplace manifests

Source files for **Claude Code** and other harnesses that support third-party plugin marketplaces.

---

## Claude Code marketplace

**Manifest:** [ratary-marketplace.json](ratary-marketplace.json)

When publishing a dedicated marketplace repo (`ontorata/ratary-marketplace`), copy this directory or tag a release. Users then run:

```text
/plugin marketplace add ontorata/ratary-marketplace
/plugin install ratary@ratary-marketplace
```

**In-repo fallback:** clone Ratary and run `npm run setup` — see [docs/install/claude-code.md](../../docs/install/claude-code.md).

---

## Plugin metadata

| Harness | File |
|---------|------|
| Claude Code | [../claude-code/plugin.json](../claude-code/plugin.json) |

---

## Directory submissions

Full copy-paste pack: [MCP/submission/](../../MCP/submission/README.md)

---

*Phase 31L — manifests only; no server logic.*
