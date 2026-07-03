import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Graph API E2E', () => {
  let app: FastifyInstance;
  let mockDb: MockD1Client;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    app = await buildApp({ logger: false, skipAuth: true });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('should return graph capabilities', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/graph/capabilities',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.capabilities.supportsTraversal).toBe(true);
    expect(body.capabilities.supportsBidirectional).toBe(true);
    expect(typeof body.capabilities.graphRetrievalEnabled).toBe('boolean');
  });

  it('should traverse relations from a seed memory', async () => {
    const seedResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: {
        title: 'Graph seed',
        project: 'graph',
        content: 'Seed memory for traversal',
      },
    });
    const seed = seedResponse.json();

    const neighborResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      payload: {
        title: 'Graph neighbor',
        project: 'graph',
        content: 'Neighbor memory',
      },
    });
    const neighbor = neighborResponse.json();

    const relationRepository = new MemoryRelationRepository(mockDb);
    await relationRepository.insert({
      sourceMemoryId: seed.id,
      targetMemoryId: neighbor.id,
      relation: 'depends_on',
      ownerId: '',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/graph/traverse',
      payload: {
        memoryId: seed.id,
        depth: 2,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.memoryIds).toContain(neighbor.id);
    expect(body.neighbors.some((item: { memoryId: string }) => item.memoryId === neighbor.id)).toBe(
      true,
    );
  });

  it('should validate traverse request body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/graph/traverse',
      payload: { memoryId: 'not-a-uuid' },
    });

    expect(response.statusCode).toBe(400);
  });
});
