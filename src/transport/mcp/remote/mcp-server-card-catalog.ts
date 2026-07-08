import type { McpToolName } from '../../../capabilities/mcp-tool-names.js';

export interface ServerCardToolDef {
  name: McpToolName;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations: {
    title?: string;
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
  };
}

const METADATA_SCHEMA = {
  type: 'object',
  description: 'Optional knowledge metadata for categorization and retrieval ranking',
  properties: {
    category: {
      type: 'string',
      description: 'Knowledge category (Architecture, Development, Research, etc.)',
    },
    memoryType: {
      type: 'string',
      description:
        'Memory type: note, prompt, code, architecture, task, meeting, research, documentation, api, config',
    },
    keywords: {
      type: 'array',
      items: { type: 'string' },
      description: 'Search keywords for future retrieval',
    },
    importance: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
      description: 'Importance score 0–100 for ranking',
    },
    language: { type: 'string', description: 'Content language code (e.g. en, id)' },
    notes: { type: 'string', description: 'Operator notes not shown in primary content' },
  },
};

function readOnly(
  name: McpToolName,
  description: string,
  inputSchema: Record<string, unknown>,
  outputSchema?: Record<string, unknown>,
): ServerCardToolDef {
  return {
    name,
    description,
    inputSchema,
    outputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  };
}

function writeTool(
  name: McpToolName,
  description: string,
  inputSchema: Record<string, unknown>,
  opts: Partial<ServerCardToolDef['annotations']> = {},
  outputSchema?: Record<string, unknown>,
): ServerCardToolDef {
  return {
    name,
    description,
    inputSchema,
    outputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
      ...opts,
    },
  };
}

/** Smithery-optimized tool catalog — mirrors live MCP tool contracts (snake_case names). */
export const MCP_SERVER_CARD_TOOLS: ServerCardToolDef[] = [
  writeTool(
    'save_memory',
    'Create a new persistent coding memory entry with title, markdown body, project scope, and optional tags.',
    {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short title for the memory entry' },
        content: { type: 'string', description: 'Full markdown body stored in the knowledge base' },
        project: {
          type: 'string',
          description: 'Project slug grouping memories (e.g. ratary, ontorata)',
        },
        summary: { type: 'string', description: 'One-line summary for token-efficient context' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for filtering (e.g. handoff, mcp, ops)',
        },
        favorite: { type: 'boolean', description: 'Pin as favorite for ranking boost' },
        metadata: METADATA_SCHEMA,
      },
      required: ['title', 'content'],
    },
    { destructiveHint: false, idempotentHint: false },
    {
      type: 'object',
      description: 'Created memory record with id, codename, timestamps',
      properties: { id: { type: 'string', format: 'uuid' } },
    },
  ),
  writeTool(
    'update_memory',
    'Update fields on an existing memory by UUID without creating a new record.',
    {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Memory UUID to update' },
        title: { type: 'string', description: 'New title' },
        content: { type: 'string', description: 'New markdown body' },
        project: { type: 'string', description: 'Move to another project slug' },
        summary: { type: 'string', description: 'Updated summary line' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Replace tag list' },
        favorite: { type: 'boolean', description: 'Favorite flag' },
        metadata: METADATA_SCHEMA,
      },
      required: ['id'],
    },
    { idempotentHint: true },
  ),
  writeTool(
    'delete_memory',
    'Permanently delete a memory by UUID. Prefer archive_memory for reversible removal.',
    {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Memory UUID to delete permanently' },
      },
      required: ['id'],
    },
    { destructiveHint: true },
  ),
  readOnly('get_memory', 'Fetch a single memory by UUID including full content and metadata.', {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Memory UUID' },
    },
    required: ['id'],
  }),
  readOnly(
    'get_memory_by_codename',
    'Fetch a memory by stable codename (e.g. AUTH-0001) when UUID is unknown.',
    {
      type: 'object',
      properties: {
        codename: { type: 'string', description: 'Human-readable memory codename' },
      },
      required: ['codename'],
    },
  ),
  readOnly(
    'search_memory',
    'Search memories by keyword, tag, or project using hybrid full-text and semantic ranking.',
    {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Primary full-text search query' },
        queries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Multi-query fan-out for broader recall',
        },
        mode: {
          type: 'string',
          enum: ['hybrid', 'semantic', 'fulltext', 'title'],
          description: 'Retrieval mode (default hybrid)',
        },
        rerank: { type: 'boolean', description: 'Enable semantic reranking pass' },
        tag: { type: 'string', description: 'Filter by exact tag' },
        project: { type: 'string', description: 'Filter by project slug' },
        favorite: { type: 'boolean', description: 'Only favorites when true' },
        archived: { type: 'boolean', description: 'Include archived memories when true' },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Max results (default 50)',
        },
        offset: { type: 'integer', minimum: 0, description: 'Pagination offset' },
      },
    },
    {
      type: 'object',
      properties: {
        items: { type: 'array', description: 'Ranked memory hits' },
        total: { type: 'number' },
      },
    },
  ),
  readOnly(
    'get_memory_by_path',
    'Read a memory by vault source_path when syncing from a file-oriented workflow.',
    {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Vault-relative source path' },
        suggest: { type: 'boolean', description: 'Return fuzzy path suggestions on miss' },
      },
      required: ['path'],
    },
  ),
  readOnly(
    'list_projects',
    'List all project slugs that have at least one memory for this owner.',
    {
      type: 'object',
      properties: {},
    },
  ),
  readOnly('list_tags', 'List distinct tags used across all memories for this owner.', {
    type: 'object',
    properties: {},
  }),
  writeTool(
    'link_memories',
    'Create a typed relation edge between two memories in the knowledge graph.',
    {
      type: 'object',
      properties: {
        sourceId: { type: 'string', format: 'uuid', description: 'Source memory UUID' },
        targetId: { type: 'string', format: 'uuid', description: 'Target memory UUID' },
        relation: {
          type: 'string',
          enum: ['related', 'depends_on', 'parent', 'child', 'duplicate', 'reference'],
          description: 'Relation type',
        },
      },
      required: ['sourceId', 'targetId', 'relation'],
    },
    { idempotentHint: true },
  ),
  readOnly('list_relations', 'List graph relations attached to a memory (incoming and outgoing).', {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Memory UUID' },
    },
    required: ['id'],
  }),
  writeTool(
    'toggle_favorite',
    'Toggle the favorite flag on a memory for quick access and ranking.',
    {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Memory UUID' },
      },
      required: ['id'],
    },
    { idempotentHint: true },
  ),
  writeTool(
    'archive_memory',
    'Soft-archive a memory so it is hidden from default search but recoverable.',
    {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Memory UUID to archive' },
      },
      required: ['id'],
    },
    { destructiveHint: false, idempotentHint: true },
  ),
  readOnly(
    'get_context',
    'Rank relevant memories and assemble token-budgeted markdown context for a task.',
    {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Retrieval query describing the task' },
        projectId: { type: 'string', description: 'Limit context to one project' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tag filters' },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Max memories in context' },
        max_chars: {
          type: 'integer',
          minimum: 500,
          maximum: 24000,
          description: 'Character budget',
        },
        summary_only: {
          type: 'boolean',
          description: 'Omit bodies; title+summary only (default true)',
        },
        format: { type: 'string', enum: ['markdown', 'xml'], description: 'Output format' },
      },
    },
  ),
  readOnly(
    'build_prompt',
    'Build system and user prompts for an external LLM from ranked project memory.',
    {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'User task or instruction for the downstream LLM' },
        query: { type: 'string', description: 'Optional retrieval query override' },
        projectId: { type: 'string', description: 'Project scope' },
        system_role: { type: 'string', description: 'Custom system role preamble' },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Max memories' },
        max_chars: {
          type: 'integer',
          minimum: 500,
          maximum: 24000,
          description: 'Context char budget',
        },
      },
      required: ['task'],
    },
  ),
  readOnly(
    'get_graph_capabilities',
    'Describe available knowledge-graph traversal modes, limits, and relation types.',
    { type: 'object', properties: {} },
  ),
  readOnly(
    'traverse_relations',
    'Traverse memory relations via bidirectional BFS from a seed memory or slug.',
    {
      type: 'object',
      properties: {
        memoryId: { type: 'string', format: 'uuid', description: 'Seed memory UUID' },
        depth: { type: 'integer', minimum: 1, maximum: 3, description: 'BFS depth (default 2)' },
        direction: {
          type: 'string',
          enum: ['outgoing', 'incoming', 'both'],
          description: 'Edge direction filter',
        },
        seed: {
          type: 'object',
          description: 'Alternative seed: memoryId, slug, or sourcePath',
          properties: {
            memoryId: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            sourcePath: { type: 'string' },
          },
        },
      },
    },
  ),
  readOnly('list_workspaces', 'List workspaces owned by the authenticated identity.', {
    type: 'object',
    properties: {},
  }),
  readOnly('list_agents', 'List agent identities registered in the current workspace.', {
    type: 'object',
    properties: {},
  }),
  writeTool(
    'register_agent',
    'Register a new agent identity (Cursor, Claude Code, etc.) in the workspace.',
    {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Display name for the agent' },
        agent_type: { type: 'string', description: 'Agent type enum from deployment manifest' },
        client_id: { type: 'string', format: 'uuid', description: 'Optional linked API client id' },
        metadata: { type: 'object', description: 'Optional JSON metadata' },
      },
      required: ['name'],
    },
  ),
  readOnly(
    'get_capabilities',
    'Return the deployment capability manifest: enabled modules, tool registry, and limits.',
    { type: 'object', properties: {} },
  ),
  readOnly(
    'negotiate_capabilities',
    'Handshake to verify client-required capability flags against this deployment.',
    {
      type: 'object',
      properties: {
        protocol_version: { type: 'string', description: 'Client protocol version (e.g. 1.1.0)' },
        required_capabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Capabilities the client requires',
        },
        preferred_capabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional preferred capabilities',
        },
        client_name: { type: 'string', description: 'Client name (e.g. smithery)' },
        client_version: { type: 'string', description: 'Client version' },
      },
    },
  ),
  writeTool(
    'submit_signal',
    'Submit memory quality feedback or forge inspection outcome signals for learning loops.',
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['explicit_feedback', 'inspection_outcome'],
          description: 'Signal category',
        },
        memory_id: { type: 'string', format: 'uuid', description: 'Target memory for feedback' },
        value: { type: 'string', enum: ['helpful', 'not_helpful'], description: 'Feedback value' },
        task_id: { type: 'string', description: 'Related task or inspect id' },
      },
    },
  ),
  writeTool(
    'run_stewardship',
    'Run the memory stewardship pipeline (dedupe, archive candidates). Dry-run by default.',
    {
      type: 'object',
      properties: {
        dry_run: {
          type: 'boolean',
          description: 'When true (default), report actions without mutating data',
        },
        project: { type: 'string', description: 'Optional project filter' },
      },
    },
    { destructiveHint: false },
  ),
  readOnly(
    'get_compression_status',
    'Report semantic compression status and pending duplicate clusters for the owner.',
    {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Optional project filter' },
      },
    },
  ),
  readOnly(
    'sync_pull',
    'Pull memory deltas from the server since the last sync cursor for a client platform.',
    {
      type: 'object',
      properties: {
        platform_id: {
          type: 'string',
          description: 'Client platform id (e.g. cursor, vscode, claude)',
        },
        cursor: { type: 'string', description: 'Opaque cursor from prior sync_pull' },
      },
      required: ['platform_id'],
    },
  ),
  writeTool(
    'sync_push',
    'Push batched memory create/update/delete operations from a client platform.',
    {
      type: 'object',
      properties: {
        platform_id: { type: 'string', description: 'Client platform id' },
        cursor: {
          type: 'string',
          description: 'Expected server cursor for optimistic concurrency',
        },
        changes: {
          type: 'array',
          maxItems: 100,
          description: 'Batch of memory mutations',
          items: { type: 'object' },
        },
      },
      required: ['platform_id', 'changes'],
    },
  ),
  readOnly('sync_status', 'Get multi-client sync status and last cursor for a platform.', {
    type: 'object',
    properties: {
      platform_id: { type: 'string', description: 'Client platform id' },
    },
    required: ['platform_id'],
  }),
];

export const MCP_SERVER_CARD_PROMPTS = [
  {
    name: 'session-handoff',
    description:
      'Save a structured session handoff before ending work — search prior context, then save_memory with tags handoff.',
    arguments: [
      {
        name: 'project',
        description: 'Project slug for scoping the handoff memory',
        required: true,
      },
      {
        name: 'summary',
        description: 'One-line summary of what to resume next session',
        required: true,
      },
    ],
  },
  {
    name: 'task-context',
    description:
      'Build token-efficient context for a coding task — call get_context with project and query.',
    arguments: [
      {
        name: 'task',
        description: 'Describe the coding task or bug to work on',
        required: true,
      },
      {
        name: 'project',
        description: 'Project slug to search within',
        required: false,
      },
    ],
  },
  {
    name: 'memory-search',
    description: 'Find relevant memories before answering — use search_memory with hybrid mode.',
    arguments: [
      {
        name: 'query',
        description: 'Natural language search query',
        required: true,
      },
    ],
  },
];

export const MCP_SERVER_CARD_RESOURCES = [
  {
    uri: 'https://github.com/ontorata/ratary/tree/main/docs/install',
    name: 'install-guide',
    description: 'Ratary MCP install hub — Cursor, Claude Code, remote API, Docker',
    mimeType: 'text/html',
  },
  {
    uri: 'https://github.com/ontorata/ratary/tree/main/MCP',
    name: 'mcp-overview',
    description: 'Ratary Memory MCP overview, transports, and 28-tool registry',
    mimeType: 'text/html',
  },
  {
    uri: 'https://ratary.ontorata.com/api/v1/capabilities',
    name: 'live-capabilities',
    description: 'Live deployment capability manifest (requires API key)',
    mimeType: 'application/json',
  },
];

export const MCP_SERVER_INSTRUCTIONS =
  'Ratary Memory MCP (id: ratary) — persistent owner-scoped coding memory. ' +
  'Start with search_memory or get_context scoped by project. ' +
  'Save handoffs with save_memory and tags ["handoff"]. ' +
  'Call get_capabilities for deployment limits. ' +
  'API key: Authorization Bearer aic_... or X-API-Key. Docs: https://github.com/ontorata/ratary/tree/main/MCP';
