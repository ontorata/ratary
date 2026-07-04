import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
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
import { D1AgentIdentity } from '../../src/agent/d1-agent-identity.js';
import { createMcpServer, createStdioMcpBinding } from '../../src/transport/mcp/mcp-server.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { createTransportHandlers } from '../../src/transport/shared/handlers/create-transport-handlers.js';
import { createSignalIngestPorts } from '../../src/composition/create-signal-ingest-ports.js';
import { createLearningPorts } from '../../src/composition/create-learning-ports.js';
import { NoOpEventBus } from '../../src/infrastructure/events/noop-event-bus.adapter.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('MCP_OWNER_ID', 'mcp-test-owner');

describe('MCP submit_signal (D85-01)', () => {
  let mockDb: MockD1Client;
  let client: Client;

  beforeEach(async () => {
    vi.stubEnv('SIGNAL_INGEST_ENABLED', 'true');
    vi.stubEnv('SIGNAL_STORE_PROVIDER', 'sql');
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    const sql = asSqlDatabase(mockDb);
    const env = getEnv();
    const repository = createTestMemoryRepository(mockDb);
    const relationRepository = createTestRelationRepository(mockDb);
    const memoryService = createMemoryService(sql, repository);
    const relationService = createMemoryRelationService(sql, repository, relationRepository);
    const contextService = createContextService(repository, { sql });
    const graphService = createGraphService(sql, repository);
    const scopeResolver = new DefaultScopeResolver(sql);
    const agentIdentity = new D1AgentIdentity(sql);
    const learningPorts = createLearningPorts(sql, env);
    const signalPorts = createSignalIngestPorts(sql, env, {
      eventBus: new NoOpEventBus(),
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
    });
    const server = createMcpServer(
      handlers,
      createStdioMcpBinding(scopeResolver),
      agentIdentity,
      sql,
    );

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('applies helpful feedback via submit_signal', async () => {
    const saved = await client.callTool({
      name: 'save_memory',
      arguments: {
        title: 'MCP signal target',
        content: 'content',
      },
    });
    const memoryId = JSON.parse((saved.content as [{ text: string }])[0].text).id as string;

    const result = await client.callTool({
      name: 'submit_signal',
      arguments: {
        type: 'explicit_feedback',
        memory_id: memoryId,
        value: 'helpful',
      },
    });

    const body = JSON.parse((result.content as [{ text: string }])[0].text) as {
      accepted: boolean;
      appliedDelta?: number;
    };
    expect(body.accepted).toBe(true);
    expect(body.appliedDelta).toBe(5);
  });
});
