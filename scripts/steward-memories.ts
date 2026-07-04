import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createMemoryStewardshipPorts } from '../src/composition/create-memory-stewardship-ports.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; projectId?: string } {
  const dryRun = !process.argv.includes('--execute');
  const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
  const projectId = projectArg?.split('=')[1];
  return { dryRun, projectId };
}

async function stewardMemories(): Promise<void> {
  const { dryRun, projectId } = parseArgs();
  console.log(`Memory stewardship (${dryRun ? 'dry-run' : 'execute'})...`);

  const env = getEnv();
  if (!env.MEMORY_STEWARDSHIP_ENABLED) {
    console.log('Note: MEMORY_STEWARDSHIP_ENABLED=false — running as manual operator action.');
  }
  if (env.MEMORY_STEWARDSHIP_SCHEDULER === 'local') {
    console.log('Note: MEMORY_STEWARDSHIP_SCHEDULER=local — using scheduler.enqueue per owner.');
  }

  const client = getD1Client();
  await runMigrations(client);

  const sql = sqlFromD1Client(client);
  const { orchestrator, scheduler, runStore } = createMemoryStewardshipPorts(sql, env);

  const owners = await client.query<{ owner_id: string }>(
    'SELECT DISTINCT owner_id FROM memories WHERE owner_id != ?',
    [''],
  );

  if (owners.length === 0) {
    console.log('No memories found.');
    return;
  }

  for (const { owner_id: ownerId } of owners) {
    const scope = { ownerId };
    const options = { dryRun, projectId };

    let report;
    if (scheduler) {
      await scheduler.enqueue(scope, options);
      report = await runStore.latest(ownerId);
      if (!report) {
        console.log(`Owner ${ownerId}: no run report persisted.`);
        continue;
      }
    } else {
      report = await orchestrator.run(scope, options);
    }

    console.log(`\nOwner ${ownerId} — run ${report.runId} (${report.durationMs}ms):`);
    for (const task of report.tasks) {
      const flag = task.status === 'error' ? '✗' : task.status === 'skipped' ? '–' : '✓';
      console.log(`  ${flag} [${task.stage}] ${task.taskId}: ${task.findings.join('; ')}`);
    }
    console.log(
      `  total scanned: ${report.totalScanned}, changed: ${report.totalChanged}, errors: ${report.hadErrors}`,
    );
  }
}

stewardMemories().catch((error) => {
  console.error('Stewardship failed:', error);
  process.exit(1);
});
