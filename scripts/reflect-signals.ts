import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { SqlMemorySignalStore } from '../src/infrastructure/signals/sql-memory-signal-store.js';
import { SqlLearningArtifactStore } from '../src/infrastructure/learning/sql-learning-artifact-store.js';
import { DefaultRankingLearningEngine } from '../src/learning/default-ranking-learning-engine.js';
import { SignalReflectionRunner } from '../src/ingest/signal-reflection-runner.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; ownerId?: string } {
  return {
    dryRun: !process.argv.includes('--execute'),
    ownerId: process.argv.find((arg) => arg.startsWith('--owner='))?.split('=')[1],
  };
}

async function reflectSignals(): Promise<void> {
  const { dryRun, ownerId } = parseArgs();
  const env = getEnv();

  console.log(`Signal reflection (${dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  RANKING_ADAPTATION_ENABLED=${env.RANKING_ADAPTATION_ENABLED}`);
  console.log(`  SIGNAL_INGEST_ENABLED=${env.SIGNAL_INGEST_ENABLED}`);
  console.log(`  SIGNAL_STORE_PROVIDER=${env.SIGNAL_STORE_PROVIDER}`);
  console.log(`  LEARNING_STORE_PROVIDER=${env.LEARNING_STORE_PROVIDER}`);

  if (!env.RANKING_ADAPTATION_ENABLED) {
    console.log('Ranking adaptation disabled — no weight changes applied.');
    return;
  }

  if (!env.SIGNAL_INGEST_ENABLED || env.SIGNAL_STORE_PROVIDER !== 'sql') {
    console.log('Signal SQL store required — set SIGNAL_INGEST_ENABLED=true and SIGNAL_STORE_PROVIDER=sql.');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const artifactStore =
    env.LEARNING_STORE_PROVIDER === 'sql' ? new SqlLearningArtifactStore(sql) : undefined;

  if (!dryRun && !artifactStore) {
    console.log('LEARNING_STORE_PROVIDER=sql required to persist ranking snapshots on execute.');
    return;
  }

  const runner = new SignalReflectionRunner(
    new SqlMemorySignalStore(sql),
    new DefaultRankingLearningEngine(),
    artifactStore,
  );

  const owners = ownerId
    ? [{ owner_id: ownerId }]
    : await client.query<{ owner_id: string }>(
        'SELECT DISTINCT owner_id FROM memory_signals WHERE owner_id != ?',
        [''],
      );

  if (owners.length === 0) {
    console.log('No signal owners found.');
    return;
  }

  for (const { owner_id: scopeOwnerId } of owners) {
    const report = await runner.run({ ownerId: scopeOwnerId }, { dryRun });
    console.log(`Owner ${scopeOwnerId}:`);
    console.log(`  signals scanned: ${report.signalsScanned}`);
    console.log(`  feedback events: ${report.feedbackEvents}`);
    if (report.rankingSnapshot) {
      console.log(`  ranking snapshot: ${report.rankingSnapshot.snapshotId}`);
      console.log(
        `  access multiplier: ${report.rankingSnapshot.retrievalWeightMultipliers.accessCountLog ?? 1}`,
      );
    } else {
      console.log('  ranking snapshot: (none — insufficient feedback events)');
    }
  }
}

reflectSignals().catch((error) => {
  console.error('Signal reflection failed:', error);
  process.exit(1);
});
