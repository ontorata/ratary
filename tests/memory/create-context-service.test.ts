import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetEnvCache } from '../../src/config/env.js';
import { createContextService } from '../../src/memory/create-context-service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { D1EmbeddingStore } from '../../src/embedding/d1-embedding.store.js';
import type {
  EmbeddingInput,
  EmbeddingResult,
  IEmbeddingProvider,
} from '../../src/embedding/embedding.provider.interface.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';

const QUERY = 'semantic-anchor';
const QUERY_VECTOR = [1, 0, 0];

class DeterministicEmbeddingProvider implements IEmbeddingProvider {
  readonly modelId = 'test-model';
  readonly dimensions = 3;

  async embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]> {
    return inputs.map((input) => ({
      memoryId: input.memoryId,
      vector: input.text === QUERY ? QUERY_VECTOR : [0.9, 0.1, 0],
      modelId: this.modelId,
      dimensions: this.dimensions,
    }));
  }
}

describe('createContextService', () => {
  const ownerId = 'owner-hybrid';
  let mockDb: MockD1Client;
  let repository: MemoryRepository;
  let embeddingStore: D1EmbeddingStore;
  let provider: DeterministicEmbeddingProvider;

  beforeEach(() => {
    resetEnvCache();
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('HYBRID_RETRIEVAL', 'false');
    vi.stubEnv('GRAPH_RETRIEVAL', 'false');

    mockDb = new MockD1Client();
    repository = new MemoryRepository(mockDb);
    embeddingStore = new D1EmbeddingStore(mockDb);
    provider = new DeterministicEmbeddingProvider();
  });

  afterEach(() => {
    resetEnvCache();
    vi.unstubAllEnvs();
  });

  async function seedVectorOnlyMemory(): Promise<string> {
    const memory = await repository.insert({
      title: 'Obscure notebook',
      project: 'audit',
      content: 'No keyword overlap with the query phrase.',
      summary: 'Unrelated summary',
      tags: ['audit'],
      keywords: ['audit'],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'en',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: 'obscure-notebook',
      favorite: false,
      ownerId,
    });

    await embeddingStore.upsert({
      memoryId: memory.id,
      ownerId,
      modelId: provider.modelId,
      dimensions: provider.dimensions,
      vector: [0.9, 0.1, 0],
      contentHash: 'vector-only-hash',
    });

    return memory.id;
  }

  it('should use SQL-only retrieval when HYBRID_RETRIEVAL is false', async () => {
    await seedVectorOnlyMemory();

    const service = createContextService(repository, provider, embeddingStore);
    const result = await service.buildContext({ ownerId }, { query: QUERY, limit: 5 });

    expect(result.memories).toHaveLength(0);
  });

  it('should merge vector candidates when HYBRID_RETRIEVAL is true', async () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'true');
    resetEnvCache();

    const memoryId = await seedVectorOnlyMemory();
    const service = createContextService(repository, provider, embeddingStore);
    const result = await service.buildContext({ ownerId }, { query: QUERY, limit: 5 });

    expect(result.memories.map((m) => m.id)).toContain(memoryId);
    expect(result.context).toContain('Obscure notebook');
  });

  it('should fall back to SQL-only when hybrid is enabled but embedding deps are omitted', async () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'true');
    resetEnvCache();

    await repository.insert({
      title: 'SQL match semantic-anchor',
      project: 'audit',
      content: 'Keyword appears in title for lexical retrieval.',
      summary: 'summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'en',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: 'sql-match',
      favorite: false,
      ownerId,
    });

    const service = createContextService(repository);
    const result = await service.buildContext({ ownerId }, { query: QUERY, limit: 5 });

    expect(result.memories.length).toBeGreaterThan(0);
    expect(result.context).toContain('SQL match semantic-anchor');
  });

  it('should surface graph neighbors when GRAPH_RETRIEVAL is true', async () => {
    vi.stubEnv('GRAPH_RETRIEVAL', 'true');
    resetEnvCache();

    const seed = await repository.insert({
      title: 'JWT refresh flow',
      project: 'auth',
      content: 'Details about JWT refresh token rotation.',
      summary: 'jwt refresh',
      tags: ['auth'],
      keywords: ['jwt', 'refresh'],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'en',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: 'jwt-refresh-flow',
      favorite: false,
      ownerId,
    });

    const neighbor = await repository.insert({
      title: 'Auth architecture overview',
      project: 'auth',
      content: 'High-level authentication system design without jwt keywords.',
      summary: 'architecture',
      tags: ['auth'],
      keywords: ['architecture'],
      category: '',
      memoryType: 'note',
      importance: 70,
      language: 'en',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: 'auth-architecture',
      favorite: false,
      ownerId,
    });

    const relationRepository = new MemoryRelationRepository(mockDb);
    await relationRepository.insert({
      sourceMemoryId: seed.id,
      targetMemoryId: neighbor.id,
      relation: 'depends_on',
      ownerId,
    });

    const service = createContextService(repository, provider, embeddingStore, mockDb);
    const result = await service.buildContext({ ownerId }, { query: 'JWT refresh', limit: 10 });

    expect(result.memories.map((memory) => memory.id)).toContain(neighbor.id);
    expect(result.context).toContain('Auth architecture overview');
  });

  it('should fall back to SQL-only when graph is enabled but db is omitted', async () => {
    vi.stubEnv('GRAPH_RETRIEVAL', 'true');
    resetEnvCache();

    await repository.insert({
      title: 'Graph keyword anchor',
      project: 'audit',
      content: 'Lexical match only without relations.',
      summary: 'summary',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'en',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: 'graph-keyword',
      favorite: false,
      ownerId,
    });

    const service = createContextService(repository);
    const result = await service.buildContext(
      { ownerId },
      { query: 'Graph keyword anchor', limit: 5 },
    );

    expect(result.memories.length).toBeGreaterThan(0);
  });
});
