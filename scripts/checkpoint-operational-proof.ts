import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { formatScriptError } from './lib/cli-error.js';
import { writeOperationalMetrics } from './metrics/operational-proof.js';

const REPO_ROOT = resolve(process.cwd());
const CHECKPOINT_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/operational-checkpoints.md');

function isoWeek(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

async function ensureCheckpointFile(): Promise<void> {
  await mkdir(resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood'), { recursive: true });
  try {
    await stat(CHECKPOINT_PATH);
  } catch {
    const header = [
      '# P1-E Operational Proof — Weekly Checkpoints',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(CHECKPOINT_PATH, `${header}\n`, 'utf-8');
  }
}

async function main(): Promise<void> {
  const checkpointId = randomUUID();
  const timestamp = new Date().toISOString();
  const weekOf = isoWeek(new Date());
  const snapshot = await writeOperationalMetrics();

  const openGaps: string[] = [];
  if (snapshot.sessionCount < 1) {
    openGaps.push('awaiting_first_live_dogfood_session');
  }
  if (snapshot.recallPassRate < 100) {
    openGaps.push('recall_pass_rate_below_100');
  }

  const block = [
    `## checkpoint_id=${checkpointId}`,
    '',
    `- week_of=${weekOf}`,
    `- timestamp=${timestamp}`,
    `- ingested=${snapshot.ingestionCount}`,
    `- failed=${snapshot.ingestionFailed}`,
    `- skipped=${snapshot.ingestionSkipped}`,
    `- session_count=${snapshot.sessionCount}`,
    `- recall_pass_rate=${snapshot.recallPassRate}`,
    `- engineering_gate=${snapshot.engineeringGate}`,
    `- open_gaps=${openGaps.length > 0 ? openGaps.join(',') : 'none'}`,
    '',
  ].join('\n');

  await ensureCheckpointFile();
  const current = await readFile(CHECKPOINT_PATH, 'utf-8');
  await writeFile(CHECKPOINT_PATH, `${current.trimEnd()}\n\n${block}`, 'utf-8');

  console.log(`checkpoint_id=${checkpointId}`);
  console.log(`week_of=${weekOf}`);
  console.log(`session_count=${snapshot.sessionCount}`);
  console.log(`open_gaps=${openGaps.length > 0 ? openGaps.join(',') : 'none'}`);
}

main().catch((error: unknown) => {
  console.error('checkpoint operational-proof gagal:', formatScriptError(error));
  process.exit(1);
});
