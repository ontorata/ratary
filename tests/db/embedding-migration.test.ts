import { describe, it, expect } from 'vitest';
import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import { migrateEmbeddingPhase1 } from '../../src/db/migrations.js';
import { MockD1Client } from '../helpers/mock-d1.js';

class RecordingD1Client implements D1Client {
  readonly statements: string[] = [];

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.execute(sql, params);
    return [] as T[];
  }

  async execute(sql: string, _params: unknown[] = []): Promise<D1QueryResult> {
    this.statements.push(sql.trim());
    return { results: [], success: true, meta: { changes: 0 } };
  }
}

describe('migrateEmbeddingPhase1', () => {
  it('should create memory_embeddings table and indexes', async () => {
    const client = new RecordingD1Client();

    await migrateEmbeddingPhase1(client);

    const sql = client.statements.join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS memory_embeddings');
    expect(sql).toContain('vector_json TEXT NOT NULL');
    expect(sql).toContain('content_hash TEXT NOT NULL');
    expect(sql).toContain('idx_memory_embeddings_owner_memory');
    expect(sql).toContain('idx_memory_embeddings_memory_model');
    expect(client.statements).toHaveLength(3);
  });

  it('should be idempotent when run twice', async () => {
    const client = new RecordingD1Client();

    await migrateEmbeddingPhase1(client);
    await migrateEmbeddingPhase1(client);

    expect(client.statements).toHaveLength(6);
    expect(client.statements[0]).toBe(client.statements[3]);
    expect(client.statements[1]).toBe(client.statements[4]);
    expect(client.statements[2]).toBe(client.statements[5]);
  });

  it('should not throw on MockD1Client', async () => {
    const mock = new MockD1Client();
    await expect(migrateEmbeddingPhase1(mock)).resolves.toBeUndefined();
  });
});
