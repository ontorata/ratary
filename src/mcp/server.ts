import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getD1Client } from '../db/index.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../services/create-memory-service.js';
import type { MemoryService } from '../services/memory.service.js';
import { MemoryRelationService } from '../services/memory-relation.service.js';
import { createContextService } from '../memory/create-context-service.js';
import { createEmbeddingProvider } from '../embedding/create-embedding-provider.js';
import { D1EmbeddingStore } from '../embedding/d1-embedding.store.js';
import type { ContextService } from '../memory/context.service.js';
import { getMcpMemoryScope, assertMcpOwnerConfigured } from '../types/memory-scope.js';
import { memoryTypeSchema, categorySchema } from '../types/knowledge.js';
import { MEMORY_LEVELS } from '../types/memory-level.js';

const metadataSchema = z.object({
  category: categorySchema.optional(),
  memoryType: memoryTypeSchema.optional(),
  keywords: z.array(z.string()).optional(),
  importance: z.number().int().min(0).max(100).optional(),
  language: z.string().optional(),
  notes: z.string().optional(),
});

function createMcpServer(
  memoryService: MemoryService,
  relationService: MemoryRelationService,
  contextService: ContextService,
): McpServer {
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
      metadata: metadataSchema.optional().describe('Knowledge metadata'),
    },
    async (params) => {
      const meta = params.metadata ?? {};
      const memory = await memoryService.createMemory(scope, {
        title: params.title,
        content: params.content,
        project: params.project ?? '',
        summary: params.summary ?? '',
        tags: params.tags ?? [],
        favorite: params.favorite ?? false,
        category: meta.category,
        memoryType: meta.memoryType,
        keywords: meta.keywords,
        importance: meta.importance,
        language: meta.language,
        notes: meta.notes,
        level: 'note',
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
      metadata: metadataSchema.optional(),
    },
    async (params) => {
      const { id, metadata, ...rest } = params;
      const memory = await memoryService.updateMemory(scope, id, {
        ...rest,
        category: metadata?.category,
        memoryType: metadata?.memoryType,
        keywords: metadata?.keywords,
        importance: metadata?.importance,
        language: metadata?.language,
        notes: metadata?.notes,
      });
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
    'get_memory_by_codename',
    'Get a memory by codename (e.g. AUTH-0001)',
    {
      codename: z.string().describe('Memory codename'),
    },
    async (params) => {
      const memory = await memoryService.getMemoryByCodename(scope, params.codename);
      return {
        content: [{ type: 'text', text: JSON.stringify(memory, null, 2) }],
      };
    },
  );

  server.tool(
    'search_memory',
    'Search memories by keyword, tag, or project with relevance ranking',
    {
      q: z.string().optional().describe('Full-text search keyword'),
      tag: z.string().optional().describe('Filter by tag'),
      project: z.string().optional().describe('Filter by project'),
      category: z.string().optional(),
      memory_type: memoryTypeSchema.optional(),
      importance_min: z.number().int().min(0).max(100).optional(),
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
        category: params.category,
        memory_type: params.memory_type,
        importance_min: params.importance_min,
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
    'link_memories',
    'Create a relation between two memories',
    {
      sourceId: z.string().uuid(),
      targetId: z.string().uuid(),
      relation: z.enum(['related', 'depends_on', 'parent', 'child', 'duplicate', 'reference']),
    },
    async (params) => {
      const relation = await relationService.createRelation(scope, params.sourceId, {
        targetMemoryId: params.targetId,
        relation: params.relation,
        sourceType: 'mcp',
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(relation, null, 2) }],
      };
    },
  );

  server.tool(
    'list_relations',
    'List relations for a memory',
    {
      id: z.string().uuid(),
    },
    async (params) => {
      const relations = await relationService.listRelations(scope, params.id);
      return {
        content: [{ type: 'text', text: JSON.stringify({ relations }, null, 2) }],
      };
    },
  );

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

  server.tool(
    'get_context',
    'Retrieve, rank, and build token-safe markdown context from memories',
    {
      query: z.string().optional().describe('Search query for retrieval'),
      projectId: z.string().optional().describe('Filter by project slug/id'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      levels: z.array(z.enum(MEMORY_LEVELS)).optional().describe('Memory levels to include'),
      limit: z.number().int().min(1).max(20).optional().describe('Max ranked memories'),
      max_chars: z.number().int().min(500).max(24_000).optional().describe('Context char budget'),
      format: z.enum(['markdown', 'xml']).optional().describe('Context output format'),
    },
    async (params) => {
      const result = await contextService.buildContext(scope, {
        query: params.query,
        projectId: params.projectId,
        tags: params.tags,
        levels: params.levels,
        limit: params.limit,
        context: {
          maxChars: params.max_chars,
          format: params.format,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'build_prompt',
    'Build full system and user prompts for an external LLM from ranked memory context',
    {
      task: z.string().describe('User task or instruction'),
      query: z.string().optional().describe('Search query for retrieval'),
      projectId: z.string().optional().describe('Filter by project slug/id'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      levels: z.array(z.enum(MEMORY_LEVELS)).optional().describe('Memory levels to include'),
      limit: z.number().int().min(1).max(20).optional().describe('Max ranked memories'),
      max_chars: z.number().int().min(500).max(24_000).optional().describe('Context char budget'),
      system_role: z.string().optional().describe('Custom system role prompt'),
    },
    async (params) => {
      const result = await contextService.buildPrompt(scope, {
        task: params.task,
        query: params.query,
        projectId: params.projectId,
        tags: params.tags,
        levels: params.levels,
        limit: params.limit,
        systemRole: params.system_role,
        context: {
          maxChars: params.max_chars,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}

export async function startMcpStdioServer(): Promise<void> {
  assertMcpOwnerConfigured();
  const db = getD1Client();
  const repository = new MemoryRepository(db);
  const relationRepository = new MemoryRelationRepository(db);
  const memoryService = createMemoryService(db, repository);
  const relationService = createMemoryRelationService(db, repository, relationRepository);
  const embeddingProvider = createEmbeddingProvider();
  const embeddingStore = new D1EmbeddingStore(db);
  const contextService = createContextService(repository, embeddingProvider, embeddingStore, db);

  const server = createMcpServer(memoryService, relationService, contextService);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export { createMcpServer };
