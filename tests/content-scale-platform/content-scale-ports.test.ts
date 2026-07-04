import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createContentScalePorts } from '../../src/composition/create-content-scale-ports.js';
import { EmbeddingJobRunner } from '../../src/embedding/embedding-job.runner.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { createEmbeddingProvider } from '../../src/embedding/create-embedding-provider.js';
import { InlineObjectStorage } from '../../src/infrastructure/storage/inline-object-storage.adapter.js';

describe('Content scale ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when CONTENT_SCALE_PLATFORM_ENABLED=false', () => {
    vi.stubEnv('CONTENT_SCALE_PLATFORM_ENABLED', 'false');
    resetEnvCache();
    const sql = new MockD1Client();
    const repo = new MemoryRepository(sql);
    const runner = new EmbeddingJobRunner(repo, repo, createEmbeddingProvider(), {
      findByMemoryId: async () => null,
      save: async () => undefined,
    } as never);
    const ports = createContentScalePorts(sql, getEnv(), {
      objectStorage: new InlineObjectStorage(),
      vectorStore: { findByMemoryId: async () => null, upsert: async () => undefined } as never,
      embeddingJobRunner: runner,
    });
    expect(ports.enabled).toBe(false);
  });

  it('returns enabled ports when CONTENT_SCALE_PLATFORM_ENABLED=true', () => {
    vi.stubEnv('CONTENT_SCALE_PLATFORM_ENABLED', 'true');
    vi.stubEnv('OBJECT_STORAGE_PROVIDER', 'r2');
    vi.stubEnv('R2_BUCKET_NAME', 'test-bucket');
    vi.stubEnv('R2_ACCESS_KEY_ID', 'key');
    vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret');
    resetEnvCache();
    const sql = new MockD1Client();
    const repo = new MemoryRepository(sql);
    const runner = new EmbeddingJobRunner(repo, repo, createEmbeddingProvider(), {
      findByMemoryId: async () => null,
      save: async () => undefined,
    } as never);
    const ports = createContentScalePorts(sql, getEnv(), {
      objectStorage: new InlineObjectStorage(),
      vectorStore: { findByMemoryId: async () => null, upsert: async () => undefined } as never,
      embeddingJobRunner: runner,
    });
    expect(ports.enabled).toBe(true);
  });
});
