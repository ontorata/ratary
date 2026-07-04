import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InitializeRequestSchema, LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js';
import { CapabilityManifestBuilder } from '../../src/capabilities/capability-manifest-builder.js';
import {
  MCP_CAPABILITIES_META_KEY,
  MCP_CAPABILITIES_NEGOTIATION_META_KEY,
  MCP_CAPABILITIES_REQUEST_META_KEY,
} from '../../src/capabilities/capability-manifest.constants.js';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import {
  buildMcpInitializeInstructions,
  buildMcpServerInfoDescription,
  wireMcpInitializeCapabilities,
} from '../../src/transport/mcp/mcp-initialize-capabilities.js';

type ServerWithHandlers = McpServer['server'] & {
  _requestHandlers: Map<string, (request: unknown, extra: unknown) => Promise<unknown>>;
};

function getInitializeHandler(server: McpServer) {
  const handlers = (server.server as ServerWithHandlers)._requestHandlers;
  const handler = handlers.get('initialize');
  if (!handler) {
    throw new Error('initialize handler not registered');
  }
  return handler;
}

describe('wireMcpInitializeCapabilities', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns condensed snapshot without client request', async () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    const server = new McpServer({ name: 'ai-memory-cloud', version: '1.0.0' });
    wireMcpInitializeCapabilities(server, () => manifest);

    const result = (await getInitializeHandler(server)(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: LATEST_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' },
        },
      },
      {},
    )) as {
      serverInfo: { name: string; description?: string };
      instructions?: string;
      _meta?: Record<string, unknown>;
    };

    expect(result.serverInfo.name).toBe('ai-memory-cloud');
    expect(result._meta?.[MCP_CAPABILITIES_META_KEY]).toBeDefined();
    expect(result._meta?.[MCP_CAPABILITIES_NEGOTIATION_META_KEY]).toBeUndefined();
    expect(result.instructions).toContain('get_capabilities');
  });

  it('returns negotiation result when client sends capabilities-request meta', async () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    const server = new McpServer({ name: 'ai-memory-cloud', version: '1.0.0' });
    wireMcpInitializeCapabilities(server, () => manifest);

    const result = (await getInitializeHandler(server)(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: LATEST_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' },
          _meta: {
            [MCP_CAPABILITIES_REQUEST_META_KEY]: {
              protocolVersion: '1.0.0',
              requiredCapabilities: ['supportsMemoryCRUD'],
              transports: ['mcp'],
            },
          },
        },
      },
      {},
    )) as {
      serverInfo: { description?: string };
      instructions?: string;
      _meta?: Record<string, unknown>;
    };

    const negotiation = result._meta?.[MCP_CAPABILITIES_NEGOTIATION_META_KEY] as {
      compatible: boolean;
      matched: { required: string[] };
    };

    expect(negotiation.compatible).toBe(true);
    expect(negotiation.matched.required).toContain('supportsMemoryCRUD');
    expect(result.serverInfo.description).toBe(
      buildMcpServerInfoDescription(
        result._meta?.[MCP_CAPABILITIES_META_KEY] as Parameters<
          typeof buildMcpServerInfoDescription
        >[0],
        negotiation,
      ),
    );
    expect(result.instructions).toBe(
      buildMcpInitializeInstructions(
        result._meta?.[MCP_CAPABILITIES_META_KEY] as Parameters<
          typeof buildMcpInitializeInstructions
        >[0],
        negotiation,
      ),
    );
  });

  it('accepts InitializeRequestSchema payloads', () => {
    const parsed = InitializeRequestSchema.safeParse({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: LATEST_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' },
      },
    });

    expect(parsed.success).toBe(true);
  });
});
