import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { McpToolName } from '../../capabilities/mcp-tool-names.js';
import { applyPreHandlerErrorContract, registerContractTool } from './mcp-tool-registration.js';
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
import { createSignalIngestPorts } from '../../composition/create-signal-ingest-ports.js';
import { createLearningPorts } from '../../composition/create-learning-ports.js';
import { wireMcpInitializeCapabilities } from './mcp-initialize-capabilities.js';
import type { IClientSyncService } from '../../client-sync/iclient-sync-service.interface.js';

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
  clientSync?: IClientSyncService;
  clientSyncEnabled?: boolean;
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
    name: 'ratary',
    version: '1.0.0',
  });

  // PI-B error contract: every registration goes through the wrapper so tool
  // failures return {error, retryable}; pre-handler (zod/unknown-tool)
  // failures are enveloped by the createToolError override.
  applyPreHandlerErrorContract(server);
  const tool = <Args extends ZodRawShapeCompat>(
    name: McpToolName,
    description: string,
    shape: Args,
    handler: ToolCallback<Args>,
  ): void => registerContractTool(server, name, description, shape, handler);

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
    'search_memory',
    'Search memories by keyword, tag, or project with relevance ranking',
    {
      q: z.string().optional().describe('Full-text search keyword'),
      queries: z.array(z.string()).optional().describe('Multi-query fan-out (Phase 6.6)'),
      mode: z.enum(['hybrid', 'semantic', 'fulltext', 'title']).optional(),
      rerank: z.boolean().optional(),
      snippetLength: z.number().int().min(0).max(2000).optional(),
      extended: z.boolean().optional(),
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
        queries: params.queries,
        mode: params.mode,
        rerank: params.rerank,
        snippet_length: params.snippetLength,
        extended: params.extended,
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

  tool(
    'get_memory_by_path',
    'Read a memory by vault source_path (Phase 6.6, gated)',
    {
      path: z.string().min(1),
      suggest: z.boolean().optional().describe('Return fuzzy path suggestions on miss'),
    },
    async (params) => {
      const result = await handlers.memory.getByPath.handle(mcpCtx(), {
        path: params.path,
        suggest: params.suggest ?? false,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  tool('list_projects', 'List all unique project names', {}, async () => {
    const projects = await handlers.memory.listProjects.handle(mcpCtx(), {});
    return {
      content: [{ type: 'text', text: JSON.stringify({ projects }, null, 2) }],
    };
  });

  tool('list_tags', 'List all unique tags', {}, async () => {
    const tags = await handlers.memory.listTags.handle(mcpCtx(), {});
    return {
      content: [{ type: 'text', text: JSON.stringify({ tags }, null, 2) }],
    };
  });

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool('get_graph_capabilities', 'Discover graph traversal capabilities', {}, async () => {
    const capabilities = await handlers.graph.getCapabilities.handle(mcpCtx(), {});
    return {
      content: [{ type: 'text', text: JSON.stringify({ capabilities }, null, 2) }],
    };
  });

  tool(
    'get_capabilities',
    'Discover Ratary deployment capabilities, limits, and MCP tool registry',
    {},
    async () => {
      const manifest = await handlers.capabilities.getManifest.handle(mcpCtx(), {});
      return {
        content: [{ type: 'text', text: JSON.stringify(manifest, null, 2) }],
      };
    },
  );

  tool(
    'negotiate_capabilities',
    'Bidirectional capability negotiation handshake — declare required features and receive matched deployment matrix',
    {
      protocol_version: z
        .string()
        .optional()
        .describe('Client Ratary protocol version (e.g. 1.0.0)'),
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
        .describe(
          'Transports the client intends to use (rest, mcp, streamable-http, grpc, sse, websocket)',
        ),
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

  tool(
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

  tool(
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

  const syncService = options.clientSync;
  const syncDisabledPayload = {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          error: 'MULTI_CLIENT_SYNC_ENABLED=false — enable multi-client sync to use sync_* tools',
          // Deterministic configuration error — PI-B contract (retry cannot succeed).
          retryable: false,
        }),
      },
    ],
    isError: true,
  };

  tool(
    'sync_status',
    'Multi-client sync status for a platform (ADR-042)',
    {
      platform_id: z.string().min(1).max(100).describe('Client platform id (e.g. cursor, vscode)'),
    },
    async (params) => {
      if (!options.clientSyncEnabled || !syncService) {
        return syncDisabledPayload;
      }
      const status = await syncService.getStatus(await mcpScope(), params.platform_id);
      return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };
    },
  );

  tool(
    'sync_pull',
    'Pull memory changes since cursor for a client platform',
    {
      platform_id: z.string().min(1).max(100),
      cursor: z.string().optional().describe('Optional cursor override'),
    },
    async (params) => {
      if (!options.clientSyncEnabled || !syncService) {
        return syncDisabledPayload;
      }
      const result = await syncService.pull(await mcpScope(), params.platform_id, params.cursor);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  tool(
    'sync_push',
    'Push memory changes from a client platform',
    {
      platform_id: z.string().min(1).max(100),
      cursor: z.string().optional(),
      changes: z
        .array(
          z.object({
            memory_id: z.string().uuid(),
            operation: z.enum(['create', 'update', 'delete']),
            expected_updated_at: z.string().optional().nullable(),
            data: z
              .object({
                title: z.string().optional(),
                project: z.string().optional(),
                content: z.string().optional(),
                summary: z.string().optional(),
                tags: z.array(z.string()).optional(),
                favorite: z.boolean().optional(),
              })
              .optional(),
          }),
        )
        .max(100),
    },
    async (params) => {
      if (!options.clientSyncEnabled || !syncService) {
        return syncDisabledPayload;
      }
      const result = await syncService.push(
        await mcpScope(),
        params.platform_id,
        params.changes.map((change) => ({
          memoryId: change.memory_id,
          operation: change.operation,
          expectedUpdatedAt: change.expected_updated_at,
          data: change.data,
        })),
        params.cursor,
      );
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  tool('list_workspaces', 'List workspaces for the MCP owner', {}, async () => {
    const scope = await mcpScope();
    await ensureDefaultWorkspace(sql, scope.ownerId);
    const workspaces = await listWorkspacesByOwner(sql, scope.ownerId);
    return {
      content: [{ type: 'text', text: JSON.stringify({ workspaces }, null, 2) }],
    };
  });

  tool('list_agents', 'List agents registered in the MCP workspace', {}, async () => {
    const agents = await agentIdentity.listByWorkspace(await mcpScope());
    return {
      content: [{ type: 'text', text: JSON.stringify({ agents }, null, 2) }],
    };
  });

  tool(
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

  tool(
    'traverse_relations',
    'Traverse memory relations via bidirectional BFS from a seed memory',
    {
      memoryId: z.string().uuid().optional().describe('Seed memory UUID'),
      depth: z.number().int().min(1).max(3).optional().describe('BFS depth cap'),
      types: z.array(z.enum(RELATION_TYPES)).optional().describe('Filter by relation types'),
      direction: z.enum(['outgoing', 'incoming', 'both']).optional(),
      seed: z
        .object({
          memoryId: z.string().uuid().optional(),
          slug: z.string().optional(),
          sourcePath: z.string().optional(),
        })
        .optional(),
    },
    async (params) => {
      const result = await handlers.graph.traverse.handle(mcpCtx(), {
        memoryId: params.memoryId,
        depth: params.depth,
        types: params.types,
        direction: params.direction,
        seed: params.seed,
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

  tool(
    'submit_signal',
    'Submit memory quality feedback or inspection outcome signals (Phase 8.5 / 8.8)',
    {
      type: z.enum(['explicit_feedback', 'inspection_outcome']).default('explicit_feedback'),
      memory_id: z.string().uuid().optional().describe('Target memory UUID (explicit_feedback)'),
      value: z.enum(['helpful', 'not_helpful']).optional().describe('Feedback value'),
      source: z.enum(['forge_inspect', 'ci', 'mcp', 'rest']).optional(),
      task_id: z.string().optional(),
      severity: z.enum(['constitutional', 'critical', 'major']).optional(),
      category: z.enum(['boundary', 'adr', 'testing', 'security', 'phase_gate']).optional(),
      resolved: z.boolean().optional(),
      diff_scope: z
        .object({
          paths: z.array(z.string()).optional(),
          modules: z.array(z.string()).optional(),
          adr_ids: z.array(z.string()).optional(),
        })
        .optional(),
      pattern_hint: z.string().optional(),
      signal_id: z.string().uuid().optional().describe('Optional idempotency key'),
    },
    async (params) => {
      if (!handlers.signals) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                accepted: false,
                duplicate: false,
                error: 'SIGNAL_INGEST_ENABLED=false — enable signal ingest to use submit_signal',
                // Deterministic configuration error — PI-B contract (retry cannot succeed).
                retryable: false,
              }),
            },
          ],
          isError: true,
        };
      }

      const raw =
        params.type === 'inspection_outcome'
          ? {
              type: 'inspection_outcome' as const,
              source: params.source ?? 'mcp',
              ...(params.task_id ? { taskId: params.task_id } : {}),
              severity: params.severity ?? 'major',
              category: params.category ?? 'boundary',
              resolved: params.resolved ?? false,
              ...(params.diff_scope
                ? {
                    diffScope: {
                      ...(params.diff_scope.paths ? { paths: params.diff_scope.paths } : {}),
                      ...(params.diff_scope.modules ? { modules: params.diff_scope.modules } : {}),
                      ...(params.diff_scope.adr_ids ? { adrIds: params.diff_scope.adr_ids } : {}),
                    },
                  }
                : {}),
              ...(params.pattern_hint ? { patternHint: params.pattern_hint } : {}),
              ...(params.signal_id ? { signalId: params.signal_id } : {}),
            }
          : {
              type: 'explicit_feedback' as const,
              memoryId: params.memory_id!,
              value: params.value ?? 'helpful',
              ...(params.signal_id ? { signalId: params.signal_id } : {}),
            };

      const result = await handlers.signals.submit.handle(mcpCtx(), raw);

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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

  const learningPorts = createLearningPorts(platform.sql, env);
  const signalPorts = createSignalIngestPorts(platform.sql, env, {
    eventBus: platform.eventBus,
    learningPorts,
  });

  const handlers = createTransportHandlers({
    memoryService,
    contextService,
    graphService,
    relationService,
    scopeResolver,
    env,
    signalIngest: signalPorts.enabled ? { enabled: true, ...signalPorts.ingestDeps } : undefined,
    memoryAccessAuditor,
  });

  const server = createMcpServer(
    handlers,
    createStdioMcpBinding(scopeResolver),
    agentIdentity,
    platform.sql,
    {
      clientSync: multiAi.bindClientSyncService(memoryService),
      clientSyncEnabled: multiAi.clientSync.enabled,
    },
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
