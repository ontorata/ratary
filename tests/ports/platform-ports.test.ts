import { describe, it, expect } from 'vitest';
import type {
  IAnalyticsStore,
  ICache,
  IEventBus,
  IObjectStorage,
  ISqlDatabase,
  IVectorStore,
  SqlExecuteResult,
} from '../../src/ports/index.js';
import type { IRelationRepository } from '../../src/ports/relation/irelation-repository.port.js';
import type { IGraphStore } from '../../src/ports/graph/igraph-store.port.js';
import type { IEmbeddingProvider } from '../../src/ports/embedding/iembedding-provider.port.js';
import type { IMemoryRepository } from '../../src/ports/memory/imemory-repository.port.js';
import type { RelationType } from '../../src/types/knowledge.js';
import {
  DEFAULT_GRAPH_MAX_DEPTH,
  DEFAULT_GRAPH_MAX_NEIGHBORS,
} from '../../src/graph/graph.config.js';

class MockSqlDatabase implements ISqlDatabase {
  async query<T>(): Promise<T[]> {
    return [];
  }

  async execute(): Promise<SqlExecuteResult> {
    return { results: [], meta: { changes: 0 } };
  }
}

class MockVectorStore implements IVectorStore {
  async upsert(): Promise<string> {
    return 'vec-1';
  }

  async deleteByMemoryId(): Promise<void> {}

  async deleteAllInScope(): Promise<void> {}

  async findByMemoryId(): Promise<null> {
    return null;
  }

  async searchSimilar(): Promise<[]> {
    return [];
  }
}

class MockObjectStorage implements IObjectStorage {
  async put(): Promise<void> {}

  async get(): Promise<null> {
    return null;
  }

  async delete(): Promise<void> {}

  async exists(): Promise<boolean> {
    return false;
  }
}

class MockCache implements ICache {
  private readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T | undefined) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}

class MockEventBus implements IEventBus {
  async publish(): Promise<void> {}

  async subscribe(): Promise<{ unsubscribe: () => Promise<void> }> {
    return { unsubscribe: async () => {} };
  }
}

class MockAnalyticsStore implements IAnalyticsStore {
  async insert(): Promise<void> {}

  async query(): Promise<[]> {
    return [];
  }
}

class MockEmbeddingProvider implements IEmbeddingProvider {
  readonly modelId = 'mock';
  readonly dimensions = 3;

  async embed(inputs: { memoryId: string; text: string }[]) {
    return inputs.map((input) => ({
      memoryId: input.memoryId,
      vector: [0, 0, 1],
      modelId: this.modelId,
      dimensions: this.dimensions,
    }));
  }
}

class MockGraphStore implements IGraphStore {
  async traverseNeighbors() {
    return [];
  }

  getCapabilities() {
    return {
      supportsTraversal: true as const,
      supportsBFS: true as const,
      supportsBidirectional: true as const,
      maxTraversalDepth: DEFAULT_GRAPH_MAX_DEPTH,
      maxNeighborsPerRequest: DEFAULT_GRAPH_MAX_NEIGHBORS,
    };
  }
}

class MockRelationRepository implements IRelationRepository {
  async insert() {
    throw new Error('not implemented');
  }

  async findById() {
    return null;
  }

  async findByMemoryId() {
    return [];
  }

  async exists() {
    return false;
  }

  async delete() {
    return false;
  }

  async createFromInput(
    sourceMemoryId: string,
    ownerId: string,
    input: { targetMemoryId: string; relation: RelationType },
  ) {
    return {
      id: 'rel-1',
      sourceMemoryId,
      targetMemoryId: input.targetMemoryId,
      relation: input.relation,
      ownerId,
      weight: 1,
      confidence: 1,
      createdBy: null,
      sourceType: 'manual' as const,
      metadata: {},
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
  }
}

describe('Platform ports (Phase 9.5)', () => {
  it('should allow mock ISqlDatabase', async () => {
    const db = new MockSqlDatabase();
    await expect(db.query('SELECT 1')).resolves.toEqual([]);
  });

  it('should allow mock IVectorStore', async () => {
    const store = new MockVectorStore();
    const id = await store.upsert({
      memoryId: 'm1',
      scope: { ownerId: 'o1' },
      modelId: 'mock',
      dimensions: 3,
      vector: [0, 1, 0],
      contentHash: 'abc',
    });
    expect(id).toBe('vec-1');
  });

  it('should allow mock IObjectStorage', async () => {
    const storage = new MockObjectStorage();
    await expect(storage.exists({ segments: ['org', 'ws', 'm1'] })).resolves.toBe(false);
  });

  it('should allow mock ICache round-trip', async () => {
    const cache = new MockCache();
    await cache.set('k', { ok: true });
    await expect(cache.get<{ ok: boolean }>('k')).resolves.toEqual({ ok: true });
  });

  it('should allow mock IEventBus subscribe lifecycle', async () => {
    const bus = new MockEventBus();
    const sub = await bus.subscribe('memory.created', async () => {});
    await expect(sub.unsubscribe()).resolves.toBeUndefined();
  });

  it('should allow mock IAnalyticsStore', async () => {
    const analytics = new MockAnalyticsStore();
    await expect(analytics.query({ name: 'daily_access' })).resolves.toEqual([]);
  });

  it('should re-export IMemoryRepository as a structural port', () => {
    const repo = {} as IMemoryRepository;
    expect(repo).toBeDefined();
  });

  it('should re-export IRelationRepository as a structural port', () => {
    const repo = new MockRelationRepository();
    expect(repo).toBeInstanceOf(MockRelationRepository);
  });

  it('should re-export IEmbeddingProvider as a structural port', async () => {
    const provider = new MockEmbeddingProvider();
    const [result] = await provider.embed([{ memoryId: 'm1', text: 'hello' }]);
    expect(result?.dimensions).toBe(3);
  });

  it('should alias IGraphStore from IGraphProvider contract', async () => {
    const graph = new MockGraphStore();
    expect(graph.getCapabilities().supportsBFS).toBe(true);
  });
});
