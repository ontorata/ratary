import { MCP_TOOL_NAMES } from '../../../capabilities/mcp-tool-names.js';

/** Smithery / SEP-1649 static server card — bypasses OAuth discovery scan for API-key servers. */
export const MCP_SERVER_CARD_PATH = '/.well-known/mcp/server-card.json';

const TOOL_DESCRIPTIONS: Partial<Record<(typeof MCP_TOOL_NAMES)[number], string>> = {
  save_memory: 'Save a new coding memory/knowledge entry',
  update_memory: 'Update an existing memory by ID',
  delete_memory: 'Delete a memory by ID',
  get_memory: 'Get a memory by UUID',
  get_memory_by_codename: 'Get a memory by codename',
  search_memory: 'Search memories by query with hybrid retrieval',
  get_memory_by_path: 'Get a memory by filesystem-like path',
  get_context: 'Build token-efficient context for a task',
  build_prompt: 'Assemble a prompt from relevant memories',
  list_projects: 'List memory projects for the owner',
  list_tags: 'List tags used across memories',
  link_memories: 'Create a relation between two memories',
  list_relations: 'List relations for a memory',
  toggle_favorite: 'Toggle favorite flag on a memory',
  archive_memory: 'Archive a memory',
  get_graph_capabilities: 'Describe knowledge graph traversal capabilities',
  traverse_relations: 'Traverse memory relations in the graph',
  list_workspaces: 'List workspaces for the owner',
  list_agents: 'List registered agents',
  register_agent: 'Register an agent identity',
  get_capabilities: 'Get deployment capability manifest',
  negotiate_capabilities: 'Negotiate capability subset with the client',
  submit_signal: 'Submit a learning or stewardship signal',
  run_stewardship: 'Run memory stewardship for a project',
  get_compression_status: 'Get context compression status',
  sync_pull: 'Pull client sync delta from the server',
  sync_push: 'Push client sync delta to the server',
  sync_status: 'Get client sync status',
};

const CORE_TOOL_SCHEMAS: Partial<
  Record<(typeof MCP_TOOL_NAMES)[number], Record<string, unknown>>
> = {
  search_memory: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'number', description: 'Max results' },
    },
    required: ['query'],
  },
  save_memory: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      project: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
    },
    required: ['title', 'content'],
  },
  get_memory: {
    type: 'object',
    properties: { id: { type: 'string', format: 'uuid' } },
    required: ['id'],
  },
  get_context: {
    type: 'object',
    properties: {
      task: { type: 'string' },
      project: { type: 'string' },
    },
    required: ['task'],
  },
  get_capabilities: {
    type: 'object',
    properties: {},
  },
};

export interface McpServerCardOptions {
  version?: string;
}

export function buildMcpServerCard(options: McpServerCardOptions = {}): Record<string, unknown> {
  const version = options.version ?? '1.1.1';

  return {
    serverInfo: {
      name: 'Ratary Memory MCP',
      version,
    },
    authentication: {
      required: true,
      schemes: ['bearer'],
      description:
        'Ratary API key (aic_...) via Authorization: Bearer or X-API-Key header. Create keys at https://studio.ontorata.com',
    },
    tools: MCP_TOOL_NAMES.map((name) => ({
      name,
      description: TOOL_DESCRIPTIONS[name] ?? `Ratary MCP tool: ${name}`,
      inputSchema: CORE_TOOL_SCHEMAS[name] ?? { type: 'object', properties: {} },
    })),
    resources: [],
    prompts: [],
  };
}
