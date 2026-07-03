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
import { createPlatformAdapters } from '../infrastructure/composition/create-platform-adapters.js';
import { getEnv } from '../config/index.js';
import type { ContextService } from '../memory/context.service.js';
import type { GraphService } from '../services/graph.service.js';
import { createGraphService } from '../services/graph.service.js';
import { assertMcpOwnerConfigured } from '../types/memory-scope.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMcpMemoryScope } from '../scope/resolve-request-scope.js';
import { createMultiAiPorts } from '../composition/create-multi-ai-ports.js';
import type { IAgentIdentity } from '../agent/iagent-identity.interface.js';
import { AGENT_TYPES } from '../agent/agent.types.js';
import { ensureDefaultWorkspace, listWorkspacesByOwner } from '../scope/workspace-store.js';
import { memoryTypeSchema, categorySchema, RELATION_TYPES } from '../types/knowledge.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
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
  graphService: GraphService,
  scopeResolver: IScopeResolver,
  agentIdentity: IAgentIdentity,
  sql: ISqlDatabase,
): McpServer {
  const mcpScope = () => resolveMcpMemoryScope(scopeResolver);
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
      const memory = await memoryService.createMemory(await mcpScope(), {
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
      const memory = await memoryService.updateMemory(await mcpScope(), id, {
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
      await memoryService.deleteMemory(await mcpScope(), params.id);
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
      const memory = await memoryService.getMemoryById(await mcpScope(), params.id);
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
      const memory = await memoryService.getMemoryByCodename(await mcpScope(), params.codename);
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
      const result = await memoryService.searchMemory(await mcpScope(), {
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
    const projects = await memoryService.listProjects(await mcpScope());
    return {
      content: [{ type: 'text', text: JSON.stringify({ projects }, null, 2) }],
    };
  });

  server.tool('list_tags', 'List all unique tags', {}, async () => {
    const tags = await memoryService.listTags(await mcpScope());
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
      const relation = await relationService.createRelation(await mcpScope(), params.sourceId, {
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
      const relations = await relationService.listRelations(await mcpScope(), params.id);
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
      const memory = await memoryService.toggleFavorite(await mcpScope(), params.id);
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
      const memory = await memoryService.archiveMemory(await mcpScope(), params.id, true);
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
      const result = await contextService.buildContext(await mcpScope(), {
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
      const result = await contextService.buildPrompt(await mcpScope(), {
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

  server.tool('get_graph_capabilities', 'Discover graph traversal capabilities', {}, async () => {
    const capabilities = graphService.getCapabilities();
    return {
      content: [{ type: 'text', text: JSON.stringify({ capabilities }, null, 2) }],
    };
  });

  server.tool('list_workspaces', 'List workspaces for the MCP owner', {}, async () => {
    const scope = await mcpScope();
    await ensureDefaultWorkspace(sql, scope.ownerId);
    const workspaces = await listWorkspacesByOwner(sql, scope.ownerId);
    return {
      content: [{ type: 'text', text: JSON.stringify({ workspaces }, null, 2) }],
    };
  });

  server.tool('list_agents', 'List agents registered in the MCP workspace', {}, async () => {
    const agents = await agentIdentity.listByWorkspace(await mcpScope());
    return {
      content: [{ type: 'text', text: JSON.stringify({ agents }, null, 2) }],
    };
  });

  server.tool(
    'register_agent',
    'Register an agent identity in the MCP workspace',
    {
      name: z.string().describe('Display name for the agent'),
      agent_type: z.enum(AGENT_TYPES).optional().describe('Agent type'),
      client_id: z.string().uuid().nullable().optional().describe('Optional linked client id'),
      metadata: z.record(z.unknown()).optional().describe('Optional metadata object'),
    },
    async (params) => {
      const agent = await agentIdentity.register(await mcpScope(), {
        name: params.name,
        agentType: params.agent_type,
        clientId: params.client_id ?? undefined,
        metadata: params.metadata,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(agent, null, 2) }],
      };
    },
  );

  server.tool(
    'traverse_relations',
    'Traverse memory relations via bidirectional BFS from a seed memory',
    {
      memoryId: z.string().uuid().describe('Seed memory UUID'),
      depth: z.number().int().min(1).max(3).optional().describe('BFS depth cap'),
      types: z.array(z.enum(RELATION_TYPES)).optional().describe('Filter by relation types'),
    },
    async (params) => {
      const result = await graphService.traverseRelations(await mcpScope(), {
        memoryId: params.memoryId,
        depth: params.depth,
        types: params.types,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { memoryIds: result.memoryIds, neighbors: result.neighbors },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  return server;
}

export async function startMcpStdioServer(): Promise<void> {
  assertMcpOwnerConfigured();
  const env = getEnv();
  const d1 = env.SQL_PROVIDER === 'd1' ? getD1Client() : null;
  const platform = createPlatformAdapters(d1, env);
  const repository = new MemoryRepository(platform.sql);
  const relationRepository = new MemoryRelationRepository(platform.sql);
  const multiAi = createMultiAiPorts(platform.sql);
  const memoryService = createMemoryService(platform.sql, repository, multiAi);
  const relationService = createMemoryRelationService(platform.sql, repository, relationRepository);
  const embeddingProvider = createEmbeddingProvider();
  const contextService = createContextService(repository, {
    embeddingProvider,
    vectorStore: platform.vectorStore,
    sql: platform.sql,
  });
  const graphService = createGraphService(platform.sql, repository);
  const { scopeResolver, agentIdentity } = multiAi;

  const server = createMcpServer(
    memoryService,
    relationService,
    contextService,
    graphService,
    scopeResolver,
    agentIdentity,
    platform.sql,
  );
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export { createMcpServer };
