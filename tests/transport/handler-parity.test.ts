import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  createTestMemoryRepository,
  createTestRelationRepository,
  asSqlDatabase,
} from '../helpers/sql-test-harness.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../../src/services/create-memory-service.js';
import { createContextService } from '../../src/memory/create-context-service.js';
import { createGraphService } from '../../src/services/graph.service.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import { getEnv } from '../../src/config/index.js';
import { createTransportHandlers } from '../../src/transport/shared/handlers/create-transport-handlers.js';
import {
  buildTransportContextFromMcpEnv,
  buildTransportContextFromRestRequest,
} from '../../src/transport/shared/resolve-transport-scope.js';
import type { AuthUser } from '../../src/auth/auth.types.js';
import type { FastifyRequest } from 'fastify';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('MCP_OWNER_ID', 'owner-parity');

const authUser: AuthUser = {
  ownerId: 'owner-parity',
  identityId: 'identity-parity',
  identityType: 'api_key',
  clientId: null,
  permissions: ['memory.read', 'memory.write'],
};

function fakeRequest(): FastifyRequest {
  return {
    id: 'req-parity',
    user: authUser,
    headers: {},
    query: {},
  } as FastifyRequest;
}

describe('transport handlers — REST/MCP parity', () => {
  let handlers: ReturnType<typeof createTransportHandlers>;

  beforeEach(() => {
    resetD1Client();
    const mockDb = new MockD1Client();
    setD1Client(mockDb);

    const sql = asSqlDatabase(mockDb);
    const repository = createTestMemoryRepository(mockDb);
    const relationRepository = createTestRelationRepository(mockDb);
    const memoryService = createMemoryService(sql, repository);
    const relationService = createMemoryRelationService(sql, repository, relationRepository);
    const contextService = createContextService(repository, { sql });
    const graphService = createGraphService(sql, repository);
    const scopeResolver = new DefaultScopeResolver(sql);

    handlers = createTransportHandlers({
      memoryService,
      contextService,
      graphService,
      relationService,
      scopeResolver,
      env: getEnv(),
    });
  });

  afterEach(() => {
    resetD1Client();
  });

  const contexts = () => ({
    rest: buildTransportContextFromRestRequest(fakeRequest()),
    mcp: buildTransportContextFromMcpEnv({
      ownerId: 'owner-parity',
    }),
  });

  it('create + getById returns same memory for REST and MCP', async () => {
    const { rest, mcp } = contexts();
    const input = {
      title: 'Parity memory',
      content: 'Shared handler body',
      project: 'phase-10-5',
      tags: ['parity'],
      level: 'note' as const,
    };

    const fromRest = await handlers.memory.create.handle(rest, input);
    const fromMcp = await handlers.memory.create.handle(mcp, {
      ...input,
      title: 'Parity memory MCP',
    });

    const gotRest = await handlers.memory.getById.handle(rest, { id: fromRest.id });
    const gotMcp = await handlers.memory.getById.handle(mcp, { id: fromMcp.id });

    expect(gotRest.ownerId).toBe(gotMcp.ownerId);
    expect(gotRest.project).toBe(gotMcp.project);
  });

  it('search returns ranked results for REST and MCP', async () => {
    const { rest, mcp } = contexts();
    await handlers.memory.create.handle(rest, {
      title: 'Search parity',
      content: 'findme keyword',
      project: 'ai-brain',
      tags: ['search'],
      level: 'note',
    });

    const restSearch = await handlers.memory.search.handle(rest, { q: 'findme', limit: 10 });
    const mcpSearch = await handlers.memory.search.handle(mcp, { q: 'findme', limit: 10 });

    expect(restSearch.memories.length).toBeGreaterThan(0);
    expect(mcpSearch.memories.length).toBe(restSearch.memories.length);
  });

  it('listProjects and listTags match across transports', async () => {
    const { rest, mcp } = contexts();
    await handlers.memory.create.handle(rest, {
      title: 'List parity',
      content: 'content',
      project: 'shared-project',
      tags: ['alpha', 'beta'],
      level: 'note',
    });

    const restProjects = await handlers.memory.listProjects.handle(rest, {});
    const mcpProjects = await handlers.memory.listProjects.handle(mcp, {});
    const restTags = await handlers.memory.listTags.handle(rest, {});
    const mcpTags = await handlers.memory.listTags.handle(mcp, {});

    expect(restProjects).toEqual(mcpProjects);
    expect(restTags.sort()).toEqual(mcpTags.sort());
  });

  it('toggleFavorite and archive behave consistently', async () => {
    const { rest, mcp } = contexts();
    const created = await handlers.memory.create.handle(rest, {
      title: 'Toggle parity',
      content: 'body',
      project: 'p',
      tags: [],
      level: 'note',
    });

    const favRest = await handlers.memory.toggleFavorite.handle(rest, { id: created.id });
    const favMcp = await handlers.memory.toggleFavorite.handle(mcp, { id: created.id });
    expect(favRest.favorite).toBe(favMcp.favorite);

    const archRest = await handlers.memory.archive.handle(rest, { id: created.id });
    const archMcp = await handlers.memory.archive.handle(mcp, { id: created.id });
    expect(archRest.archived).toBe(archMcp.archived);
  });

  it('buildContext returns context for REST and MCP', async () => {
    const { rest, mcp } = contexts();
    await handlers.memory.create.handle(rest, {
      title: 'Context parity',
      content: 'memory intelligence retrieval',
      project: 'ai-brain',
      tags: ['context'],
      level: 'note',
    });

    const restCtx = await handlers.context.buildContext.handle(rest, {
      query: 'intelligence',
      limit: 5,
    });
    const mcpCtx = await handlers.context.buildContext.handle(mcp, {
      query: 'intelligence',
      limit: 5,
    });

    expect(restCtx.context).toContain('Relevant Memory Context');
    expect(mcpCtx.context).toContain('Relevant Memory Context');
    expect(restCtx.totalCandidates).toBe(mcpCtx.totalCandidates);
  });

  it('getManifest returns protocol version for REST and MCP', async () => {
    const { rest, mcp } = contexts();
    const restManifest = await handlers.capabilities.getManifest.handle(rest, {});
    const mcpManifest = await handlers.capabilities.getManifest.handle(mcp, {});

    expect(restManifest.protocolVersion).toBe(mcpManifest.protocolVersion);
    expect(restManifest.mcp.toolCount).toBe(mcpManifest.mcp.toolCount);
  });

  it('graph capabilities and traverse match across transports', async () => {
    const { rest, mcp } = contexts();
    const restCaps = await handlers.graph.getCapabilities.handle(rest, {});
    const mcpCaps = await handlers.graph.getCapabilities.handle(mcp, {});
    expect(restCaps).toEqual(mcpCaps);

    const source = await handlers.memory.create.handle(rest, {
      title: 'Graph A',
      content: 'a',
      project: 'g',
      tags: [],
      level: 'note',
    });
    const target = await handlers.memory.create.handle(rest, {
      title: 'Graph B',
      content: 'b',
      project: 'g',
      tags: [],
      level: 'note',
    });
    await handlers.relations.create.handle(rest, {
      memoryId: source.id,
      input: { targetMemoryId: target.id, relation: 'related', sourceType: 'api' },
    });

    const restTraverse = await handlers.graph.traverse.handle(rest, {
      memoryId: source.id,
      depth: 1,
    });
    const mcpTraverse = await handlers.graph.traverse.handle(mcp, {
      memoryId: source.id,
      depth: 1,
    });
    expect(restTraverse.memoryIds.sort()).toEqual(mcpTraverse.memoryIds.sort());
  });

  it('listRelations returns same edges for REST and MCP', async () => {
    const { rest, mcp } = contexts();
    const a = await handlers.memory.create.handle(rest, {
      title: 'Rel A',
      content: 'a',
      project: 'r',
      tags: [],
      level: 'note',
    });
    const b = await handlers.memory.create.handle(rest, {
      title: 'Rel B',
      content: 'b',
      project: 'r',
      tags: [],
      level: 'note',
    });
    await handlers.relations.create.handle(rest, {
      memoryId: a.id,
      input: { targetMemoryId: b.id, relation: 'depends_on', sourceType: 'api' },
    });

    const restRels = await handlers.relations.list.handle(rest, { memoryId: a.id });
    const mcpRels = await handlers.relations.list.handle(mcp, { memoryId: a.id });
    expect(restRels.length).toBe(mcpRels.length);
    expect(restRels[0]?.relation).toBe(mcpRels[0]?.relation);
  });
});
