import { describe, expect, it } from 'vitest';
import { createVectorStore } from '../../src/infrastructure/composition/create-vector-store.js';
import { D1VectorStoreBridge } from '../../src/infrastructure/vector/d1-vector-store.bridge.js';
import { PgVectorStoreAdapter } from '../../src/infrastructure/vector/pgvector/pgvector-store.adapter.js';
import type { IEmbeddingStore } from '../../src/embedding/embedding.store.interface.js';
import type { ISqlDatabase } from '../../src/ports/sql/isql-database.port.js';
import type { Env } from '../../src/config/env.js';

const stubEmbeddingStore = {} as IEmbeddingStore;
const stubSql = {} as ISqlDatabase;

function baseEnv(overrides: Partial<Env>): Env {
  return {
    SQL_PROVIDER: 'd1',
    VECTOR_PROVIDER: 'd1',
    ...overrides,
  } as Env;
}

describe('createVectorStore', () => {
  it('should return D1VectorStoreBridge by default', () => {
    const store = createVectorStore(baseEnv({}), stubSql, stubEmbeddingStore);
    expect(store).toBeInstanceOf(D1VectorStoreBridge);
  });

  it('should return PgVectorStoreAdapter when VECTOR_PROVIDER=pgvector with shared postgres sql', () => {
    const sql = stubSql;
    const store = createVectorStore(
      baseEnv({
        VECTOR_PROVIDER: 'pgvector',
        SQL_PROVIDER: 'postgres',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/brain',
      }),
      sql,
      stubEmbeddingStore,
    );
    expect(store).toBeInstanceOf(PgVectorStoreAdapter);
  });

  it('should throw for unknown VECTOR_PROVIDER', () => {
    expect(() =>
      createVectorStore(
        baseEnv({ VECTOR_PROVIDER: 'pinecone' as Env['VECTOR_PROVIDER'] }),
        stubSql,
        stubEmbeddingStore,
      ),
    ).toThrow(/not implemented/);
  });

  it('should throw when pgvector selected without database url and SQL_PROVIDER=d1', () => {
    expect(() =>
      createVectorStore(
        baseEnv({ VECTOR_PROVIDER: 'pgvector', SQL_PROVIDER: 'd1' }),
        stubSql,
        stubEmbeddingStore,
      ),
    ).toThrow(/PGVECTOR_DATABASE_URL or DATABASE_URL/);
  });
});
