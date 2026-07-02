import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/env.js';
import { createEmbeddingProvider } from '../src/embedding/create-embedding-provider.js';
import { D1EmbeddingStore } from '../src/embedding/d1-embedding.store.js';
import { EmbeddingJobRunner } from '../src/embedding/embedding-job.runner.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { parseEmbeddingBackfillArgs } from './lib/embedding-backfill.js';

async function backfillEmbeddings(): Promise<void> {
  const cli = parseEmbeddingBackfillArgs(process.argv);
  const env = getEnv();
  console.log(
    `Embedding backfill (${cli.dryRun ? 'dry-run' : 'execute'}) via ${env.EMBEDDING_PROVIDER}...`,
  );

  const client = getD1Client();
  await runMigrations(client);

  const repository = new MemoryRepository(client);
  const store = new D1EmbeddingStore(client);
  const provider = createEmbeddingProvider();
  const runner = new EmbeddingJobRunner(repository, repository, provider, store);

  const ownerRows = cli.ownerId
    ? [{ owner_id: cli.ownerId }]
    : await client.query<{ owner_id: string }>(
        `SELECT DISTINCT owner_id FROM memories WHERE owner_id != ?`,
        [''],
      );

  if (ownerRows.length === 0) {
    console.log('No memories found.');
    return;
  }

  const batchSize = cli.batchSize ?? env.EMBEDDING_BATCH_SIZE;

  for (const { owner_id: ownerId } of ownerRows) {
    const report = await runner.run({
      ownerId,
      projectId: cli.projectId,
      batchSize,
      dryRun: cli.dryRun,
      forceReembed: cli.forceReembed,
    });

    console.log(`Owner ${ownerId}:`);
    console.log(`  scanned: ${report.scanned}`);
    console.log(`  embedded: ${report.embedded}`);
    console.log(`  skipped: ${report.skipped}`);
    console.log(`  failed: ${report.failed}`);
    console.log(`  dryRun: ${report.dryRun}`);
  }
}

backfillEmbeddings().catch((error) => {
  console.error('Embedding backfill failed:', error);
  process.exit(1);
});
