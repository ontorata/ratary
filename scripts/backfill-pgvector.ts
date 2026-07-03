import { getEnv } from '../src/config/env.js';
import { createVectorStore } from '../src/infrastructure/composition/create-vector-store.js';
import { createPostgresSqlDatabase } from '../src/infrastructure/sql/postgres-sql-database.adapter.js';
import { D1EmbeddingStore } from '../src/embedding/d1-embedding.store.js';
import { parseBackfillArgs } from './lib/backfill-cli.js';
import { createBackfillSourceSql } from './lib/backfill-sql.js';
import { backfillPgvector, ensurePgvectorSchema } from './lib/pgvector-backfill.js';

async function backfillPgvectorScript(): Promise<void> {
  const cli = parseBackfillArgs(process.argv);
  const env = getEnv();
  console.log(`pgvector backfill (${cli.dryRun ? 'dry-run' : 'execute'})...`);

  const pgUrl = env.PGVECTOR_DATABASE_URL ?? env.DATABASE_URL;
  if (!pgUrl) {
    throw new Error('PGVECTOR_DATABASE_URL or DATABASE_URL is required for pgvector backfill');
  }

  const source = await createBackfillSourceSql();
  const target = createPostgresSqlDatabase(pgUrl);
  const embeddingStore = new D1EmbeddingStore(source);
  const vectorStore = createVectorStore({ ...env, VECTOR_PROVIDER: 'pgvector' }, target, embeddingStore);

  const result = await backfillPgvector({
    source,
    vectorStore,
    target,
    ensureSchema: ensurePgvectorSchema,
    ownerId: cli.ownerId,
    batchSize: cli.batchSize,
    dryRun: cli.dryRun,
  });

  console.log(`scanned: ${result.scanned}`);
  console.log(`upserted: ${result.upserted}`);
  console.log(`skipped: ${result.skipped}`);
  console.log(`failed: ${result.failed}`);
  console.log(`dryRun: ${result.dryRun}`);
}

backfillPgvectorScript().catch((error) => {
  console.error('pgvector backfill failed:', error);
  process.exit(1);
});
