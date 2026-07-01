import { getD1Client } from '../src/db/index.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { KnowledgeService } from '../src/knowledge/knowledge.service.js';
import { runMigrations } from '../src/db/migrations.js';

const BATCH_SIZE = 100;

async function backfillKnowledge(): Promise<void> {
  console.log('Connecting to Cloudflare D1...');
  const client = getD1Client();
  await runMigrations(client);

  const repository = new MemoryRepository(client);
  const knowledge = new KnowledgeService(repository);

  const rows = await client.query<{ owner_id: string }>(
    `SELECT DISTINCT owner_id FROM memories WHERE codename IS NULL OR codename = ''`,
  );

  const ownerIds = [...new Set(rows.map((r) => r.owner_id))];
  if (ownerIds.length === 0) {
    console.log('No memories need backfill.');
    return;
  }

  let updated = 0;

  for (const ownerId of ownerIds) {
    let batch = await repository.findWithoutCodename(ownerId, BATCH_SIZE);

    while (batch.length > 0) {
      for (const memory of batch) {
        const enriched = await knowledge.enrichForCreate(ownerId, {
          title: memory.title,
          project: memory.project,
          content: memory.content,
          summary: memory.summary || undefined,
          tags: memory.tags,
        });

        await repository.applyKnowledgeBackfill(memory.id, ownerId, {
          codename: enriched.codename,
          slug: enriched.slug,
          summary: memory.summary || enriched.summary,
          keywords: enriched.keywords,
          category: enriched.category,
          memoryType: enriched.memoryType,
          importance: enriched.importance,
          language: enriched.language,
          notes: enriched.notes,
        });

        updated++;
      }

      batch = await repository.findWithoutCodename(ownerId, BATCH_SIZE);
    }
  }

  console.log(`Backfill complete. Updated ${updated} memories.`);
}

backfillKnowledge().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
