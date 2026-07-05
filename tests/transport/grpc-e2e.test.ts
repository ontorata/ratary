import { describe, it, expect, afterEach, vi } from 'vitest';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  createGrpcE2eHarness,
  grpcServerStream,
  grpcUnary,
  type StreamedContextChunk,
} from '../helpers/grpc-e2e-client.js';
import { GrpcTransportServer } from '../../src/transport/grpc/grpc-server.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('GRPC_ENABLED', 'true');
vi.stubEnv('GRPC_PORT', '0');

const OWNER_ID = 'owner-grpc-e2e';

describe('gRPC E2E client (D105-01)', () => {
  let server: GrpcTransportServer | null = null;
  let clients: ReturnType<typeof createGrpcE2eHarness> | null = null;

  afterEach(async () => {
    clients?.close();
    clients = null;
    if (server) {
      await server.stop();
      server = null;
    }
    resetD1Client();
    resetEnvCache();
  });

  async function startHarness(): Promise<ReturnType<typeof createGrpcE2eHarness>> {
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    server = new GrpcTransportServer();
    await server.start();

    const port = server.health().details?.port;
    expect(typeof port).toBe('number');
    expect(port).toBeGreaterThan(0);

    clients = createGrpcE2eHarness(port as number, OWNER_ID);
    return clients;
  }

  it('HealthService.Check returns SERVING over live client', async () => {
    const grpc = await startHarness();
    const response = await grpcUnary<{ status: string }>(
      grpc.health,
      'Check',
      { service: '' },
      grpc.metadata,
    );
    expect(response.status).toBe('SERVING');
  });

  it('MemoryService CreateMemory → GetMemory round trip', async () => {
    const grpc = await startHarness();

    const created = await grpcUnary<{ id: string; title: string; owner_id: string }>(
      grpc.memory,
      'CreateMemory',
      {
        title: 'gRPC E2E memory',
        content: 'Created via live @grpc/grpc-js client',
        project: 'phase-10-5',
        summary: 'e2e',
        tags: ['grpc', 'e2e'],
        favorite: false,
        category: '',
        memory_type: 'note',
        keywords: [],
        importance: 0,
        language: 'en',
        notes: '',
        level: 'note',
      },
      grpc.metadata,
    );

    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(created.title).toBe('gRPC E2E memory');
    expect(created.owner_id).toBe(OWNER_ID);

    const fetched = await grpcUnary<{ id: string; title: string }>(
      grpc.memory,
      'GetMemory',
      { id: created.id },
      grpc.metadata,
    );
    expect(fetched.id).toBe(created.id);
    expect(fetched.title).toBe('gRPC E2E memory');
  });

  it('SearchService.Search finds memory created over gRPC', async () => {
    const grpc = await startHarness();

    await grpcUnary(
      grpc.memory,
      'CreateMemory',
      {
        title: 'Searchable gRPC item',
        content: 'unique-grpc-e2e-token',
        project: 'phase-10-5',
        summary: '',
        tags: ['grpc-search'],
        favorite: false,
        category: '',
        memory_type: 'note',
        keywords: [],
        importance: 0,
        language: 'en',
        notes: '',
        level: 'note',
      },
      grpc.metadata,
    );

    const search = await grpcUnary<{ results: { title: string }[]; total: number }>(
      grpc.search,
      'Search',
      { q: 'unique-grpc-e2e-token', limit: 10, offset: 0 },
      grpc.metadata,
    );

    expect(search.total).toBeGreaterThanOrEqual(1);
    expect(search.results.some((row) => row.title === 'Searchable gRPC item')).toBe(true);
  });

  it('ContextService BuildContext streams meta and done chunks', async () => {
    const grpc = await startHarness();

    await grpcUnary(
      grpc.memory,
      'CreateMemory',
      {
        title: 'Context stream seed',
        content: 'handoff context for grpc stream',
        project: 'phase-10-5',
        summary: 'seed summary',
        tags: ['context'],
        favorite: false,
        category: '',
        memory_type: 'note',
        keywords: [],
        importance: 0,
        language: 'en',
        notes: '',
        level: 'note',
      },
      grpc.metadata,
    );

    const chunks = await grpcServerStream<StreamedContextChunk>(
      grpc.context,
      'BuildContext',
      { query: 'handoff', limit: 5, max_chars: 4000, summary_only: false },
      grpc.metadata,
    );

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks.map((chunk) => chunk.kind)).toContain('meta');
    expect(chunks.at(-1)?.kind).toBe('done');
  });
});
