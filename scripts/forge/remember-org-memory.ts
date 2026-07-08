import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { formatScriptError } from '../lib/cli-error.js';

const REPO_ROOT = resolve(process.cwd());
const MCP_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/mcp-interaction-log.md');
const INGEST_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/ingestion-log.md');
const RECALL_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/recall-log.md');

type HandoffEntry = {
  sessionId: string;
  handoffId: string;
  rataryCodename: string;
  ingestionRunId: string;
  recallRunId: string;
  evidenceRunId: string;
  branch: string;
  notes: string;
  timestamp: string;
};

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function latestRunId(logContent: string): string {
  const matches = [...logContent.matchAll(/## run_id=([a-f0-9-]+)/g)];
  return matches.length > 0 ? (matches[matches.length - 1]?.[1] ?? 'unknown') : 'unknown';
}

async function loadLatestRunIds(): Promise<{ ingestionRunId: string; recallRunId: string }> {
  const ingestion = await readFile(INGEST_LOG_PATH, 'utf-8');
  const recall = await readFile(RECALL_LOG_PATH, 'utf-8');
  return {
    ingestionRunId: latestRunId(ingestion),
    recallRunId: latestRunId(recall),
  };
}

async function ensureLogFile(): Promise<void> {
  await mkdir(resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood'), { recursive: true });

  try {
    await stat(MCP_LOG_PATH);
  } catch {
    const header = [
      '# P1-A Org Memory Dogfood — MCP Interaction Log',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Schema** | `session_id`, `handoff_id`, `ratary_codename`, `ingestion_run_id`, `recall_run_id`, `evidence_run_id` |',
      '| **Purpose** | session -> handoff -> ingest -> recall -> evidence -> ratary record chain |',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(MCP_LOG_PATH, `${header}\n`, 'utf-8');
  }
}

function renderEntry(entry: HandoffEntry): string {
  return [
    `## session_id=${entry.sessionId}`,
    '',
    `- timestamp=${entry.timestamp}`,
    `- handoff_id=${entry.handoffId}`,
    `- ratary_codename=${entry.rataryCodename}`,
    `- ingestion_run_id=${entry.ingestionRunId}`,
    `- recall_run_id=${entry.recallRunId}`,
    `- evidence_run_id=${entry.evidenceRunId}`,
    `- branch=${entry.branch}`,
    `- notes=${entry.notes}`,
    '',
  ].join('\n');
}

async function appendEntry(entry: HandoffEntry): Promise<void> {
  await ensureLogFile();
  const current = await readFile(MCP_LOG_PATH, 'utf-8');
  await writeFile(MCP_LOG_PATH, `${current.trimEnd()}\n\n${renderEntry(entry)}`, 'utf-8');
}

async function main(): Promise<void> {
  const sessionId = getArgValue('--session-id') ?? randomUUID();
  const handoffId = getArgValue('--handoff-id') ?? randomUUID();
  const rataryCodename = getArgValue('--ratary-codename') ?? 'pending-save_memory';
  const branch = getArgValue('--branch') ?? 'forge/org-memory-dogfood';
  const notes = getArgValue('--notes') ?? 'session handoff trace';

  const { ingestionRunId, recallRunId } = await loadLatestRunIds();
  const evidenceRunId = getArgValue('--evidence-run-id') ?? recallRunId;

  const entry: HandoffEntry = {
    sessionId,
    handoffId,
    rataryCodename,
    ingestionRunId: getArgValue('--ingestion-run-id') ?? ingestionRunId,
    recallRunId: getArgValue('--recall-run-id') ?? recallRunId,
    evidenceRunId,
    branch,
    notes,
    timestamp: new Date().toISOString(),
  };

  await appendEntry(entry);

  console.log(`session_id=${entry.sessionId}`);
  console.log(`handoff_id=${entry.handoffId}`);
  console.log(`ratary_codename=${entry.rataryCodename}`);
  console.log(`ingestion_run_id=${entry.ingestionRunId}`);
  console.log(`recall_run_id=${entry.recallRunId}`);
  console.log(`evidence_run_id=${entry.evidenceRunId}`);
}

main().catch((error: unknown) => {
  console.error('remember-org-memory gagal:', formatScriptError(error));
  process.exit(1);
});
