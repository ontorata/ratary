import { Meilisearch } from 'meilisearch';
import { getEnv } from '../src/config/env.js';
import { parseBackfillArgs } from './lib/backfill-cli.js';
import { createBackfillSourceSql } from './lib/backfill-sql.js';
import {
  backfillMeilisearch,
  MEILISEARCH_INDEX_SETTINGS,
  type MeilisearchIndexWriter,
} from './lib/meilisearch-backfill.js';

function createMeilisearchWriter(client: Meilisearch): MeilisearchIndexWriter {
  return {
    async ensureIndex(index, dryRun) {
      if (dryRun) {
        return;
      }
      await client.createIndex(index, { primaryKey: 'id' }).catch(() => undefined);
      await client.index(index).updateSettings(MEILISEARCH_INDEX_SETTINGS);
    },
    async upsertDocuments(index, documents) {
      await client.index(index).addDocuments(documents);
    },
  };
}

async function backfillMeilisearchScript(): Promise<void> {
  const cli = parseBackfillArgs(process.argv);
  const env = getEnv();
  console.log(`Meilisearch backfill (${cli.dryRun ? 'dry-run' : 'execute'})...`);

  if (!env.MEILISEARCH_HOST || !env.MEILISEARCH_INDEX) {
    throw new Error('MEILISEARCH_HOST and MEILISEARCH_INDEX are required for Meilisearch backfill');
  }

  const source = await createBackfillSourceSql();
  const client = new Meilisearch({
    host: env.MEILISEARCH_HOST,
    apiKey: env.MEILISEARCH_API_KEY,
  });

  const result = await backfillMeilisearch({
    source,
    writer: createMeilisearchWriter(client),
    index: env.MEILISEARCH_INDEX,
    ownerId: cli.ownerId,
    batchSize: cli.batchSize,
    dryRun: cli.dryRun,
  });

  console.log(`scanned: ${result.scanned}`);
  console.log(`indexed: ${result.indexed}`);
  console.log(`skipped: ${result.skipped}`);
  console.log(`failed: ${result.failed}`);
  console.log(`dryRun: ${result.dryRun}`);
}

backfillMeilisearchScript().catch((error) => {
  console.error('Meilisearch backfill failed:', error);
  process.exit(1);
});
