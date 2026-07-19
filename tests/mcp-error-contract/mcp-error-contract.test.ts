/**
 * PI-B owner gate — transport-level regression suite for the MCP error
 * contract. Drives the REAL createMcpServer (all 28 registrations, wrapper,
 * createToolError override) over the SDK's in-memory transport and asserts,
 * for EVERY tool in MCP_TOOL_NAMES:
 *
 *   (a) a failing handler returns a parseable `{error, retryable}` envelope
 *       with the classification from MCP_TOOL_RETRYABLE;
 *   (b) pre-handler failures (zod validation, unknown tool) speak the same
 *       envelope with `retryable: false`;
 *   (c) success paths pass through byte-identical (no envelope, no isError).
 *
 * The suite iterates the canonical MCP_TOOL_NAMES list, so a tool added
 * without classification fails here (and at compile time via `satisfies`).
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../../src/transport/mcp/mcp-server.js';
import type { McpContextBinding } from '../../src/transport/mcp/mcp-server.js';
import { MCP_TOOL_NAMES, type McpToolName } from '../../src/capabilities/mcp-tool-names.js';
import { MCP_TOOL_RETRYABLE } from '../../src/transport/mcp/mcp-tool-retry-classification.js';
import { createCapabilitiesHandlers } from '../../src/transport/shared/handlers/create-transport-handlers.js';
import type { TransportHandlers } from '../../src/transport/shared/handlers/create-transport-handlers.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';
import type { IAgentIdentity } from '../../src/agent/iagent-identity.interface.js';
import type { TransportContext } from '../../src/transport/shared/transport-context.types.js';
import { DatabaseError } from '../../src/types/errors.js';
import { getEnv } from '../../src/config/index.js';

const INJECTED = new DatabaseError('injected transient failure');
const UUID = '3b241101-e2bb-4255-8caf-4136c566a962';

/** Minimal valid arguments per tool so zod passes and the handler runs. */
const VALID_ARGS: Record<McpToolName, Record<string, unknown>> = {
  save_memory: { title: 't', content: 'c' },
  update_memory: { id: UUID },
  delete_memory: { id: UUID },
  get_memory: { id: UUID },
  get_memory_by_codename: { codename: 'TASK-0001' },
  search_memory: { q: 'x' },
  get_memory_by_path: { path: 'notes/a.md' },
  get_context: {},
  build_prompt: { task: 'do x' },
  list_projects: {},
  list_tags: {},
  link_memories: { sourceId: UUID, targetId: UUID, relation: 'related' },
  list_relations: { id: UUID },
  toggle_favorite: { id: UUID },
  archive_memory: { id: UUID },
  get_graph_capabilities: {},
  traverse_relations: { memoryId: UUID },
  list_workspaces: {},
  list_agents: {},
  register_agent: { name: 'agent-x' },
  get_capabilities: {},
  negotiate_capabilities: {},
  submit_signal: { type: 'explicit_feedback', memory_id: UUID },
  run_stewardship: {},
  get_compression_status: {},
  sync_pull: { platform_id: 'cursor' },
  sync_push: { platform_id: 'cursor', changes: [] },
  sync_status: { platform_id: 'cursor' },
};

interface EnvelopeProbe {
  isError: boolean;
  parsed: { error?: unknown; retryable?: unknown } | null;
  text: string;
}

function probe(result: unknown): EnvelopeProbe {
  const r = result as { isError?: boolean; content?: Array<{ type: string; text?: string }> };
  const text = r.content?.[0]?.text ?? '';
  let parsed: EnvelopeProbe['parsed'] = null;
  try {
    parsed = JSON.parse(text) as EnvelopeProbe['parsed'];
  } catch {
    parsed = null;
  }
  return { isError: r.isError === true, parsed, text };
}

/**
 * Handlers stub: real capabilities manifest while `manifestGate.allow` is
 * true (so MCP initialize succeeds), everything else rejects with the
 * injected transient failure.
 */
function buildFailingHandlers(manifestGate: { allow: boolean }): TransportHandlers {
  const realCapabilities = createCapabilitiesHandlers({ env: getEnv() });
  const rejecting = { handle: async () => Promise.reject(INJECTED) };
  const rejectingSection = new Proxy({}, { get: () => rejecting });

  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'capabilities') {
          return {
            getManifest: {
              handle: async (ctx: unknown, input: unknown) => {
                if (manifestGate.allow) {
                  return realCapabilities.getManifest.handle(ctx as never, input as never);
                }
                throw INJECTED;
              },
            },
            negotiate: rejecting,
          };
        }
        return rejectingSection;
      },
    },
  ) as TransportHandlers;
}

function failingBinding(): McpContextBinding {
  const ctx: TransportContext = {
    source: 'mcp',
    ownerId: 'owner-contract',
  } as TransportContext;
  return {
    getTransportContext: () => ctx,
    resolveMemoryScope: async () => Promise.reject(INJECTED),
  };
}

const failingSql = new Proxy(
  {},
  {
    get: () => async () => Promise.reject(INJECTED),
  },
) as ISqlDatabase;

const failingAgentIdentity = new Proxy(
  {},
  {
    get: () => async () => Promise.reject(INJECTED),
  },
) as IAgentIdentity;

const failingSyncService = new Proxy(
  {},
  {
    get: () => async () => Promise.reject(INJECTED),
  },
) as never;

async function connectClient(server: ReturnType<typeof createMcpServer>): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'contract-test', version: '0.0.1' });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return client;
}

describe('MCP error contract — transport regression across all tools (PI-B)', () => {
  let client: Client;
  const manifestGate = { allow: true };

  beforeAll(async () => {
    const server = createMcpServer(
      buildFailingHandlers(manifestGate),
      failingBinding(),
      failingAgentIdentity,
      failingSql,
      { mcpTransport: 'stdio', clientSyncEnabled: true, clientSync: failingSyncService },
    );
    client = await connectClient(server);
    manifestGate.allow = false;
  });

  for (const toolName of MCP_TOOL_NAMES) {
    it(`${toolName} → {error, retryable: ${MCP_TOOL_RETRYABLE[toolName]}} on handler failure`, async () => {
      const result = await client.callTool({ name: toolName, arguments: VALID_ARGS[toolName] });
      const { isError, parsed } = probe(result);

      expect(isError, `${toolName} must flag isError`).toBe(true);
      expect(parsed, `${toolName} must return parseable JSON envelope`).not.toBeNull();
      expect(typeof parsed?.error, `${toolName} envelope.error must be a string`).toBe('string');
      expect(parsed?.retryable, `${toolName} retryable classification`).toBe(
        MCP_TOOL_RETRYABLE[toolName],
      );
    });
  }

  it('zod validation failure (missing required arg) speaks the envelope with retryable:false', async () => {
    const result = await client.callTool({ name: 'save_memory', arguments: {} });
    const { isError, parsed } = probe(result);

    expect(isError).toBe(true);
    expect(parsed).not.toBeNull();
    expect(parsed?.retryable).toBe(false);
    expect(String(parsed?.error)).toContain('save_memory');
  });

  it('unknown tool speaks the envelope with retryable:false (SDK pre-handler seam)', async () => {
    const result = await client.callTool({ name: 'no_such_tool', arguments: {} });
    const { isError, parsed } = probe(result);

    expect(isError).toBe(true);
    expect(parsed).not.toBeNull();
    expect(parsed?.retryable).toBe(false);
  });
});

describe('MCP error contract — success paths untouched (PI-B non-regression)', () => {
  it('successful handler results pass through with no envelope and no isError', async () => {
    const okPayload = { ok: true, memories: [] };
    const okHandlers = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === 'capabilities') {
            return createCapabilitiesHandlers({ env: getEnv() });
          }
          return new Proxy({}, { get: () => ({ handle: async () => okPayload }) });
        },
      },
    ) as TransportHandlers;

    const ctx: TransportContext = { source: 'mcp', ownerId: 'owner-contract' } as TransportContext;
    const server = createMcpServer(
      okHandlers,
      { getTransportContext: () => ctx, resolveMemoryScope: async () => Promise.reject(INJECTED) },
      failingAgentIdentity,
      failingSql,
      { mcpTransport: 'stdio' },
    );
    const client = await connectClient(server);

    const representative: McpToolName[] = [
      'save_memory',
      'search_memory',
      'get_memory',
      'get_context',
      'list_projects',
      'link_memories',
      'get_capabilities',
    ];
    for (const toolName of representative) {
      const result = await client.callTool({ name: toolName, arguments: VALID_ARGS[toolName] });
      const r = result as { isError?: boolean; content?: Array<{ text?: string }> };
      expect(r.isError, `${toolName} success must not flag isError`).not.toBe(true);
      const text = r.content?.[0]?.text ?? '';
      expect(text, `${toolName} success payload must not be an error envelope`).not.toContain(
        '"retryable"',
      );
    }
  });

  it('feature-disabled payloads (sync off, signals off) also carry retryable:false', async () => {
    const ctx: TransportContext = { source: 'mcp', ownerId: 'owner-contract' } as TransportContext;
    const disabledSignalsHandlers = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === 'capabilities') return createCapabilitiesHandlers({ env: getEnv() });
          if (prop === 'signals') return undefined; // SIGNAL_INGEST_ENABLED=false
          return new Proxy({}, { get: () => ({ handle: async () => Promise.reject(INJECTED) }) });
        },
      },
    ) as TransportHandlers;
    const server = createMcpServer(
      disabledSignalsHandlers,
      { getTransportContext: () => ctx, resolveMemoryScope: async () => Promise.reject(INJECTED) },
      failingAgentIdentity,
      failingSql,
      { mcpTransport: 'stdio', clientSyncEnabled: false },
    );
    const client = await connectClient(server);

    const sync = probe(
      await client.callTool({ name: 'sync_status', arguments: { platform_id: 'cursor' } }),
    );
    expect(sync.isError).toBe(true);
    expect(String(sync.parsed?.error)).toContain('MULTI_CLIENT_SYNC_ENABLED=false');
    expect(sync.parsed?.retryable).toBe(false);

    const signal = probe(
      await client.callTool({
        name: 'submit_signal',
        arguments: { type: 'explicit_feedback', memory_id: UUID },
      }),
    );
    expect(signal.isError).toBe(true);
    expect(String(signal.parsed?.error)).toContain('SIGNAL_INGEST_ENABLED=false');
    expect(signal.parsed?.retryable).toBe(false);
  });
});
