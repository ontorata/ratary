import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createLearningPorts } from '../src/composition/create-learning-ports.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; ownerId?: string } {
  const dryRun = !process.argv.includes('--execute');
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  const ownerId = ownerArg?.split('=')[1];
  return { dryRun, ownerId };
}

async function runLearning(): Promise<void> {
  const { dryRun, ownerId } = parseArgs();
  const env = getEnv();

  console.log(`Learning intelligence (${dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  LEARNING_ENGINE_ENABLED=${env.LEARNING_ENGINE_ENABLED}`);
  console.log(`  LEARNING_STORE_PROVIDER=${env.LEARNING_STORE_PROVIDER}`);

  if (!env.LEARNING_ENGINE_ENABLED) {
    console.log('Learning engine disabled — enable LEARNING_ENGINE_ENABLED=true to run.');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const { orchestrator } = createLearningPorts(sql, env);

  const owners = ownerId
    ? [{ owner_id: ownerId }]
    : await client.query<{ owner_id: string }>(
        'SELECT DISTINCT owner_id FROM memories WHERE owner_id != ?',
        [''],
      );

  if (owners.length === 0) {
    console.log('No owners found.');
    return;
  }

  for (const { owner_id: scopeOwnerId } of owners) {
    const report = await orchestrator.run({ ownerId: scopeOwnerId }, { dryRun });
    console.log(`Owner ${scopeOwnerId}:`);
    console.log(`  events processed: ${report.eventsProcessed}`);
    console.log(
      `  helpful / not helpful: ${report.analytics.helpfulFeedbackCount} / ${report.analytics.notHelpfulFeedbackCount}`,
    );
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

runLearning().catch((error) => {
  console.error('Learning run failed:', error);
  process.exit(1);
});
