import { parseBackfillArgs } from './lib/backfill-cli.js';
import { backfillD1ToPostgres } from './lib/d1-to-postgres-backfill.js';
import {
  createD1BackfillSource,
  createPostgresBackfillTarget,
  resolvePostgresTargetUrl,
} from './lib/d1-to-postgres-connection.js';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const cli = parseBackfillArgs(argv);
  const targetUrl = resolvePostgresTargetUrl(argv);

  console.log(`D1 → Postgres metadata backfill (${cli.dryRun ? 'dry-run' : 'execute'})...`);

  const source = await createD1BackfillSource();
  const target = await createPostgresBackfillTarget(targetUrl);

  try {
    const result = await backfillD1ToPostgres({
      source,
      target: target.sql,
      ownerId: cli.ownerId,
      batchSize: cli.batchSize,
      dryRun: cli.dryRun,
    });

    for (const table of result.tables) {
      console.log(
        `${table.table}: scanned=${table.scanned} upserted=${table.upserted}${result.dryRun ? ' (dry-run)' : ''}`,
      );
    }

    const totalScanned = result.tables.reduce((sum, row) => sum + row.scanned, 0);
    const totalUpserted = result.tables.reduce((sum, row) => sum + row.upserted, 0);
    console.log(`total: scanned=${totalScanned} upserted=${totalUpserted} dryRun=${result.dryRun}`);
  } finally {
    await target.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('D1 → Postgres backfill failed:', message);
  process.exit(1);
});
