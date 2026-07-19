/**
 * PI-C owner gate (ADR-067) — transport-level contract for idempotent writes.
 *
 * Drives the REAL createMcpServer over the SDK's in-memory transport against a
 * REAL (in-memory SQLite) schema and asserts the locked Definition of Done:
 *
 *   (a) save_memory with the same request_id twice ⇒ exactly one memories row;
 *       the second response replays the original with duplicate+replayed.
 *   (b) non-regression: without request_id, two identical saves still create
 *       two rows and the response carries NO replay flags (pre-PI-C contract).
 *   (c) crash-after-claim (owner DoD): a seeded intent without its memory is
 *       recovered by the retry — one memories row, one intent row, identical
 *       replays afterwards.
 *   (d) concurrent same-key calls resolve to one row without a client error.
 *   (e) cross-transport consistency: the REST/gRPC shared handler returns the
 *       same replay semantics as MCP.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../../src/transport/mcp/mcp-server.js';
import type { McpContextBinding } from '../../src/transport/mcp/mcp-server.js';
import {
  createCapabilitiesHandlers,
  createMemoryHandlers,
} from '../../src/transport/shared/handlers/create-transport-handlers.js';
import type { TransportHandlers } from '../../src/transport/shared/handlers/create-transport-handlers.js';
import type { TransportContext } from '../../src/transport/shared/transport-context.types.js';
import type { IScopeResolver } from '../../src/scope/iscope-resolver.interface.js';
import type { IAgentIdentity } from '../../src/agent/iagent-identity.interface.js';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { createMemoryService } from '../../src/services/create-memory-service.js';
import { SqlWriteIntentStore } from '../../src/infrastructure/write-intents/sql-write-intent-store.js';
import { getEnv } from '../../src/config/index.js';

const OWNER = 'owner-pi-c-contract';

function mcpCtx(): TransportContext {
  return { requestId: 'test', ownerId: OWNER, auth: null, source: 'mcp' } as TransportContext;
}

function restCtx(): TransportContext {
  return { requestId: 'test-rest', ownerId: OWNER, auth: null, source: 'rest' } as TransportContext;
}

// Owner-only contexts never reach the resolver (resolve-transport-scope).
const unusedScopeResolver = new Proxy(
  {},
  {
    get: () => async () => {
      throw new Error('scope resolver must not be called for owner-only contexts');
    },
  },
) as IScopeResolver;

const idleAgentIdentity = new Proxy(
  {},
  { get: () => async () => null },
) as unknown as IAgentIdentity;

interface SavedMemory {
  id?: string;
  duplicate?: boolean;
  replayed?: boolean;
}

function parseResult(result: unknown): SavedMemory {
  const r = result as { content?: Array<{ text?: string }>; isError?: boolean };
  expect(r.isError ?? false).toBe(false);
  return JSON.parse(r.content?.[0]?.text ?? '{}') as SavedMemory;
}

describe('idempotent write contract — MCP transport (PI-C owner gate)', () => {
  let db: SqliteMemoryDatabase;
  let client: Client;
  let handlers: TransportHandlers;
  let intents: SqlWriteIntentStore;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    const memoryService = createMemoryService(db);
    intents = new SqlWriteIntentStore(db);

    const memoryHandlers = createMemoryHandlers({
      memoryService,
      scopeResolver: unusedScopeResolver,
    });
    const capabilitiesHandlers = createCapabilitiesHandlers({ env: getEnv() });
    handlers = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === 'memory') return memoryHandlers;
          if (prop === 'capabilities') return capabilitiesHandlers;
          return new Proxy({}, { get: () => ({ handle: async () => ({}) }) });
        },
      },
    ) as TransportHandlers;

    const binding: McpContextBinding = {
      getTransportContext: mcpCtx,
      resolveMemoryScope: async () => ({ ownerId: OWNER }),
    };

    const server = createMcpServer(handlers, binding, idleAgentIdentity, db, {
      mcpTransport: 'stdio',
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'pi-c-contract', version: '0.0.1' });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  async function countMemories(): Promise<number> {
    const rows = await db.query<{ n: number }>(
      'SELECT COUNT(*) as n FROM memories WHERE owner_id = ?',
      [OWNER],
    );
    return rows[0]?.n ?? 0;
  }

  async function saveMemory(args: Record<string, unknown>): Promise<SavedMemory> {
    const result = await client.callTool({ name: 'save_memory', arguments: args });
    return parseResult(result);
  }

  it('(a) same request_id twice ⇒ one row; second response carries duplicate+replayed', async () => {
    const requestId = 'aaaaaaaa-1111-4000-8000-000000000001';
    const args = { title: 'Contract A', content: 'body A', request_id: requestId };

    const before = await countMemories();
    const first = await saveMemory(args);
    const second = await saveMemory(args);

    expect(first.duplicate).toBeUndefined();
    expect(first.replayed).toBeUndefined();
    expect(second.duplicate).toBe(true);
    expect(second.replayed).toBe(true);
    expect(second.id).toBe(first.id);
    expect(await countMemories()).toBe(before + 1);
  });

  it('(b) non-regression: without request_id two identical saves create two rows, no flags', async () => {
    const args = { title: 'Contract B', content: 'body B' };

    const before = await countMemories();
    const first = await saveMemory(args);
    const second = await saveMemory(args);

    expect(first.duplicate).toBeUndefined();
    expect(second.duplicate).toBeUndefined();
    expect(second.replayed).toBeUndefined();
    expect(second.id).not.toBe(first.id);
    expect(await countMemories()).toBe(before + 2);
  });

  it('(c) crash-after-claim recovers with the canonical id and replays identically (owner DoD)', async () => {
    const requestId = 'cccccccc-3333-4000-8000-000000000003';
    const canonicalId = 'cccccccc-3333-4000-8000-00000000c001';
    await intents.claim({
      ownerId: OWNER,
      requestId,
      operation: 'create',
      resourceType: 'memory',
      resourceId: canonicalId,
    });

    const before = await countMemories();
    const args = { title: 'Contract C', content: 'body C', request_id: requestId };

    const recovered = await saveMemory(args);
    expect(recovered.id).toBe(canonicalId);
    expect(recovered.replayed).toBe(true);
    expect(await countMemories()).toBe(before + 1);

    // Exactly one intent row for the request, and further retries replay.
    const intentRows = await db.query<{ n: number }>(
      'SELECT COUNT(*) as n FROM memory_write_intents WHERE owner_id = ? AND request_id = ?',
      [OWNER, requestId],
    );
    expect(intentRows[0]?.n).toBe(1);

    const replay = await saveMemory(args);
    expect(replay.id).toBe(canonicalId);
    expect(replay.duplicate).toBe(true);
    expect(replay.replayed).toBe(true);
    expect(await countMemories()).toBe(before + 1);
  });

  it('(d) concurrent same-key saves resolve to one row without a client-facing error', async () => {
    const requestId = 'dddddddd-4444-4000-8000-000000000004';
    const args = { title: 'Contract D', content: 'body D', request_id: requestId };

    const before = await countMemories();
    const outcomes = await Promise.all([saveMemory(args), saveMemory(args), saveMemory(args)]);

    const ids = new Set(outcomes.map((o) => o.id));
    expect(ids.size).toBe(1);
    expect(await countMemories()).toBe(before + 1);
  });

  it('(e) cross-transport consistency: the shared REST/gRPC handler speaks the same replay contract', async () => {
    const requestId = 'eeeeeeee-5555-4000-8000-000000000005';
    const body = {
      title: 'Contract E',
      project: '',
      content: 'body E',
      summary: '',
      tags: [],
      favorite: false,
      request_id: requestId,
    };

    // First create over MCP, replay over the REST-shaped shared handler.
    const first = await saveMemory({ title: 'Contract E', content: 'body E', request_id: requestId });
    const replayed = await handlers.memory.create.handle(restCtx(), body as never);

    expect(replayed.id).toBe(first.id);
    expect(replayed.duplicate).toBe(true);
    expect(replayed.replayed).toBe(true);
  });
});
