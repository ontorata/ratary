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
import { buildTransportContextFromRestRequest } from '../../src/transport/shared/resolve-transport-scope.js';
import type { AuthUser } from '../../src/auth/auth.types.js';
import type { FastifyRequest } from 'fastify';
import type { IStreamPublisher } from '../../src/transport/shared/streaming/istream-publisher.interface.js';
import type { ContextChunk } from '../../src/transport/shared/streaming/context-chunk.types.js';
import { chunksFromBuildContextResult } from '../../src/transport/shared/streaming/stream-context-chunks.js';
import { buildProtocolBenchmarkReport } from '../../src/transport/benchmark/protocol-benchmark.report.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');

const authUser: AuthUser = {
  ownerId: 'owner-stream',
  identityId: 'identity-stream',
  identityType: 'api_key',
  clientId: null,
  permissions: ['memory.read', 'memory.write'],
};

function fakeRequest(): FastifyRequest {
  return {
    id: 'req-stream',
    user: authUser,
    headers: {},
    query: { query: 'handoff' },
  } as FastifyRequest;
}

class CollectingPublisher implements IStreamPublisher<ContextChunk> {
  readonly chunks: ContextChunk[] = [];

  async publish(chunk: ContextChunk): Promise<void> {
    this.chunks.push(chunk);
  }

  async close(): Promise<void> {
    // no-op
  }
}

describe('Phase 13 — context stream', () => {
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

  it('streamContext emits metadata, done, and respects publisher contract', async () => {
    const ctx = buildTransportContextFromRestRequest(fakeRequest());
    const publisher = new CollectingPublisher();

    await handlers.context.streamContext.handle(ctx, {
      query: 'nothing-matching',
      limit: 5,
      publisher,
    });

    expect(publisher.chunks.length).toBeGreaterThanOrEqual(2);
    expect(publisher.chunks[0]?.type).toBe('metadata');
    expect(publisher.chunks.at(-1)?.type).toBe('done');
  });

  it('chunksFromBuildContextResult orders meta → memories → done', async () => {
    const ctx = buildTransportContextFromRestRequest(fakeRequest());
    const built = await handlers.context.buildContext.handle(ctx, { query: 'x', limit: 3 });
    const chunks = [...chunksFromBuildContextResult(built)];
    expect(chunks[0]?.type).toBe('metadata');
    expect(chunks.at(-1)?.type).toBe('done');
  });

  it('protocol benchmark report schema is valid', () => {
    const report = buildProtocolBenchmarkReport(
      { fixture: 'smoke', iterations: 2 },
      [
        { protocol: 'rest', mode: 'unary', durationMs: 10 },
        { protocol: 'rest', mode: 'unary', durationMs: 20 },
        { protocol: 'sse', mode: 'stream', durationMs: 15 },
      ],
    );

    expect(report.fixture).toBe('smoke');
    expect(report.results.some((r) => r.protocol === 'rest' && r.mode === 'unary')).toBe(true);
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
