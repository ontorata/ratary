import type { AiBrainClient } from '@ai-brain/sdk';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface ToolHandlers {
  definitions: Tool[];
  call(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export function createToolHandlers(client: AiBrainClient): ToolHandlers {
  const definitions: Tool[] = [
    {
      name: 'get_capabilities',
      description: 'Get deployment capability manifest',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'search_memory',
      description: 'Search memories by query',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' },
        },
        required: ['query'],
      },
    },
    {
      name: 'save_memory',
      description: 'Create a new memory',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          project: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'content'],
      },
    },
    {
      name: 'get_memory',
      description: 'Get memory by ID',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
    },
    {
      name: 'get_context',
      description: 'Build context for a task',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string' },
          project: { type: 'string' },
        },
        required: ['task'],
      },
    },
    {
      name: 'list_agent_clients',
      description: 'List certified external agent client profiles',
      inputSchema: { type: 'object', properties: {} },
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
