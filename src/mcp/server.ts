/**
 * Strangler re-export (ADR-027 Phase 10.5D).
 * Canonical MCP bootstrap now lives in `transport/mcp/`.
 * Legacy import path `./server.js` is preserved for `src/mcp/stdio.ts`
 * and existing MCP client configurations.
 */
export { createMcpServer, startMcpStdioServer } from '../transport/mcp/mcp-server.js';
