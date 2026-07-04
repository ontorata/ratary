import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getD1Client } from '../../db/index.js';
import { MemoryRepository } from '../../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../repositories/memory-relation.repository.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../../services/create-memory-service.js';
import { createContextService } from '../../memory/create-context-service.js';
import { createMemoryAccessAuditor } from '../../infrastructure/composition/create-memory-access-auditor.js';
import { createEmbeddingProvider } from '../../embedding/create-embedding-provider.js';
import { createPlatformAdapters } from '../../infrastructure/composition/create-platform-adapters.js';
import { createMemoryEvolutionPorts } from '../../composition/create-memory-evolution-ports.js';
import { createEventPipelinePorts } from '../../composition/create-event-pipeline-ports.js';
import { getEnv } from '../../config/index.js';
import { createGraphService } from '../../services/graph.service.js';
import { assertMcpOwnerConfigured } from '../../types/memory-scope.js';
import { createStdioMcpBinding, type McpContextBinding } from './mcp-context-binding.js';
import {
  createTransportHandlers,
  type TransportHandlers,
} from '../shared/handlers/create-transport-handlers.js';
import { createMultiAiPorts } from '../../composition/create-multi-ai-ports.js';
import type { IAgentIdentity } from '../../agent/iagent-identity.interface.js';
import { AGENT_TYPES } from '../../agent/agent.types.js';
import { ensureDefaultWorkspace, listWorkspacesByOwner } from '../../scope/workspace-store.js';
import { memoryTypeSchema, categorySchema, RELATION_TYPES } from '../../types/knowledge.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { MEMORY_LEVELS } from '../../types/memory-level.js';
import { resolveIncludeSummaryOnly } from '../../mcp/context-tool-params.js';
import { createMemoryStewardshipPorts } from '../../composition/create-memory-stewardship-ports.js';
import { createCompressionPorts } from '../../composition/create-compression-ports.js';
import { wireMcpInitializeCapabilities } from './mcp-initialize-capabilities.js';

const metadataSchema = z.object({
  category: categorySchema.optional(),
  memoryType: memoryTypeSchema.optional(),
  keywords: z.array(z.string()).optional(),
  importance: z.number().int().min(0).max(100).optional(),
  language: z.string().optional(),
  notes: z.string().optional(),
});

export interface CreateMcpServerOptions {
  mcpTransport?: 'stdio' | 'streamable-http';
}

function createMcpServer(
  handlers: TransportHandlers,
  binding: McpContextBinding,
  agentIdentity: IAgentIdentity,
  sql: ISqlDatabase,
  options: CreateMcpServerOptions = {},
): McpServer {
  const mcpCtx = () => binding.getTransportContext();
  const mcpScope = () => binding.resolveMemoryScope();
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
      const memory = await handlers.memory.create.handle(mcpCtx(), {
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
      const memory = await handlers.memory.update.handle(mcpCtx(), {
        id,
        input: {
          ...rest,
          category: metadata?.category,
          memoryType: metadata?.memoryType,
          keywords: metadata?.keywords,
          importance: metadata?.importance,
          language: metadata?.language,
          notes: metadata?.notes,
        },
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
      await handlers.memory.delete.handle(mcpCtx(), { id: params.id });
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
      const memory = await handlers.memory.getById.handle(mcpCtx(), { id: params.id });
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
      const memory = await handlers.memory.getByCodename.handle(mcpCtx(), {
        codename: params.codename,
      });
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
      const result = await handlers.memory.search.handle(mcpCtx(), {
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
    const projects = await handlers.memory.listProjects.handle(mcpCtx(), {});
    return {
      content: [{ type: 'text', text: JSON.stringify({ projects }, null, 2) }],
    };
  });

  server.tool('list_tags', 'List all unique tags', {}, async () => {
    const tags = await handlers.memory.listTags.handle(mcpCtx(), {});
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
      const relation = await handlers.relations.create.handle(mcpCtx(), {
        memoryId: params.sourceId,
        input: {
          targetMemoryId: params.targetId,
          relation: params.relation,
          sourceType: 'mcp',
        },
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
      const relations = await handlers.relations.list.handle(mcpCtx(), { memoryId: params.id });
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
      const memory = await handlers.memory.toggleFavorite.handle(mcpCtx(), { id: params.id });
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
      const memory = await handlers.memory.archive.handle(mcpCtx(), { id: params.id });
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
      content_mode: z
        .enum(['summary', 'full'])
        .optional()
        .describe('summary (default, ~85–96% token savings) or full memory bodies'),
      summary_only: z
        .boolean()
        .optional()
        .describe('When true (default), omit memory bodies — title + summary only'),
      include_body: z
        .boolean()
        .optional()
        .describe('When true, hydrate full memory bodies. Overrides summary_only.'),
      format: z.enum(['markdown', 'xml']).optional().describe('Context output format'),
    },
    async (params) => {
      const result = await handlers.context.buildContext.handle(mcpCtx(), {
        query: params.query,
        projectId: params.projectId,
        tags: params.tags,
        levels: params.levels,
        limit: params.limit,
        context: {
          maxChars: params.max_chars,
          includeSummaryOnly: resolveIncludeSummaryOnly(params),
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
      content_mode: z
        .enum(['summary', 'full'])
        .optional()
        .describe('summary (default) or full memory bodies'),
      summary_only: z
        .boolean()
        .optional()
        .describe('When true (default), omit memory bodies — title + summary only'),
      include_body: z
        .boolean()
        .optional()
        .describe('When true, hydrate full memory bodies. Overrides summary_only.'),
      system_role: z.string().optional().describe('Custom system role prompt'),
    },
    async (params) => {
      const result = await handlers.context.buildPrompt.handle(mcpCtx(), {
        task: params.task,
        query: params.query,
        projectId: params.projectId,
        tags: params.tags,
        levels: params.levels,
        limit: params.limit,
        systemRole: params.system_role,
        context: {
          maxChars: params.max_chars,
          includeSummaryOnly: resolveIncludeSummaryOnly(params),
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool('get_graph_capabilities', 'Discover graph traversal capabilities', {}, async () => {
    const capabilities = await handlers.graph.getCapabilities.handle(mcpCtx(), {});
    return {
      content: [{ type: 'text', text: JSON.stringify({ capabilities }, null, 2) }],
    };
  });

  server.tool(
    'get_capabilities',
    'Discover AI Memory Cloud deployment capabilities, limits, and MCP tool registry',
    {},
    async () => {
      const manifest = await handlers.capabilities.getManifest.handle(mcpCtx(), {});
      return {
        content: [{ type: 'text', text: JSON.stringify(manifest, null, 2) }],
      };
    },
  );

  server.tool(
    'negotiate_capabilities',
    'Bidirectional capability negotiation handshake — declare required features and receive matched deployment matrix',
    {
      protocol_version: z
        .string()
        .optional()
        .describe('Client AI Brain protocol version (e.g. 1.0.0)'),
      required_capabilities: z
        .array(z.string())
        .optional()
        .describe('Capability flags the client requires to operate'),
      preferred_capabilities: z
        .array(z.string())
        .optional()
        .describe('Optional capability flags the client prefers'),
      transports: z
        .array(z.string())
        .optional()
        .describe('Transports the client intends to use (rest, mcp, streamable-http, grpc, sse, websocket)'),
      client_name: z.string().optional().describe('Client implementation name'),
      client_version: z.string().optional().describe('Client implementation version'),
    },
    async (params) => {
      const result = await handlers.capabilities.negotiate.handle(mcpCtx(), {
        ...(params.protocol_version ? { protocolVersion: params.protocol_version } : {}),
        ...(params.required_capabilities
          ? { requiredCapabilities: params.required_capabilities }
          : {}),
        ...(params.preferred_capabilities
          ? { preferredCapabilities: params.preferred_capabilities }
          : {}),
        ...(params.transports ? { transports: params.transports } : {}),
        ...(params.client_name && params.client_version
          ? { clientInfo: { name: params.client_name, version: params.client_version } }
          : {}),
        capabilitiesUrl: '/api/v1/capabilities',
        negotiateUrl: '/api/v1/capabilities/negotiate',
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    'run_stewardship',
    'Run the memory stewardship maintenance pipeline (dry-run by default)',
    {
      dry_run: z
        .boolean()
        .optional()
        .describe('When true (default), report intended actions without mutations'),
      project: z.string().optional().describe('Optional project filter'),
    },
    async (params) => {
      const env = getEnv();
      const { orchestrator } = createMemoryStewardshipPorts(sql, env);
      const report = await orchestrator.run(await mcpScope(), {
        dryRun: params.dry_run ?? true,
        projectId: params.project,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
      };
    },
  );

  server.tool(
    'get_compression_status',
    'Report semantic compression status and pending duplicate clusters for the MCP owner',
    {
      project: z.string().optional().describe('Optional project filter'),
    },
    async (params) => {
      const { statusReader } = createCompressionPorts(sql, getEnv());
      const status = await statusReader.getStatus(await mcpScope(), {
        projectId: params.project,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(status, null, 2) }],
      };
    },
  );

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
      const result = await handlers.graph.traverse.handle(mcpCtx(), {
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

  wireMcpInitializeCapabilities(
    server,
    () => handlers.capabilities.getManifest.handle(mcpCtx(), {}),
    {
      mcpTransport: options.mcpTransport ?? 'stdio',
      capabilitiesUrl: '/api/v1/capabilities',
      negotiateUrl: '/api/v1/capabilities/negotiate',
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
  const multiAi = createMultiAiPorts(platform.sql, env);
  const evolutionPorts = createMemoryEvolutionPorts(platform.sql, env);
  const eventPipeline = createEventPipelinePorts(env, platform.eventBus, platform.analyticsStore);
  const memoryService = createMemoryService(
    platform.sql,
    repository,
    multiAi,
    evolutionPorts.coordinator,
    eventPipeline.coordinator,
  );
  const relationService = createMemoryRelationService(platform.sql, repository, relationRepository);
  const embeddingProvider = createEmbeddingProvider();
  const memoryAccessAuditor = eventPipeline.wrapMemoryAccessAuditor(
    createMemoryAccessAuditor(env, platform.sql),
  );
  const contextService = createContextService(repository, {
    embeddingProvider,
    vectorStore: platform.vectorStore,
    sql: platform.sql,
    memoryAccessAuditor,
  });
  const graphService = createGraphService(platform.sql, repository);
  const { scopeResolver, agentIdentity } = multiAi;

  const handlers = createTransportHandlers({
    memoryService,
    contextService,
    graphService,
    relationService,
    scopeResolver,
    env,
  });

  const server = createMcpServer(
    handlers,
    createStdioMcpBinding(scopeResolver),
    agentIdentity,
    platform.sql,
  );
  const transport = new StdioServerTransport();

  if (eventPipeline.runner) {
    await eventPipeline.runner.start();
    process.on('SIGINT', () => void eventPipeline.runner!.stop());
    process.on('SIGTERM', () => void eventPipeline.runner!.stop());
  }

  await server.connect(transport);
}

export { createMcpServer };
export type { McpContextBinding } from './mcp-context-binding.js';
export { createStdioMcpBinding, createRemoteMcpBinding } from './mcp-context-binding.js';
