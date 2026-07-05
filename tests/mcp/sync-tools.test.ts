import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
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
import { D1AgentIdentity } from '../../src/agent/d1-agent-identity.js';
import { createMcpServer, createStdioMcpBinding } from '../../src/transport/mcp/mcp-server.js';
import { getEnv } from '../../src/config/index.js';
import { createTransportHandlers } from '../../src/transport/shared/handlers/create-transport-handlers.js';
import { createMultiAiPorts } from '../../src/composition/create-multi-ai-ports.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('MCP_OWNER_ID', 'mcp-sync-owner');

describe('MCP sync tools (Phase 09.8 — D98 MCP surface)', () => {
  let client: Client;

  beforeEach(async () => {
    vi.stubEnv('MULTI_CLIENT_SYNC_ENABLED', 'true');
    vi.stubEnv('MULTI_CLIENT_SYNC_STORE_PROVIDER', 'sql');
    vi.stubEnv('MULTI_CLIENT_SYNC_STRATEGY', 'field_merge');
    resetEnvCache();
    resetD1Client();
    const mockDb = new MockD1Client();
    setD1Client(mockDb);

    const sql = asSqlDatabase(mockDb);
    const repository = createTestMemoryRepository(mockDb);
    const relationRepository = createTestRelationRepository(mockDb);
    const multiAi = createMultiAiPorts(sql, getEnv());
    const memoryService = createMemoryService(sql, repository, multiAi);
    const relationService = createMemoryRelationService(sql, repository, relationRepository);
    const contextService = createContextService(repository, { sql });
    const graphService = createGraphService(sql, repository);
    const { scopeResolver, agentIdentity } = multiAi;
    const handlers = createTransportHandlers({
      memoryService,
      contextService,
      graphService,
      relationService,
      scopeResolver,
      env: getEnv(),
    });

    const server = createMcpServer(
      handlers,
      createStdioMcpBinding(scopeResolver),
      agentIdentity,
      sql,
      {
        clientSync: multiAi.bindClientSyncService(memoryService),
        clientSyncEnabled: multiAi.clientSync.enabled,
      },
    );

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    client = new Client({ name: 'sync-test-client', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled payload when MULTI_CLIENT_SYNC_ENABLED=false', async () => {
    await client.close();
    vi.stubEnv('MULTI_CLIENT_SYNC_ENABLED', 'false');
    resetEnvCache();

    const mockDb = new MockD1Client();
    setD1Client(mockDb);
    const sql = asSqlDatabase(mockDb);
    const repository = createTestMemoryRepository(mockDb);
    const relationRepository = createTestRelationRepository(mockDb);
    const multiAi = createMultiAiPorts(sql, getEnv());
    const memoryService = createMemoryService(sql, repository, multiAi);
    const relationService = createMemoryRelationService(sql, repository, relationRepository);
    const contextService = createContextService(repository, { sql });
    const graphService = createGraphService(sql, repository);
    const handlers = createTransportHandlers({
      memoryService,
      contextService,
      graphService,
      relationService,
      scopeResolver: multiAi.scopeResolver,
      env: getEnv(),
    });

    const server = createMcpServer(
      handlers,
      createStdioMcpBinding(multiAi.scopeResolver),
      multiAi.agentIdentity,
      sql,
      {
        clientSync: multiAi.bindClientSyncService(memoryService),
        clientSyncEnabled: multiAi.clientSync.enabled,
      },
    );
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'sync-off-client', version: '1.0.0' });
    await client.connect(clientTransport);

    const status = await client.callTool({
      name: 'sync_status',
      arguments: { platform_id: 'cursor' },
    });
    expect(status.isError).toBe(true);
    const body = JSON.parse((status.content as [{ text: string }])[0].text) as { error: string };
    expect(body.error).toContain('MULTI_CLIENT_SYNC_ENABLED=false');
  });

  it('sync_status → sync_pull → sync_push round trip via MCP', async () => {
    const saved = await client.callTool({
      name: 'save_memory',
      arguments: {
        title: 'MCP sync seed',
        content: 'sync body',
        project: 'sync-mcp',
        tags: ['seed'],
      },
    });
    expect(saved.isError).not.toBe(true);
    const memoryId = (
      JSON.parse((saved.content as [{ text: string }])[0].text) as { id: string }
    ).id;

    const status = await client.callTool({
      name: 'sync_status',
      arguments: { platform_id: 'cursor' },
    });
    expect(status.isError).not.toBe(true);
    const statusBody = JSON.parse((status.content as [{ text: string }])[0].text) as {
      platformId: string;
    };
    expect(statusBody.platformId).toBe('cursor');

    const pull = await client.callTool({
      name: 'sync_pull',
      arguments: { platform_id: 'cursor' },
    });
    expect(pull.isError).not.toBe(true);
    const pullBody = JSON.parse((pull.content as [{ text: string }])[0].text) as {
      memories: { id: string }[];
    };
    expect(pullBody.memories.some((row) => row.id === memoryId)).toBe(true);

    const push = await client.callTool({
      name: 'sync_push',
      arguments: {
        platform_id: 'cursor',
        changes: [
          {
            memory_id: memoryId,
            operation: 'update',
            data: { summary: 'via mcp sync_push', tags: ['mcp-sync'] },
          },
        ],
      },
    });
    expect(push.isError).not.toBe(true);
    const pushBody = JSON.parse((push.content as [{ text: string }])[0].text) as {
      accepted: number;
    };
    expect(pushBody.accepted).toBe(1);

    const got = await client.callTool({
      name: 'get_memory',
      arguments: { id: memoryId },
    });
    const memory = JSON.parse((got.content as [{ text: string }])[0].text) as {
      summary: string;
      tags: string[];
    };
    expect(memory.summary).toBe('via mcp sync_push');
    expect(memory.tags).toContain('mcp-sync');
  });
});
