import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createEntityResolutionPorts } from '../src/composition/create-entity-resolution-ports.js';
import { EntityResolutionTask } from '../src/memory/stewardship/tasks/entity-resolution.task.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; ownerId?: string; projectId?: string } {
  const dryRun = !process.argv.includes('--execute');
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
  return {
    dryRun,
    ownerId: ownerArg?.split('=')[1],
    projectId: projectArg?.split('=')[1],
  };
}

async function resolveEntities(): Promise<void> {
  const { dryRun, ownerId, projectId } = parseArgs();
  const env = getEnv();

  console.log(`Entity resolution (${dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  ENTITY_RESOLUTION_ENABLED=${env.ENTITY_RESOLUTION_ENABLED}`);
  console.log(`  ENTITY_STORE_PROVIDER=${env.ENTITY_STORE_PROVIDER}`);

  if (!env.ENTITY_RESOLUTION_ENABLED) {
    console.log('Entity resolution disabled — enable ENTITY_RESOLUTION_ENABLED=true to run.');
    return;
  }

  const client = getD1Client();
  await runMigrations(client);
  const sql = sqlFromD1Client(client);
  const ports = createEntityResolutionPorts(sql, env);
  const task = new EntityResolutionTask(new MemoryRepository(sql), ports);

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
    const result = await task.run({
      scope: { ownerId: scopeOwnerId },
      dryRun,
      projectId,
      now: new Date(),
    });
    console.log(`Owner ${scopeOwnerId}:`);
    console.log(`  status: ${result.status}`);
    console.log(`  scanned: ${result.scanned}, changed: ${result.changed}`);
    for (const finding of result.findings) {
      console.log(`  ${finding}`);
    }
  }
}

resolveEntities().catch((error) => {
  console.error('Entity resolution failed:', error);
  process.exit(1);
});
