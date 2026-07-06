import { describe, expect, it } from 'vitest';
import { MCP_TOOL_NAMES } from '../../../capabilities/mcp-tool-names.js';
import { buildMcpServerCard, MCP_SERVER_CARD_PATH } from './mcp-server-card.js';

describe('buildMcpServerCard', () => {
  it('exposes Smithery static card path constant', () => {
    expect(MCP_SERVER_CARD_PATH).toBe('/.well-known/mcp/server-card.json');
  });

  it('lists all MCP tools with bearer auth metadata', () => {
    const card = buildMcpServerCard({ version: '1.1.1' });
    expect(card.serverInfo).toEqual({ name: 'Ratary Memory MCP', version: '1.1.1' });
    expect(card.authentication).toMatchObject({ required: true, schemes: ['bearer'] });
    const tools = card.tools as Array<{ name: string }>;
    expect(tools).toHaveLength(MCP_TOOL_NAMES.length);
    expect(tools.map((t) => t.name)).toEqual([...MCP_TOOL_NAMES]);
  });
});
