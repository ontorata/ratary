import { getD1Client } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrations.js';
import { getEnv } from '../src/config/index.js';
import { createCompressionSummarizer } from '../src/composition/create-compression-summarizer.js';
import { SummaryEnrichmentRunner } from '../src/jobs/summary-enrichment-runner.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';
import { sqlFromD1Client } from './lib/sql-from-d1-client.js';

function parseArgs(): { dryRun: boolean; projectId?: string; ownerId?: string; limit?: number } {
  const dryRun = !process.argv.includes('--execute');
  const projectArg = process.argv.find((arg) => arg.startsWith('--project='));
  const ownerArg = process.argv.find((arg) => arg.startsWith('--owner='));
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  return {
    dryRun,
    projectId: projectArg?.split('=')[1],
    ownerId: ownerArg?.split('=')[1],
    limit: limitArg ? Number(limitArg.split('=')[1]) : undefined,
  };
}

async function enrichSummaries(): Promise<void> {
  const { dryRun, projectId, ownerId, limit } = parseArgs();
  const env = getEnv();
  const summarizer = createCompressionSummarizer(env);

  console.log(
    `Summary enrichment (${dryRun ? 'dry-run' : 'execute'}) — algorithm: ${summarizer.algorithmId}`,
  );

  if (env.COMPRESSION_POLICY === 'llm' && summarizer.algorithmId === 'rule_v1') {
    console.warn(
      'Warning: COMPRESSION_POLICY=llm but no SUMMARIZER_API_KEY/EMBEDDING_API_KEY — using rule-based fallback.',
    );
  }

  const client = getD1Client();
  await runMigrations(client);
  const repository = new MemoryRepository(sqlFromD1Client(client));
  const runner = new SummaryEnrichmentRunner(repository, summarizer);

  let owners: string[];
  if (ownerId) {
    owners = [ownerId];
  } else {
    const rows = await client.query<{ owner_id: string }>(
      'SELECT DISTINCT owner_id FROM memories WHERE owner_id != ?',
      [''],
    );
    owners = rows.map((r) => r.owner_id);
  }

  if (owners.length === 0) {
    console.log('No memories found.');
    return;
  }

  for (const oid of owners) {
    const report = await runner.run({ ownerId: oid }, { dryRun, projectId, limit });
    console.log(`Owner ${oid}:`);
    console.log(`  scanned: ${report.scanned}`);
    console.log(`  enriched: ${report.enriched}`);
    console.log(`  dryRun: ${report.dryRun}`);
  }
}

enrichSummaries().catch((error) => {
  console.error('Summary enrichment failed:', error);
  process.exit(1);
});
