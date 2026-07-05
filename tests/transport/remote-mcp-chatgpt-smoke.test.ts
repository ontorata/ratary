import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { isInitializeRequest } from '../../src/transport/mcp/remote/mcp-remote-context.js';
import { MCP_TOOL_NAMES } from '../../src/capabilities/mcp-tool-names.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('D131-01 ChatGPT remote MCP CI smoke', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.stubEnv('REMOTE_MCP_ENABLED', 'true');
    vi.stubEnv('REMOTE_MCP_OAUTH_ENABLED', 'false');
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('accepts ChatGPT-style initialize JSON-RPC payload', () => {
    expect(
      isInitializeRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'ChatGPT', version: '1.0.0' },
        },
      }),
    ).toBe(true);
  });

  it('exposes remote MCP path and core tool catalog for connector smoke', async () => {
    const bootstrap = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/bootstrap',
      payload: { name: 'chatgpt-smoke', client: { name: 'ChatGPT', version: '1.0.0' } },
    });
    const apiKey = bootstrap.json().data.apiKey as string;

    const capabilities = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(capabilities.statusCode).toBe(200);
    const body = capabilities.json();
    expect(body.transport?.mcp?.remote?.enabled).toBe(true);
    expect(body.mcp?.toolNames).toEqual(expect.arrayContaining(['get_context', 'save_memory']));
    expect(body.mcp?.toolCount).toBe(MCP_TOOL_NAMES.length);

    const unauthorized = await app.inject({
      method: 'POST',
      url: '/mcp',
      payload: {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'ChatGPT', version: '1.0.0' },
        },
      },
    });
    expect(unauthorized.statusCode).toBe(401);
  });
});
