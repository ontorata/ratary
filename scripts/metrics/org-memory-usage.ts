import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { formatScriptError } from '../lib/cli-error.js';
import { orgMemoryReviewsPath, orgMemoryReviewsRoot } from '../lib/org-memory-paths.js';

const INGESTION_LOG_PATH = orgMemoryReviewsPath('ingestion-log.md');
const RECALL_LOG_PATH = orgMemoryReviewsPath('recall-log.md');
const EVIDENCE_TRACE_PATH = orgMemoryReviewsPath('evidence-trace.md');
const MCP_TRACE_PATH = orgMemoryReviewsPath('mcp-interaction-log.md');
const METRICS_PATH = orgMemoryReviewsPath('internal-usage-metrics.md');

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

function extractIsoTimestamp(body: string, key: string): string | undefined {
  const re = new RegExp(`- ${key}:\\s*(\\S+)`);
  return body.match(re)?.[1];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function computeP1BMetrics(ingestionBody: string): {
  ingestionCoveragePct: number;
  deduplicationRatio: number;
  normalizationSuccessRate: number;
  ingestToRecallReadyLatencyMs: number;
} {
  const ingested = extractNumber(ingestionBody, 'ingested');
  const failed = extractNumber(ingestionBody, 'failed');
  const skipped = extractNumber(ingestionBody, 'skipped');

  const attempted = ingested + failed + skipped;
  const ingestionCoveragePct =
    attempted > 0 ? Number(((ingested / attempted) * 100).toFixed(2)) : 100;

  const deduplicationRatio =
    ingested + skipped > 0 ? Number((skipped / (ingested + skipped)).toFixed(4)) : 0;

  const normalizerRows = [
    ...ingestionBody.matchAll(
      /\| stage=normalizer \| status=(\w+) \| processed=(\d+) \| failed=(\d+)/g,
    ),
  ];
  const normalizerProcessed = normalizerRows.reduce((sum, row) => sum + Number(row[2]), 0);
  const normalizerFailed = normalizerRows.reduce((sum, row) => sum + Number(row[3]), 0);
  const normalizationDenominator = normalizerProcessed + normalizerFailed;
  const normalizationSuccessRate =
    normalizationDenominator > 0
      ? Number(((normalizerProcessed / normalizationDenominator) * 100).toFixed(2))
      : ingested > 0 && failed === 0
        ? 100
        : 0;

  const startedAt = extractIsoTimestamp(ingestionBody, 'started_at');
  const endedAt = extractIsoTimestamp(ingestionBody, 'ended_at');
  let ingestToRecallReadyLatencyMs = 0;
  if (startedAt && endedAt) {
    ingestToRecallReadyLatencyMs = Math.max(
      0,
      Date.parse(endedAt) - Date.parse(startedAt),
    );
  }

  return {
    ingestionCoveragePct,
    deduplicationRatio,
    normalizationSuccessRate,
    ingestToRecallReadyLatencyMs,
  };
}

async function ensureMetricsFile(): Promise<void> {
  await mkdir(orgMemoryReviewsRoot(), { recursive: true });
  try {
    await stat(METRICS_PATH);
  } catch {
    const header = [
      '# P1-A Org Memory Dogfood — Internal Usage Metrics',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Schema** | `metrics_run_id`, `ingestion_count`, `recall_count`, `successful_recall`, `failed_recall`, `average_latency`, `evidence_generated`, `duplicate_memory`, `orphan_memory`, `organization_count`, `ingestion_coverage_pct`, `deduplication_ratio`, `normalization_success_rate`, `ingest_to_recall_ready_latency_ms` |',
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

  const p1b = computeP1BMetrics(ingestion.body);

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
  const organizationCount = 1;

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
    `- ingestion_coverage_pct=${p1b.ingestionCoveragePct}`,
    `- deduplication_ratio=${p1b.deduplicationRatio}`,
    `- normalization_success_rate=${p1b.normalizationSuccessRate}`,
    `- ingest_to_recall_ready_latency_ms=${p1b.ingestToRecallReadyLatencyMs}`,
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
    `| ingestion_coverage_pct | ${p1b.ingestionCoveragePct} |`,
    `| deduplication_ratio | ${p1b.deduplicationRatio} |`,
    `| normalization_success_rate | ${p1b.normalizationSuccessRate} |`,
    `| ingest_to_recall_ready_latency_ms | ${p1b.ingestToRecallReadyLatencyMs} |`,
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
  console.log(`ingestion_coverage_pct=${p1b.ingestionCoveragePct}`);
  console.log(`deduplication_ratio=${p1b.deduplicationRatio}`);
  console.log(`normalization_success_rate=${p1b.normalizationSuccessRate}`);
  console.log(`ingest_to_recall_ready_latency_ms=${p1b.ingestToRecallReadyLatencyMs}`);
}

main().catch((error: unknown) => {
  console.error('metrics org-memory gagal:', formatScriptError(error));
  process.exit(1);
});
