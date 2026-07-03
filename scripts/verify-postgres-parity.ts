import { parseBackfillArgs } from './lib/backfill-cli.js';
import {
  createD1BackfillSource,
  createPostgresBackfillTarget,
  resolvePostgresTargetUrl,
} from './lib/d1-to-postgres-connection.js';
import { verifyPostgresParity } from './lib/postgres-parity.js';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const cli = parseBackfillArgs(argv);
  const targetUrl = resolvePostgresTargetUrl(argv);

  console.log('Verifying D1 ↔ Postgres row-count parity...');

  const source = await createD1BackfillSource();
  const target = await createPostgresBackfillTarget(targetUrl);

  try {
    const result = await verifyPostgresParity({
      source,
      target: target.sql,
      ownerId: cli.ownerId,
    });

    for (const row of result.tables) {
      const status = row.match ? 'OK' : 'MISMATCH';
      console.log(
        `${row.table}: source=${row.sourceCount} target=${row.targetCount} ${status}`,
      );
    }

    if (!result.ok) {
      console.error('Parity check failed — counts differ between D1 and Postgres.');
      process.exit(1);
    }

    console.log('Parity check passed.');
  } finally {
    await target.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Parity verification failed:', message);
  process.exit(1);
});
