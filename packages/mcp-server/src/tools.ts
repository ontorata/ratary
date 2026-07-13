import type { AiBrainClient } from '@ratary/sdk';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface ToolHandlers {
  definitions: Tool[];
  call(name: string, args: Record<string, unknown>): Promise<unknown>;
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const WRITE_CREATE = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;

/**
 * Tool definitions optimized for Glama TDQS (purpose, usage, behavior,
 * parameters, completeness). Keep call() mapping in sync with these names.
 */
export function createToolHandlers(client: AiBrainClient): ToolHandlers {
  const definitions: Tool[] = [
    {
      name: 'get_capabilities',
      description:
        'Return the Ratary deployment capability manifest (protocol version, tool count, limits, feature flags). ' +
        'Read-only and idempotent; requires RATARY_API_KEY. ' +
        'Use at session start to discover what this deployment supports. ' +
        'Do not use for recalling memories — use search_memory or get_context instead. ' +
        'Returns a JSON capability object (no side effects).',
      annotations: { ...READ_ONLY, title: 'Get capabilities' },
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
    {
      name: 'search_memory',
      description:
        'Search persistent coding memories with hybrid ranking and return ranked hits (id, title, summary, relevance). ' +
        'Read-only; does not create or modify memories. Requires RATARY_API_KEY. ' +
        'Use when you need candidate memories matching a keyword/question before answering. ' +
        'Prefer get_memory when you already have a memory UUID. Prefer get_context when you need token-bounded context assembled for a task (not a raw hit list). ' +
        'Returns JSON search results; empty list means no matches.',
      annotations: { ...READ_ONLY, title: 'Search memories' },
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Full-text / hybrid search string (e.g. "phase-4 handoff", "AUTH-0001 postgres decision"). Required.',
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            description: 'Max hits to return (default server-side; typical 10–50). Optional.',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
    {
      name: 'save_memory',
      description:
        'Create a new persistent coding memory (title + markdown body) scoped to an optional project and tags. ' +
        'Side effect: writes a new record via the Ratary REST API; not idempotent (each call creates another memory). ' +
        'Requires RATARY_API_KEY. Does not overwrite existing memories — use get_memory/search_memory first if updating. ' +
        'Use after decisions, handoffs, or durable facts the agent should recall later. ' +
        'Do not use for ephemeral chat notes that should not persist. ' +
        'Returns the created memory JSON including id/codename/timestamps.',
      annotations: { ...WRITE_CREATE, title: 'Save memory' },
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Short human-readable title (e.g. "P1-A Task 7 acceptance gate").',
          },
          content: {
            type: 'string',
            description: 'Full markdown body stored as the memory content.',
          },
          project: {
            type: 'string',
            description: 'Project slug for scoping (e.g. "ratary", "ontorata"). Optional.',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter tags (e.g. ["handoff", "phase-4"]). Optional.',
          },
        },
        required: ['title', 'content'],
        additionalProperties: false,
      },
    },
    {
      name: 'get_memory',
      description:
        'Fetch one memory by UUID, including full content and metadata. ' +
        'Read-only and idempotent; requires RATARY_API_KEY. ' +
        'Use when you already know the memory id (from search_memory or a prior save_memory). ' +
        'Do not use for keyword discovery — use search_memory. Do not use to assemble multi-memory task context — use get_context. ' +
        'Returns the memory JSON or an API error if the id is missing.',
      annotations: { ...READ_ONLY, title: 'Get memory by ID' },
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Memory UUID returned by save_memory or search_memory.',
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    },
    {
      name: 'get_context',
      description:
        'Assemble token-efficient ranked context for a coding task from persistent memories (summaries by default). ' +
        'Read-only; does not write memories. Requires RATARY_API_KEY. ' +
        'Use at the start of implementation or when answering with organizational memory. ' +
        'Prefer search_memory when you need raw ranked hits to inspect individually. Prefer get_memory for a known UUID. ' +
        'Returns markdown/JSON context suitable for injecting into the agent prompt.',
      annotations: { ...READ_ONLY, title: 'Build task context' },
      inputSchema: {
        type: 'object',
        properties: {
          task: {
            type: 'string',
            description:
              'Natural-language task or question used as the retrieval query (e.g. "fix Glama TDQS scores for mcp-server tools").',
          },
          project: {
            type: 'string',
            description: 'Optional project slug to scope retrieval (e.g. "ratary").',
          },
        },
        required: ['task'],
        additionalProperties: false,
      },
    },
    {
      name: 'list_agent_clients',
      description:
        'List certified external agent client profiles registered with this Ratary deployment (name, transport, status). ' +
        'Read-only and idempotent; requires RATARY_API_KEY. ' +
        'Use for ecosystem/discovery questions about which clients are supported. ' +
        'Do not use for memory CRUD or retrieval — use save_memory / search_memory / get_context. ' +
        'Returns a JSON list of client profiles (no side effects).',
      annotations: { ...READ_ONLY, title: 'List agent clients' },
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
  ];

  async function call(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'get_capabilities':
        return client.capabilities.get();
      case 'search_memory':
        return client.memory.search({
          q: String(args.query),
          limit: typeof args.limit === 'number' ? args.limit : undefined,
        });
      case 'save_memory':
        return client.memory.create({
          title: String(args.title),
          content: String(args.content),
          project: args.project ? String(args.project) : undefined,
          tags: Array.isArray(args.tags) ? args.tags.map(String) : undefined,
        });
      case 'get_memory':
        return client.memory.get(String(args.id));
      case 'get_context':
        return client.context.build({
          task: String(args.task),
          project: args.project ? String(args.project) : undefined,
        });
      case 'list_agent_clients':
        return client.ecosystem.listClients();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  return { definitions, call };
}
