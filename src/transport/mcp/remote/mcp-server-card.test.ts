import { describe, expect, it } from 'vitest';
import { MCP_TOOL_NAMES } from '../../../capabilities/mcp-tool-names.js';
import { MCP_SERVER_CARD_TOOLS } from './mcp-server-card-catalog.js';
import { buildMcpServerCard, MCP_SERVER_CARD_PATH } from './mcp-server-card.js';

describe('buildMcpServerCard', () => {
  it('exposes Smithery static card path constant', () => {
    expect(MCP_SERVER_CARD_PATH).toBe('/.well-known/mcp/server-card.json');
  });

  it('lists all MCP tools with rich metadata for Smithery scoring', () => {
    const card = buildMcpServerCard({ version: '1.1.1' });
    expect(card.serverInfo).toMatchObject({
      name: 'Ratary Memory MCP',
      version: '1.1.1',
      homepage: 'https://github.com/ontorata/ratary/tree/main/MCP',
    });
    expect(card.instructions).toBeTruthy();
    expect(card.authentication).toMatchObject({ required: true, schemes: ['bearer'] });

    const tools = card.tools as Array<{
      name: string;
      description: string;
      inputSchema: { properties?: Record<string, unknown> };
      annotations?: Record<string, unknown>;
    }>;
    expect(tools).toHaveLength(MCP_TOOL_NAMES.length);
    expect(tools.map((t) => t.name)).toEqual([...MCP_TOOL_NAMES]);
    expect(MCP_SERVER_CARD_TOOLS).toHaveLength(MCP_TOOL_NAMES.length);

    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(20);
      expect(tool.annotations).toBeDefined();
    }

    const search = tools.find((t) => t.name === 'search_memory');
    expect(search?.inputSchema.properties?.q).toBeDefined();

    expect(card.prompts).toHaveLength(3);
    expect(card.resources).toHaveLength(3);
  });
});
