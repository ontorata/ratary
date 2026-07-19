import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatScriptError } from '../lib/cli-error.js';
import {
  countDogfoodSessions,
  ensureOperationalUsageLog,
  operationalUsageLogPath,
} from '../lib/operational-usage-log.js';

export const OPERATIONAL_METRICS_SCHEMA_VERSION = '1.0';

function repoRoot(): string {
  return resolve(process.cwd());
}

function ingestionLogPath(): string {
  return resolve(repoRoot(), '.ai/reviews/org-memory-dogfood/ingestion-log.md');
}

function recallLogPath(): string {
  return resolve(repoRoot(), '.ai/reviews/org-memory-dogfood/recall-log.md');
}

function metricsMarkdownPath(): string {
  return resolve(repoRoot(), '.ai/reviews/org-memory-dogfood/operational-metrics.md');
}

function metricsJsonPath(): string {
  return resolve(repoRoot(), '.ai/reviews/org-memory-dogfood/operational-metrics.json');
}

type ParsedBlock = {
  runId: string;
  body: string;
};

export type OperationalMetricsSnapshot = {
  schemaVersion: string;
  metricsRunId: string;
  timestamp: string;
  ingestionRunId: string;
  ingestionCount: number;
  ingestionFailed: number;
  ingestionSkipped: number;
  ingestionDigest: string;
  recallPassRate: number;
  sessionCount: number;
  engineeringGate: 'unknown' | 'pass';
};

function latestBlock(content: string, marker: RegExp): ParsedBlock {
  const matches = [...content.matchAll(marker)];
  if (matches.length === 0) return { runId: 'unknown', body: '' };
  const latest = matches[matches.length - 1];
  const start = latest?.index ?? 0;
  const end = content.indexOf('\n## ', start + 1);
  const body = content.slice(start, end === -1 ? content.length : end).trim();
  const runId = latest?.[1] ?? 'unknown';
  return { runId, body };
}

function extractNumber(body: string, key: string): number {
  const re = new RegExp(`${key}=([0-9]+(?:\\.[0-9]+)?)`);
  const match = body.match(re);
  return match ? Number(match[1]) : 0;
}

function extractDigest(body: string): string {
  const match = body.match(/digest=([a-f0-9]+)/);
  return match?.[1] ?? 'unknown';
}

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return '';
  }
}

export async function collectOperationalMetrics(): Promise<OperationalMetricsSnapshot> {
  const ingestionLog = await readOptional(ingestionLogPath());
  const recallLog = await readOptional(recallLogPath());
  await ensureOperationalUsageLog();
  const usageLog = await readFile(operationalUsageLogPath(), 'utf-8');

  const ingestion = latestBlock(ingestionLog, /## run_id=([a-f0-9-]+)/g);
  const recall = latestBlock(recallLog, /## run_id=([a-f0-9-]+)/g);

  return {
    schemaVersion: OPERATIONAL_METRICS_SCHEMA_VERSION,
    metricsRunId: randomUUID(),
    timestamp: new Date().toISOString(),
    ingestionRunId: ingestion.runId,
    ingestionCount: extractNumber(ingestion.body, 'ingested'),
    ingestionFailed: extractNumber(ingestion.body, 'failed'),
    ingestionSkipped: extractNumber(ingestion.body, 'skipped'),
    ingestionDigest: extractDigest(ingestion.body),
    recallPassRate: extractNumber(recall.body, 'pass_rate'),
    sessionCount: countDogfoodSessions(usageLog),
    engineeringGate: ingestionFailedIsZero(ingestion.body) ? 'pass' : 'unknown',
  };
}

function ingestionFailedIsZero(body: string): boolean {
  if (!body) return false;
  return extractNumber(body, 'failed') === 0;
}

function renderMetricsBlock(snapshot: OperationalMetricsSnapshot): string {
  return [
    `## metrics_run_id=${snapshot.metricsRunId}`,
    '',
    `- schema_version=${snapshot.schemaVersion}`,
    `- timestamp=${snapshot.timestamp}`,
    `- ingestion_run_id=${snapshot.ingestionRunId}`,
    `- ingested=${snapshot.ingestionCount}`,
    `- failed=${snapshot.ingestionFailed}`,
    `- skipped=${snapshot.ingestionSkipped}`,
    `- digest=${snapshot.ingestionDigest}`,
    `- recall_pass_rate=${snapshot.recallPassRate}`,
    `- session_count=${snapshot.sessionCount}`,
    `- engineering_gate=${snapshot.engineeringGate}`,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| ingested | ${snapshot.ingestionCount} |`,
    `| failed | ${snapshot.ingestionFailed} |`,
    `| skipped | ${snapshot.ingestionSkipped} |`,
    `| recall_pass_rate | ${snapshot.recallPassRate} |`,
    `| session_count | ${snapshot.sessionCount} |`,
    '',
  ].join('\n');
}

async function ensureMetricsMarkdown(): Promise<void> {
  const metricsPath = metricsMarkdownPath();
  await mkdir(resolve(repoRoot(), '.ai/reviews/org-memory-dogfood'), { recursive: true });
  try {
    await stat(metricsPath);
  } catch {
    const header = [
      '# P1-E Operational Proof — Metrics',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      `| **Schema version** | ${OPERATIONAL_METRICS_SCHEMA_VERSION} |`,
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(metricsPath, `${header}\n`, 'utf-8');
  }
}

export async function writeOperationalMetrics(): Promise<OperationalMetricsSnapshot> {
  const snapshot = await collectOperationalMetrics();
  await ensureMetricsMarkdown();
  const metricsPath = metricsMarkdownPath();
  const jsonPath = metricsJsonPath();
  const current = await readFile(metricsPath, 'utf-8');
  await writeFile(metricsPath, `${current.trimEnd()}\n\n${renderMetricsBlock(snapshot)}`, 'utf-8');
  await writeFile(jsonPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf-8');
  return snapshot;
}

async function main(): Promise<void> {
  const snapshot = await writeOperationalMetrics();
  console.log(`metrics_run_id=${snapshot.metricsRunId}`);
  console.log(`ingested=${snapshot.ingestionCount}`);
  console.log(`failed=${snapshot.ingestionFailed}`);
  console.log(`skipped=${snapshot.ingestionSkipped}`);
  console.log(`session_count=${snapshot.sessionCount}`);
  console.log(`recall_pass_rate=${snapshot.recallPassRate}`);
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  main().catch((error: unknown) => {
    console.error('metrics operational-proof gagal:', formatScriptError(error));
    process.exit(1);
  });
}
