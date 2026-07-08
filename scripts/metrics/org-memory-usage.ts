import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { formatScriptError } from '../lib/cli-error.js';

const REPO_ROOT = resolve(process.cwd());
const INGESTION_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/ingestion-log.md');
const RECALL_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/recall-log.md');
const EVIDENCE_TRACE_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/evidence-trace.md');
const MCP_TRACE_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/mcp-interaction-log.md');
const METRICS_PATH = resolve(
  REPO_ROOT,
  '.ai/reviews/org-memory-dogfood/internal-usage-metrics.md',
);

type ParsedBlock = {
  runId: string;
  body: string;
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

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

async function ensureMetricsFile(): Promise<void> {
  await mkdir(resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood'), { recursive: true });
  try {
    await stat(METRICS_PATH);
  } catch {
    const header = [
      '# P1-A Org Memory Dogfood — Internal Usage Metrics',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Schema** | `metrics_run_id`, `ingestion_count`, `recall_count`, `successful_recall`, `failed_recall`, `average_latency`, `evidence_generated`, `duplicate_memory`, `orphan_memory`, `organization_count` |',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(METRICS_PATH, `${header}\n`, 'utf-8');
  }
}

async function main(): Promise<void> {
  const metricsRunId = randomUUID();
  const timestamp = new Date().toISOString();

  const ingestionLog = await readFile(INGESTION_LOG_PATH, 'utf-8');
  const recallLog = await readFile(RECALL_LOG_PATH, 'utf-8');
  const evidenceTrace = await readFile(EVIDENCE_TRACE_PATH, 'utf-8');
  const mcpTrace = await readFile(MCP_TRACE_PATH, 'utf-8');

  const ingestion = latestBlock(ingestionLog, /## run_id=([a-f0-9-]+)/g);
  const recall = latestBlock(recallLog, /## run_id=([a-f0-9-]+)/g);
  const evidence = latestBlock(evidenceTrace, /## run_id=([a-f0-9-]+)/g);
  const session = latestBlock(mcpTrace, /## session_id=([a-f0-9-]+)/g);

  const ingestionCount = extractNumber(ingestion.body, 'ingested');
  const recallCount = extractNumber(recall.body, 'query_count');
  const successfulRecall = extractNumber(recall.body, 'successful_recalls');
  const failedRecall = extractNumber(recall.body, 'failed_recalls');
  const averageLatency = extractNumber(recall.body, 'avg_latency_ms');
  const passRate = extractNumber(recall.body, 'pass_rate');
  const missingSources = extractNumber(recall.body, 'missing_sources');

  const evidenceIds = [...evidence.body.matchAll(/evidence_ids:\s*([^\n]+)/g)]
    .flatMap((entry) => entry[1].split(',').map((value) => value.trim()))
    .filter((value) => value.length > 0 && value !== 'none');
  const uniqueEvidenceIds = unique(evidenceIds);
  const evidenceGenerated = evidenceIds.length;
  const duplicateMemory = Math.max(0, evidenceIds.length - uniqueEvidenceIds.length);

  const fixtureIds = [...evidence.body.matchAll(/\((evidence-[a-z0-9-]+)\)/g)].map((m) => m[1]);
  const uniqueFixtureIds = unique(fixtureIds);
  const orphanMemory = Math.max(0, uniqueFixtureIds.length - uniqueEvidenceIds.length) + missingSources;
  const organizationCount = 1; // P1-A dogfood scope: Ontorata single organization

  const block = [
    `## metrics_run_id=${metricsRunId}`,
    '',
    `- timestamp=${timestamp}`,
    `- session_id=${session.runId}`,
    `- ingestion_run_id=${ingestion.runId}`,
    `- recall_run_id=${recall.runId}`,
    `- evidence_run_id=${evidence.runId}`,
    `- ingestion_count=${ingestionCount}`,
    `- recall_count=${recallCount}`,
    `- successful_recall=${successfulRecall}`,
    `- failed_recall=${failedRecall}`,
    `- average_latency=${averageLatency}`,
    `- pass_rate=${passRate}`,
    `- evidence_generated=${evidenceGenerated}`,
    `- duplicate_memory=${duplicateMemory}`,
    `- orphan_memory=${orphanMemory}`,
    `- organization_count=${organizationCount}`,
    `- drift_incidents=${missingSources}`,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| ingestion_count | ${ingestionCount} |`,
    `| recall_count | ${recallCount} |`,
    `| successful_recall | ${successfulRecall} |`,
    `| failed_recall | ${failedRecall} |`,
    `| average_latency | ${averageLatency} |`,
    `| pass_rate | ${passRate} |`,
    `| evidence_generated | ${evidenceGenerated} |`,
    `| duplicate_memory | ${duplicateMemory} |`,
    `| orphan_memory | ${orphanMemory} |`,
    `| organization_count | ${organizationCount} |`,
    `| drift_incidents | ${missingSources} |`,
    '',
  ].join('\n');

  await ensureMetricsFile();
  const current = await readFile(METRICS_PATH, 'utf-8');
  await writeFile(METRICS_PATH, `${current.trimEnd()}\n\n${block}`, 'utf-8');

  console.log(`metrics_run_id=${metricsRunId}`);
  console.log(`ingestion_count=${ingestionCount}`);
  console.log(`recall_count=${recallCount}`);
  console.log(`successful_recall=${successfulRecall}`);
  console.log(`failed_recall=${failedRecall}`);
  console.log(`average_latency=${averageLatency}`);
  console.log(`evidence_generated=${evidenceGenerated}`);
  console.log(`duplicate_memory=${duplicateMemory}`);
  console.log(`orphan_memory=${orphanMemory}`);
  console.log(`organization_count=${organizationCount}`);
  console.log(`pass_rate=${passRate}`);
}

main().catch((error: unknown) => {
  console.error('metrics org-memory gagal:', formatScriptError(error));
  process.exit(1);
});
