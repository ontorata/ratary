# Directory submission status

Track operator submissions for **Ratary Memory MCP** (`ratary`). Update this file after each action.

| Directory | URL | Method | Status | Reference / date |
|-----------|-----|--------|--------|------------------|
| mcpservers.org | https://mcpservers.org/submit | Web form | **Listed** | [Ratary listing](https://mcpservers.org/id/servers/github-com-ontorata-ratary-tree-main-mcp) · updates via GitHub README + email operator |
| Official MCP Registry | https://registry.modelcontextprotocol.io/ | `mcp-publisher` CLI | **Listed** | `io.github.ontorata/ratary` v1.1.1 · published 2026-07-06 |
| awesome-mcp-servers (punkpeye) | https://github.com/punkpeye/awesome-mcp-servers | GitHub PR | **Submitted** | [PR #9454](https://github.com/punkpeye/awesome-mcp-servers/pull/9454) · 2026-07-06 |
| awesome-mcp-servers (appcypher) | https://github.com/appcypher/awesome-mcp-servers | GitHub PR | **Ready** | Branch `add-ratary-appcypher` on `ontorata/awesome-mcp-servers-1` · [open PR via compare](https://github.com/appcypher/awesome-mcp-servers/compare/main...ontorata:add-ratary-appcypher?expand=1) (`gh pr create` blocked by upstream GraphQL) |
| PulseMCP | https://pulsemcp.com/submit | Web form | **Ready** | Reuse mcpservers short description |
| mcp.so | https://github.com/chatmcp/mcp.so | GitHub issue | **Optional** | Link MCP README |
| Cursor marketplace | Cursor publisher program | Manual | **Ready** | [cursor-marketplace.md](cursor-marketplace.md) |
| Claude Code marketplace | Anthropic plugin program | Manual | **Submitted-ready** | Run `scripts/publish-marketplace.ps1` → `ontorata/ratary-marketplace` |
| Smithery | https://smithery.ai/ | CLI | **Optional** | npm `@ratary/mcp-server` |
| Glama.ai | Auto-index | Passive | **N/A** | Indexes from GitHub when public |

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

*Last pack update: 2026-07-06 (Phase 31L · npm @ratary/mcp-server 1.1.1 · registry listed).*
