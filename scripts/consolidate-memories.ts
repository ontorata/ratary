import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../src/repositories/memory-relation.repository.js';
import { MemoryConsolidator } from '../src/memory/consolidator.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; projectId?: string } {
  const dryRun = !process.argv.includes('--execute');
  const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
  const projectId = projectArg?.split('=')[1];
  return { dryRun, projectId };
}

async function consolidateMemories(): Promise<void> {
  const { dryRun, projectId } = parseArgs();
  console.log(`Memory consolidation (${dryRun ? 'dry-run' : 'execute'})...`);

  const client = getD1Client();
  await runMigrations(client);

  const sql = sqlFromD1Client(client);
  const repository = new MemoryRepository(sql);
  const relationRepository = new MemoryRelationRepository(sql);
  const consolidator = new MemoryConsolidator(repository, relationRepository);

  const owners = await client.query<{ owner_id: string }>(
    'SELECT DISTINCT owner_id FROM memories WHERE owner_id != ?',
    [''],
  );

  if (owners.length === 0) {
    console.log('No memories found.');
    return;
  }

  for (const { owner_id: ownerId } of owners) {
    const report = await consolidator.run(
      { ownerId },
      { dryRun, projectId, generateSummary: !dryRun },
    );

    console.log(`Owner ${ownerId}:`);
    console.log(`  duplicates found: ${report.duplicatesFound}`);
    console.log(`  duplicates archived: ${report.duplicatesArchived}`);
    console.log(`  stale promoted: ${report.stalePromoted}`);
    console.log(`  summaries created: ${report.summariesCreated}`);
    console.log(`  relations created: ${report.relationsCreated}`);
    console.log(`  actions: ${report.actions.length}`);
  }
}

consolidateMemories().catch((error) => {
  console.error('Consolidation failed:', error);
  process.exit(1);
});
