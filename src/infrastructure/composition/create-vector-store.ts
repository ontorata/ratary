import type { Env } from '../../config/env.js';
import type { IEmbeddingStore } from '../../embedding/embedding.store.interface.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IVectorStore } from '../../ports/vector/ivector-store.port.js';
import { createPostgresSqlDatabase } from '../sql/postgres-sql-database.adapter.js';
import { D1VectorStoreBridge } from '../vector/d1-vector-store.bridge.js';
import { PgVectorStoreAdapter } from '../vector/pgvector/pgvector-store.adapter.js';

export function createVectorStore(
  env: Env,
  sql: ISqlDatabase,
  embeddingStore: IEmbeddingStore,
): IVectorStore {
  if (env.VECTOR_PROVIDER === 'pgvector') {
    return new PgVectorStoreAdapter(resolvePgVectorDatabase(env, sql));
  }

  if (env.VECTOR_PROVIDER !== 'd1') {
    throw new Error(`VECTOR_PROVIDER=${env.VECTOR_PROVIDER} is not implemented`);
  }

  return new D1VectorStoreBridge(embeddingStore);
}

function resolvePgVectorDatabase(env: Env, sql: ISqlDatabase): ISqlDatabase {
  const dedicatedUrl = env.PGVECTOR_DATABASE_URL;
  if (dedicatedUrl) {
    return createPostgresSqlDatabase(dedicatedUrl);
  }

  if (env.SQL_PROVIDER === 'postgres' || env.SQL_PROVIDER === 'supabase') {
    return sql;
  }

  if (env.DATABASE_URL) {
    return createPostgresSqlDatabase(env.DATABASE_URL);
  }

  throw new Error(
    'PGVECTOR_DATABASE_URL or DATABASE_URL is required when VECTOR_PROVIDER=pgvector and SQL_PROVIDER=d1',
  );
}
