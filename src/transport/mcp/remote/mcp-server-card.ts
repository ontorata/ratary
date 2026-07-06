import { MCP_TOOL_NAMES } from '../../../capabilities/mcp-tool-names.js';
import {
  MCP_SERVER_CARD_PROMPTS,
  MCP_SERVER_CARD_RESOURCES,
  MCP_SERVER_CARD_TOOLS,
  MCP_SERVER_INSTRUCTIONS,
} from './mcp-server-card-catalog.js';

/** Smithery / SEP-1649 static server card — bypasses OAuth discovery scan for API-key servers. */
export const MCP_SERVER_CARD_PATH = '/.well-known/mcp/server-card.json';

export interface McpServerCardOptions {
  version?: string;
}

export function buildMcpServerCard(options: McpServerCardOptions = {}): Record<string, unknown> {
  const version = options.version ?? '1.1.1';

  const toolsByName = new Map(MCP_SERVER_CARD_TOOLS.map((t) => [t.name, t]));

  return {
    serverInfo: {
      name: 'Ratary Memory MCP',
      title: 'Ratary Memory MCP',
      version,
      description:
        'Persistent coding memory for AI assistants — hybrid search, knowledge graph, token-efficient context. 28 tools. MIT.',
      homepage: 'https://github.com/ontorata/ratary/tree/main/MCP',
      repository: 'https://github.com/ontorata/ratary',
      license: 'MIT',
      keywords: ['mcp', 'memory', 'coding-assistant', 'ai-brain', 'knowledge-graph'],
    },
    instructions: MCP_SERVER_INSTRUCTIONS,
    authentication: {
      required: true,
      schemes: ['bearer'],
      description:
        'Ratary API key (aic_...) via Authorization: Bearer or X-API-Key. Create keys at https://studio.ontorata.com',
    },
    tools: MCP_TOOL_NAMES.map((name) => {
      const tool = toolsByName.get(name);
      if (!tool) {
        return {
          name,
          description: `Ratary MCP tool: ${name}`,
          inputSchema: { type: 'object', properties: {} },
        };
      }
      return {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        ...(tool.outputSchema ? { outputSchema: tool.outputSchema } : {}),
        annotations: tool.annotations,
      };
    }),
    prompts: MCP_SERVER_CARD_PROMPTS,
    resources: MCP_SERVER_CARD_RESOURCES,
  };
}
