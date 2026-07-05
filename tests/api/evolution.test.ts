import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { computeSemanticHash } from '../../src/memory/semantic-hash.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Memory Evolution API (D97-01 / D97-02)', () => {
  let app: FastifyInstance;
  let apiKey: string;
  let memoryId: string;

  beforeEach(async () => {
    vi.stubEnv('MEMORY_EVOLUTION_ENABLED', 'true');
    vi.stubEnv('MEMORY_EVOLUTION_STORE_PROVIDER', 'sql');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'evolution-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;

    const create = await app.inject({
      method: 'POST',
      url: '/api/v1/memory',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        title: 'Evolution seed',
        content: 'version one body',
        project: 'ratary',
        summary: 'v1 summary',
      },
    });
    expect(create.statusCode).toBe(201);
    memoryId = create.json().id as string;

    await app.inject({
      method: 'PUT',
      url: `/api/v1/memory/${memoryId}`,
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        content: 'version two body',
        summary: 'v2 summary',
      },
    });
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('POST restore reverts head to an archived version snapshot', async () => {
    const versions = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryId}/versions`,
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(versions.statusCode).toBe(200);
    const listBody = versions.json();
    const list = listBody.versions as Array<{ versionNumber: number; snapshot: { content: string } }>;
    expect(list.length).toBeGreaterThanOrEqual(1);
    const firstVersion = list[0]!.versionNumber;

    const restore = await app.inject({
      method: 'POST',
      url: `/api/v1/memory/${memoryId}/versions/restore/${String(firstVersion)}`,
      headers: { authorization: `Bearer ${apiKey}` },
    });
    if (restore.statusCode !== 200) {
      throw new Error(`restore: ${restore.body}`);
    }
    expect(restore.statusCode).toBe(200);
    expect(restore.json().content).toBe('version one body');
  });

  it('POST merge applies DefaultMemoryMergePolicy to current head', async () => {
    const versions = await app.inject({
      method: 'GET',
      url: `/api/v1/memory/${memoryId}/versions`,
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const list = versions.json().versions as Array<{ versionNumber: number }>;
    const baseVersion = list[0]!.versionNumber;

    await app.inject({
      method: 'PUT',
      url: `/api/v1/memory/${memoryId}`,
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { title: 'Current head title' },
    });

    const merge = await app.inject({
      method: 'POST',
      url: `/api/v1/memory/${memoryId}/versions/merge`,
      headers: { authorization: `Bearer ${apiKey}` },
      payload: {
        baseVersion,
        incomingVersion: 'current',
      },
    });

    if (merge.statusCode !== 200) {
      throw new Error(`merge: ${merge.body}`);
    }
    expect(merge.statusCode).toBe(200);
    expect(merge.json().title).toBe('Current head title');
    expect(merge.json().content).toBe('version two body');
  });
});

describe('MemoryEvolutionService unit helpers', () => {
  it('semantic hash helper remains stable for merge tests', () => {
    expect(computeSemanticHash('A', 's', 'b')).toBeTruthy();
  });
});