# Installation

Install **Ratary Memory MCP** in the harness you already use. If you run **more than one harness**, install Ratary **separately in each** — every IDE maintains its own MCP config or plugin bundle.

**Ratary Memory MCP** server id is always **`ratary`**.  
**[Ontorata MCP](https://github.com/ontorata/ontorata-mcp)** is a separate ecosystem plugin — not bundled here.

For daily usage after install, see **[GUIDE.md](../GUIDE.md)**. For environment variables, see **[CONFIGURATION.md](../CONFIGURATION.md)**.

---

## Quick paths

| Scenario | Path |
|----------|------|
| SDK / CLI only (no server clone) | [packages/README.md](../../packages/README.md) → `npm install @ratary/sdk` |
| Local brain (clone + your SQL provider) | [GUIDE — Setup](../GUIDE.md#1-setup) → `npm run setup` |
| Docker Postgres | [DOCKER.md](../DOCKER.md#quick-start-postgres-profile) |
| Docker enterprise (MariaDB + MinIO) | [DOCKER.md](../DOCKER.md#profiles) |
| Ontorata Studio (web console) | [GUIDE — Studio](../GUIDE.md#ontorata-studio-web-console) |
| Hosted brain (REST API key) | [Remote / hosted](remote.md) → `@ratary/mcp-server` |
| Remote MCP URL (ChatGPT, web) | [Remote / hosted](remote.md) → deploy `/mcp` |

---

## Harness guides

| Harness | Guide |
|---------|-------|
| **Cursor** | [cursor.md](cursor.md) |
| **Claude Code** | [claude-code.md](claude-code.md) |
| **Codex App & CLI** | [codex.md](codex.md) |
| **GitHub Copilot CLI** | [copilot-cli.md](copilot-cli.md) |
| **Gemini CLI** | [gemini.md](gemini.md) |
| **Kimi Code** | [kimi.md](kimi.md) |
| **OpenCode** | [opencode.md](opencode.md) |
| **Pi** | [pi.md](pi.md) |
| **Antigravity** | [antigravity.md](antigravity.md) |
| **Factory Droid** | [factory-droid.md](factory-droid.md) |
| **Remote / hosted** | [remote.md](remote.md) |

---

## Verify installation

1. MCP server **`ratary`** shows connected (green) in your harness, or remote tools respond.
2. Ask the assistant: *"Search memory about ratary"* — or call `get_capabilities` if exposed.
3. Save a test handoff and search for it on the next session.

Troubleshooting: [GUIDE — Troubleshooting](../GUIDE.md#5-troubleshooting).

---

## Update / reinstall

Re-run the harness-specific install command, or `npm run setup` after pulling the latest Ratary repo. Marketplace installs use the harness update command (e.g. Cursor plugin update, Claude `/plugin update`).

---

## Related

| Doc | Purpose |
|-----|---------|
| [MCP/README.md](../../MCP/README.md) | Tool list, stdio vs npm vs remote · [directory listings](../../MCP/submission/README.md) |
| [examples/](../examples/) | Copy-paste JSON templates |
| [Ontorata Studio](https://github.com/ontorata/Ontorata-Studio) | Operator web UI — [setup guide](../GUIDE.md#ontorata-studio-web-console) |
