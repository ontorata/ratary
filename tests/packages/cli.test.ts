import { describe, it, expect, vi } from 'vitest';
import { runCli } from '../../packages/cli/src/cli.js';
import type { AiBrainClient } from '../../packages/sdk/src/index.js';

function mockClient(overrides: Partial<AiBrainClient> = {}): AiBrainClient {
  return {
    capabilities: { get: vi.fn(async () => ({ protocolVersion: '1.0.0' })) },
    ecosystem: {
      listClients: vi.fn(async () => ({ clients: [], count: 0 })),
      getClient: vi.fn(async () => ({ clientType: 'cursor' })),
    },
    memory: {
      list: vi.fn(async () => ({ memories: [] })),
      get: vi.fn(async () => ({ id: 'x' })),
      search: vi.fn(async () => ({ results: [] })),
    },
    context: { build: vi.fn(async () => ({ context: 'ctx' })) },
    federation: { listPeers: vi.fn(async () => ({ peers: [] })) },
    ...overrides,
  } as unknown as AiBrainClient;
}

describe('CLI — uses SDK only', () => {
  it('capabilities command calls client.capabilities.get', async () => {
    const client = mockClient();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCli(client, ['capabilities']);

    expect(client.capabilities.get).toHaveBeenCalledOnce();
    log.mockRestore();
  });

  it('memory search command calls client.memory.search', async () => {
    const client = mockClient();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCli(client, ['memory', 'search', 'handoff']);

    expect(client.memory.search).toHaveBeenCalledWith({
      q: 'handoff',
      limit: undefined,
      mode: undefined,
      extended: false,
      rerank: false,
      snippet_length: undefined,
    });
    log.mockRestore();
  });
});
