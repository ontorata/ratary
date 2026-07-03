import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { buildIntelligenceBackfillPatch } from './lib/memory-intelligence-backfill.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

const BATCH_SIZE = 100;

async function backfillMemoryIntelligence(): Promise<void> {
  console.log('Connecting to Cloudflare D1...');
  const client = getD1Client();
  await runMigrations(client);

  const repository = new MemoryRepository(sqlFromD1Client(client));
  const rows = await client.query<{
    id: string;
    owner_id: string;
    title: string;
    summary: string;
    content: string;
    project: string;
    project_id: string;
    semantic_hash: string | null;
  }>(
    `SELECT id, owner_id, title, summary, content, project, project_id, semantic_hash
     FROM memories
     WHERE project_id = '' OR project_id IS NULL OR semantic_hash IS NULL OR semantic_hash = ''
     LIMIT 10000`,
  );

  if (rows.length === 0) {
    console.log('No memories need intelligence backfill.');
    return;
  }

  let updated = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    for (const row of batch) {
      const patch = buildIntelligenceBackfillPatch({
        title: row.title,
        summary: row.summary,
        content: row.content,
        project: row.project,
      });

      await repository.applyMemoryIntelligenceBackfill(row.id, row.owner_id, patch);
      updated++;
    }
    console.log(`Backfilled ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`);
  }

  console.log(`Intelligence backfill complete. Updated ${updated} memories.`);
}

backfillMemoryIntelligence().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
