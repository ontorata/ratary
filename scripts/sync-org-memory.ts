import 'dotenv/config';
import { runOrgMemorySync } from './lib/org-memory-sync.js';
import { formatScriptError } from './lib/cli-error.js';

function printSummary(result: Awaited<ReturnType<typeof runOrgMemorySync>>): void {
  console.log(`run_id=${result.runId}`);
  console.log(`ingested=${result.totalIngested}`);
  console.log(`failed=${result.totalFailed}`);
  console.log(`skipped=${result.totalSkipped ?? 0}`);
  console.log(`digest=${result.digest}`);
  const stageResults = result.stageResults ?? [];
  const completed = stageResults.filter((stage) => stage.status === 'completed').length;
  const skipped = stageResults.filter((stage) => stage.status === 'skipped').length;
  console.log(`stages_completed=${completed}`);
  console.log(`stages_skipped=${skipped}`);
}

async function main(): Promise<void> {
  const result = await runOrgMemorySync();
  printSummary(result);
}

main().catch((error: unknown) => {
  console.error('Org memory sync gagal:', formatScriptError(error));
  process.exit(1);
});
