import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { MCP_TOOL_NAMES } from '../../src/capabilities/mcp-tool-names.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('AUTH_SECRET', 'test-auth-secret-minimum-32-characters!!');
vi.stubEnv('NODE_ENV', 'test');

describe('Capabilities API', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    app = await buildApp({ logger: false, skipAuth: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    resetD1Client();
    resetEnvCache();
  });

  it('GET /api/v1/capabilities returns manifest without auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/capabilities',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-protocol-version']).toBe('1.0.0');

    const body = response.json();
    expect(body.mcp.toolCount).toBe(MCP_TOOL_NAMES.length);
    expect(body.capabilities.supportsMemoryCRUD).toBe(true);
    expect(body.retrieval.defaultContentMode).toBe('summary');
    expect(body.rest.openApiUrl).toContain('/docs/json');
    expect(body.transport.rest.enabled).toBe(true);
    expect(body.transport.mcp.toolCount).toBe(MCP_TOOL_NAMES.length);
    expect(body.transport.grpc.enabled).toBe(false);
    expect(body.transport.sdk.packageName).toBe('@ratary/sdk');
    expect(body.transport.sdk.status).toBe('published');
    expect(body.capabilities.supportsDeveloperPlatform).toBe(true);
  });

  it('POST /api/v1/capabilities/negotiate returns handshake matrix without auth', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/capabilities/negotiate',
      payload: {
        protocolVersion: '1.0.0',
        requiredCapabilities: ['supportsMemoryCRUD', 'supportsContextBuilder'],
        preferredCapabilities: ['supportsHybridRetrieval'],
        transports: ['rest', 'mcp'],
        clientInfo: { name: 'vitest', version: '1.0.0' },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-protocol-version']).toBe('1.0.0');

    const body = response.json();
    expect(body.compatible).toBe(true);
    expect(body.negotiatedProtocolVersion).toBe('1.0.0');
    expect(body.matched.required).toEqual(['supportsMemoryCRUD', 'supportsContextBuilder']);
    expect(body.missing.preferred).toContain('supportsHybridRetrieval');
    expect(body.negotiateUrl).toBe('/api/v1/capabilities/negotiate');
  });
});
