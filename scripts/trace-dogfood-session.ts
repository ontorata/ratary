import { formatScriptError } from './lib/cli-error.js';
import { appendDogfoodSession } from './lib/operational-usage-log.js';

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1 || index + 1 >= process.argv.length) return undefined;
  return process.argv[index + 1];
}

async function main(): Promise<void> {
  const toolsRaw = readFlag('--tools');
  const querySummary = readFlag('--query');
  const operator = readFlag('--operator');
  const outcomeRaw = readFlag('--outcome');
  const durationRaw = readFlag('--duration-ms');

  if (!toolsRaw || !querySummary) {
    console.error(
      'Usage: npm run trace:dogfood-session -- --tools search_memory,save_memory --query "phase-4 handoff" [--operator name] [--outcome success|partial|failed] [--duration-ms 1200]',
    );
    process.exit(1);
  }

  const tools = toolsRaw
    .split(',')
    .map((tool) => tool.trim())
    .filter((tool) => tool.length > 0);

  const outcome =
    outcomeRaw === 'partial' || outcomeRaw === 'failed' || outcomeRaw === 'success'
      ? outcomeRaw
      : 'success';

  const durationMs = durationRaw ? Number(durationRaw) : 0;

  const entry = await appendDogfoodSession({
    operator,
    tools,
    querySummary,
    outcome,
    durationMs: Number.isFinite(durationMs) ? durationMs : 0,
  });

  console.log(`session_id=${entry.sessionId}`);
  console.log(`outcome=${entry.outcome}`);
  console.log(`tools=${entry.tools.join(',')}`);
}

main().catch((error: unknown) => {
  console.error('trace dogfood session gagal:', formatScriptError(error));
  process.exit(1);
});
