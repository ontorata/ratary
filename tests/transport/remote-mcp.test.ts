import { describe, it, expect } from 'vitest';
import { isInitializeRequest } from '../../src/transport/mcp/remote/mcp-remote-context.js';
import { createRemoteMcpBinding, createStdioMcpBinding } from '../../src/transport/mcp/mcp-context-binding.js';

describe('Phase 13.1 — remote MCP helpers', () => {
  it('detects MCP initialize JSON-RPC requests', () => {
    expect(isInitializeRequest({ jsonrpc: '2.0', method: 'initialize', params: {} })).toBe(true);
    expect(isInitializeRequest({ jsonrpc: '2.0', method: 'tools/list' })).toBe(false);
  });

  it('exports stdio and remote MCP context bindings', () => {
    const scopeResolver = {
      resolveFromMcp: async () => ({ ownerId: 'o1' }),
      resolveFromRequest: async () => ({ ownerId: 'o1' }),
    };
    expect(createStdioMcpBinding(scopeResolver).getTransportContext().source).toBe('mcp-stdio');
    expect(createRemoteMcpBinding(scopeResolver).getTransportContext).toBeTypeOf('function');
  });
});
