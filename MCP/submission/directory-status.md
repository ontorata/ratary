# Directory submission status

Track operator submissions for **Ratary Memory MCP** (`ratary`). Update this file after each action.

| Directory | URL | Method | Status | Reference / date |
|-----------|-----|--------|--------|------------------|
| mcpservers.org | https://mcpservers.org/submit | Web form | **Listed** | [Ratary listing](https://mcpservers.org/id/servers/github-com-ontorata-ratary-tree-main-mcp) · updates via GitHub README + email operator |
| Official MCP Registry | https://registry.modelcontextprotocol.io/ | `mcp-publisher` CLI | **Listed** | `io.github.ontorata/ratary` v1.1.1 · published 2026-07-06 |
| awesome-mcp-servers (punkpeye) | https://github.com/punkpeye/awesome-mcp-servers | GitHub PR | **Submitted** | [PR #9454](https://github.com/punkpeye/awesome-mcp-servers/pull/9454) · 2026-07-06 |
| awesome-mcp-servers (appcypher) | https://github.com/appcypher/awesome-mcp-servers | GitHub PR | **Ready** | Branch `add-ratary-appcypher` on `ontorata/awesome-mcp-servers-1` · [open PR via compare](https://github.com/appcypher/awesome-mcp-servers/compare/main...ontorata:add-ratary-appcypher?expand=1) (`gh pr create` blocked by upstream GraphQL) |
| PulseMCP | https://pulsemcp.com/submit | Auto-sync from Official Registry | **Pending sync** | Registry `io.github.ontorata/ratary` active 2026-07-06 · see [pulsemcp.md](pulsemcp.md) · expedite: hello@pulsemcp.com |
| mcp.so | https://mcp.so/submit | GitHub issue | **Submitted** | [mcpso#1 comment](https://github.com/chatmcp/mcpso/issues/1#issuecomment-4890737288) · 2026-07-06 · [mcp-so.md](mcp-so.md) |
| Cursor marketplace | https://cursor.com/marketplace/publish | Manual | **Ready** | Plugin at `harness/cursor/` + `.cursor-plugin/marketplace.json` · [cursor-marketplace.md](cursor-marketplace.md) |
| Claude Code marketplace | Anthropic plugin program | `publish-marketplace.ps1` | **Published** | https://github.com/ontorata/ratary-marketplace · `/plugin marketplace add ontorata/ratary-marketplace` |
| Smithery | https://smithery.ai/new | URL + server-card | **Listed** | Gateway `ratary--hello-y4u6.run.tools` · server-card 28 tools · scan SUCCESS 2026-07-06 · [smithery.md](smithery.md) |
| Glama.ai | https://glama.ai/mcp/servers | GitHub index + claim | **Listed** | [ontorata/ratary](https://glama.ai/mcp/servers/ontorata/ratary) · live 2026-07-06 · badge `badges/score.svg` · [glama.md](glama.md) |

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Ready** | Submission pack complete; operator has not submitted yet |
| **Submitted** | Form/PR sent; awaiting review |
| **Listed** | Live on directory |
| **Rejected** | Needs revision — note reason in Reference column |
| **N/A** | Not applicable or auto-indexed |

---

*Last pack update: 2026-07-06 (local dev ports: Ratary `9876`, Studio `8765` — [CONFIGURATION.md](../../docs/CONFIGURATION.md#local-development-ports)).*
