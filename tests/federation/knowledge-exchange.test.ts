import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  createTestMemoryRepository,
  createTestRelationRepository,
  asSqlDatabase,
} from '../helpers/sql-test-harness.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../../src/services/create-memory-service.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';
import { createFederationPorts } from '../../src/composition/create-federation-ports.js';
import { ForbiddenError } from '../../src/types/errors.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');

const LOCAL_NODE = '11111111-1111-4111-8111-111111111111';
const REMOTE_NODE = '22222222-2222-4222-8222-222222222222';

describe('Federation ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when FEDERATION_ENABLED=false', () => {
    vi.stubEnv('FEDERATION_ENABLED', 'false');
    resetEnvCache();
    const ports = createFederationPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(false);
  });

  it('returns enabled ports when FEDERATION_ENABLED=true', () => {
    vi.stubEnv('FEDERATION_ENABLED', 'true');
    vi.stubEnv('FEDERATION_NODE_ID', LOCAL_NODE);
    vi.stubEnv('FEDERATION_METADATA_PROVIDER', 'none');
    resetEnvCache();
    const ports = createFederationPorts(asSqlDatabase(new MockD1Client()), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.nodeId).toBe(LOCAL_NODE);
  });
});

describe('KnowledgeExchangeService — in-process federation', () => {
  beforeEach(() => {
    resetD1Client();
    vi.stubEnv('FEDERATION_ENABLED', 'true');
    vi.stubEnv('FEDERATION_NODE_ID', LOCAL_NODE);
    vi.stubEnv('FEDERATION_METADATA_PROVIDER', 'none');
    vi.stubEnv(
      'FEDERATION_PEERS_JSON',
      JSON.stringify([
        {
          nodeId: REMOTE_NODE,
          protocolVersion: '1.0.0',
          trusted: false,
        },
      ]),
    );
    resetEnvCache();

    const mockDb = new MockD1Client();
    setD1Client(mockDb);
    const sql = asSqlDatabase(mockDb);
    const repository = createTestMemoryRepository(mockDb);
    const relationRepository = createTestRelationRepository(mockDb);
    const memoryService = createMemoryService(sql, repository);
    createMemoryRelationService(sql, repository, relationRepository);

    const ports = createFederationPorts(sql, getEnv());
    exchange = ports.createService(memoryService);
    scopeResolver = new DefaultScopeResolver(sql);
    ownerId = 'owner-fed';
  });

  afterEach(() => {
    resetD1Client();
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  let exchange: ReturnType<ReturnType<typeof createFederationPorts>['createService']>;
  let scopeResolver: DefaultScopeResolver;
  let ownerId: string;

  it('denies cross-org import without trust link', async () => {
    const scope = await scopeResolver.resolveFromMcp({
      ownerId,
      workspaceId: undefined,
    });
    const orgScope = { ...scope, organizationId: 'org-alpha' };

    await expect(
      exchange.pullAndApply(
        REMOTE_NODE,
        {
          source: { nodeId: REMOTE_NODE, ownerId, organizationId: 'org-beta' },
          target: { nodeId: LOCAL_NODE, ownerId },
        },
        orgScope,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('lists peer when policy allows import (trusted peer)', async () => {
    vi.stubEnv(
      'FEDERATION_PEERS_JSON',
      JSON.stringify([{ nodeId: REMOTE_NODE, protocolVersion: '1.0.0', trusted: true }]),
    );
    resetEnvCache();
    const mockDb = new MockD1Client();
    setD1Client(mockDb);
    const sql = asSqlDatabase(mockDb);
    const repository = createTestMemoryRepository(mockDb);
    const memoryService = createMemoryService(sql, repository);
    const trustedExchange = createFederationPorts(sql, getEnv()).createService(memoryService);
    const scope = await scopeResolver.resolveFromMcp({ ownerId });
    const peers = await trustedExchange.listPeers(scope);
    expect(peers.some((p) => p.nodeId === REMOTE_NODE)).toBe(true);
  });
});
