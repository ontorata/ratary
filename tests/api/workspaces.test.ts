import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Workspace & Agent API E2E', () => {
  let app: FastifyInstance;
  let mockDb: MockD1Client;
  let apiKey: string;
  let ownerId: string;
  let defaultWorkspaceId: string;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();

    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'workspace-api', client: { name: 'cursor', type: 'mcp' } },
    });
    apiKey = bootstrap.json().data.apiKey as string;
    ownerId = bootstrap.json().data.owner_id as string;

    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/workspaces',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(listRes.statusCode).toBe(200);
    const workspaces = listRes.json().workspaces as Array<{ id: string; slug: string }>;
    expect(workspaces.length).toBeGreaterThanOrEqual(1);
    defaultWorkspaceId = workspaces.find((w) => w.slug === 'default')!.id;
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('should list workspaces including lazily created default', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/workspaces',
      headers: { authorization: `Bearer ${apiKey}` },
    });

    expect(response.statusCode).toBe(200);
    const workspaces = response.json().workspaces as Array<{ slug: string; ownerId: string }>;
    expect(workspaces.some((w) => w.slug === 'default')).toBe(true);
    expect(workspaces[0]?.ownerId).toBe(ownerId);
  });

  it('should create a workspace and list it', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/workspaces',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { name: 'Team Alpha', slug: 'team-alpha' },
    });
    expect(createRes.statusCode).toBe(201);
    const created = createRes.json();
    expect(created.slug).toBe('team-alpha');
    expect(created.ownerId).toBe(ownerId);

    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/workspaces',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const slugs = (listRes.json().workspaces as Array<{ slug: string }>).map((w) => w.slug);
    expect(slugs).toContain('default');
    expect(slugs).toContain('team-alpha');
  });

  it('should reject duplicate workspace slug', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/workspaces',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { name: 'Team Beta', slug: 'team-beta' },
    });

    const duplicate = await app.inject({
      method: 'POST',
      url: '/api/v1/workspaces',
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { name: 'Team Beta 2', slug: 'team-beta' },
    });
    expect(duplicate.statusCode).toBe(400);
  });

  it('should register and list agents in a workspace', async () => {
    const registerRes = await app.inject({
      method: 'POST',
      url: `/api/v1/workspaces/${defaultWorkspaceId}/agents`,
      headers: { authorization: `Bearer ${apiKey}` },
      payload: { name: 'Cursor Agent', agentType: 'mcp', metadata: { channel: 'ide' } },
    });
    expect(registerRes.statusCode).toBe(201);
    const agent = registerRes.json();
    expect(agent.name).toBe('Cursor Agent');
    expect(agent.workspaceId).toBe(defaultWorkspaceId);

    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/workspaces/${defaultWorkspaceId}/agents`,
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(listRes.statusCode).toBe(200);
    const agents = listRes.json().agents as Array<{ id: string; name: string }>;
    expect(agents.some((a) => a.id === agent.id)).toBe(true);
  });

  it('should return 404 when listing agents for unknown workspace', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/workspaces/00000000-0000-4000-8000-000000009999/agents',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.statusCode).toBe(404);
  });
});
