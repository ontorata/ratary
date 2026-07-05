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

describe('Remote MCP OAuth API (Phase 13.1D)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('REMOTE_MCP_ENABLED', 'true');
    vi.stubEnv('REMOTE_MCP_OAUTH_ENABLED', 'true');
    vi.stubEnv('REMOTE_MCP_PUBLIC_URL', 'https://memory.test.example/mcp');
    vi.stubEnv('OIDC_ISSUER_URL', 'https://auth.test.example/realms/ai-brain');
    vi.stubEnv('OIDC_CLIENT_ID', 'ratary-mcp');
    vi.stubEnv('OIDC_MCP_OWNER_ID', '00000000-0000-4000-8000-000000000099');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: true });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('GET /.well-known/oauth-protected-resource/mcp returns metadata', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/.well-known/oauth-protected-resource/mcp',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().resource).toBe('https://memory.test.example/mcp');
    expect(response.json().authorization_servers[0]).toBe(
      'https://auth.test.example/realms/ai-brain',
    );
  });

  it('POST /mcp without auth returns 401 with WWW-Authenticate resource_metadata', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/mcp',
      payload: { jsonrpc: '2.0', method: 'initialize', params: {}, id: 1 },
    });

    expect(response.statusCode).toBe(401);
    expect(response.headers['www-authenticate']).toContain('resource_metadata=');
  });
});
