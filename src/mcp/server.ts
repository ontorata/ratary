import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getD1Client } from '../db/index.js';
import { MemoryRepository } from '../repositories/index.js';
import { MemoryService } from '../services/index.js';
import { getMcpMemoryScope } from '../types/memory-scope.js';

function createMcpServer(memoryService: MemoryService): McpServer {
  const scope = getMcpMemoryScope();
  const server = new McpServer({
    name: 'ai-memory-cloud',
    version: '1.0.0',
  });

  server.tool(
    'save_memory',
    'Save a new coding memory/knowledge entry',
    {
      title: z.string().describe('Title of the memory'),
      content: z.string().describe('Full markdown content of the memory'),
      project: z.string().optional().describe('Project name this memory belongs to'),
      summary: z.string().optional().describe('Short summary of the memory'),
      tags: z.array(z.string()).optional().describe('Tags for categorization'),
      favorite: z.boolean().optional().describe('Mark as favorite'),
    },
    async (params) => {
      const memory = await memoryService.createMemory(scope, {
        title: params.title,
        content: params.content,
        project: params.project ?? '',
        summary: params.summary ?? '',
        tags: params.tags ?? [],
        favorite: params.favorite ?? false,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(memory, null, 2) }],
      };
    },
  );

  server.tool(
    'update_memory',
    'Update an existing memory by ID',
    {
      id: z.string().uuid().describe('Memory UUID'),
      title: z.string().optional(),
      content: z.string().optional(),
      project: z.string().optional(),
      summary: z.string().optional(),
      tags: z.array(z.string()).optional(),
      favorite: z.boolean().optional(),
    },
    async (params) => {
      const { id, ...updateData } = params;
      const memory = await memoryService.updateMemory(scope, id, updateData);
      return {
        content: [{ type: 'text', text: JSON.stringify(memory, null, 2) }],
      };
    },
  );

  server.tool(
    'delete_memory',
    'Delete a memory by ID',
    {
      id: z.string().uuid().describe('Memory UUID to delete'),
    },
    async (params) => {
      await memoryService.deleteMemory(scope, params.id);
      return {
        content: [{ type: 'text', text: `Memory ${params.id} deleted successfully` }],
      };
    },
  );

  server.tool(
    'get_memory',
    'Get a memory by ID',
    {
      id: z.string().uuid().describe('Memory UUID'),
    },
    async (params) => {
      const memory = await memoryService.getMemoryById(scope, params.id);
      return {
        content: [{ type: 'text', text: JSON.stringify(memory, null, 2) }],
      };
    },
  );

  server.tool(
    'search_memory',
    'Search memories by keyword, tag, or project',
    {
      q: z.string().optional().describe('Full-text search keyword'),
      tag: z.string().optional().describe('Filter by tag'),
      project: z.string().optional().describe('Filter by project'),
      favorite: z.boolean().optional().describe('Filter favorites only'),
      archived: z.boolean().optional().describe('Include archived memories'),
      limit: z.number().int().min(1).max(100).optional().describe('Max results'),
      offset: z.number().int().min(0).optional().describe('Pagination offset'),
    },
    async (params) => {
      const result = await memoryService.searchMemory(scope, {
        q: params.q,
        tag: params.tag,
        project: params.project,
        favorite: params.favorite,
        archived: params.archived ?? false,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool('list_projects', 'List all unique project names', {}, async () => {
    const projects = await memoryService.listProjects(scope);
    return {
      content: [{ type: 'text', text: JSON.stringify({ projects }, null, 2) }],
    };
  });

  server.tool('list_tags', 'List all unique tags', {}, async () => {
    const tags = await memoryService.listTags(scope);
    return {
      content: [{ type: 'text', text: JSON.stringify({ tags }, null, 2) }],
    };
  });

  server.tool(
    'toggle_favorite',
    'Toggle favorite status of a memory',
    {
      id: z.string().uuid().describe('Memory UUID'),
    },
    async (params) => {
      const memory = await memoryService.toggleFavorite(scope, params.id);
      return {
        content: [{ type: 'text', text: JSON.stringify(memory, null, 2) }],
      };
    },
  );

  server.tool(
    'archive_memory',
    'Archive a memory (soft delete)',
    {
      id: z.string().uuid().describe('Memory UUID to archive'),
    },
    async (params) => {
      const memory = await memoryService.archiveMemory(scope, params.id, true);
      return {
        content: [{ type: 'text', text: JSON.stringify(memory, null, 2) }],
      };
    },
  );

  return server;
}

export async function startMcpStdioServer(): Promise<void> {
  const db = getD1Client();
  const repository = new MemoryRepository(db);
  const memoryService = new MemoryService(repository);

  const server = createMcpServer(memoryService);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export { createMcpServer };
