import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { formatScriptError } from './lib/cli-error.js';

type FixtureCorpus = {
  id: string;
  title: string;
  source_ref: string;
  text: string;
};

type FixtureQuery = {
  id: string;
  gate: 'G2' | 'G3' | 'G4';
  query: string;
  required_evidence_ids: string[];
};

type RecallFixture = {
  fixture_version: string;
  description: string;
  corpus: FixtureCorpus[];
  queries: FixtureQuery[];
};

type QueryResult = {
  queryId: string;
  gate: string;
  query: string;
  successful: boolean;
  latencyMs: number;
  selectedEvidenceIds: string[];
  missingEvidenceIds: string[];
};

const REPO_ROOT = resolve(process.cwd());
const FIXTURE_PATH = resolve(
  REPO_ROOT,
  '.ai/reviews/org-memory-dogfood/fixtures/recall-fixture.json',
);
const INGEST_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/ingestion-log.md');
const RECALL_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/recall-log.md');
const EVIDENCE_TRACE_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/evidence-trace.md');

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3);
}

function scoreEvidence(query: string, evidence: FixtureCorpus): number {
  const queryTokens = new Set(tokenize(query));
  const textTokens = tokenize(`${evidence.title} ${evidence.text}`);
  let score = 0;
  for (const token of textTokens) {
    if (queryTokens.has(token)) score += 1;
  }
  const joined = `${evidence.title} ${evidence.text} ${evidence.source_ref}`.toLowerCase();
  if (queryTokens.has('p1') && joined.includes('p1')) score += 3;
  if (queryTokens.has('release') && joined.includes('release')) score += 2;
  if (queryTokens.has('baseline') && joined.includes('baseline')) score += 2;
  if (queryTokens.has('evidence') && joined.includes('evidence')) score += 1;
  return score;
}

function selectEvidence(query: FixtureQuery, corpus: FixtureCorpus[]): string[] {
  const ranked = corpus
    .map((item) => ({ id: item.id, score: scoreEvidence(query.query, item) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .map((entry) => entry.id);

  const selected = ranked.slice(0, 4);
  const queryTokens = new Set(tokenize(query.query));

  if (queryTokens.has('p1')) {
    const p1Candidate = ranked.find((evidenceId) => {
      const evidence = corpus.find((item) => item.id === evidenceId);
      if (!evidence) return false;
      const content = `${evidence.title} ${evidence.text} ${evidence.source_ref}`.toLowerCase();
      return content.includes('p1') || content.includes('first-workload');
    });
    if (p1Candidate && !selected.includes(p1Candidate)) selected.push(p1Candidate);
  }

  return Array.from(new Set(selected)).slice(0, 5);
}

function extractLatestIngestionRunId(logContent: string): string {
  const matches = [...logContent.matchAll(/## run_id=([a-f0-9-]+)/g)];
  return matches.length > 0 ? (matches[matches.length - 1]?.[1] ?? 'unknown') : 'unknown';
}

async function ensureLogHeaders(): Promise<void> {
  await mkdir(resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood'), { recursive: true });

  try {
    await stat(RECALL_LOG_PATH);
  } catch {
    const header = [
      '# P1-A Org Memory Dogfood — Recall Log',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Schema** | `run_id`, `query_count`, `successful_recalls`, `failed_recalls`, `missing_sources`, `avg_latency_ms`, `pass_rate` |',
      '| **Mode** | deterministic fixture dataset |',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(RECALL_LOG_PATH, `${header}\n`, 'utf-8');
  }

  try {
    await stat(EVIDENCE_TRACE_PATH);
  } catch {
    const header = [
      '# P1-A Org Memory Dogfood — Evidence Trace',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Purpose** | query -> evidence trace for G2/G3/G4 recall harness |',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(EVIDENCE_TRACE_PATH, `${header}\n`, 'utf-8');
  }
}

function buildRecallLogBlock(
  runId: string,
  fixtureVersion: string,
  ingestionRunId: string,
  results: QueryResult[],
): string {
  const queryCount = results.length;
  const successfulRecalls = results.filter((result) => result.successful).length;
  const failedRecalls = queryCount - successfulRecalls;
  const missingSources = results.filter((result) => result.missingEvidenceIds.length > 0).length;
  const avgLatencyMs =
    queryCount > 0
      ? Math.round(
          (results.reduce((sum, result) => sum + result.latencyMs, 0) / queryCount) * 100,
        ) / 100
      : 0;
  const passRate = queryCount > 0 ? Math.round((successfulRecalls / queryCount) * 10000) / 100 : 0;

  const rows = results
    .map(
      (result) =>
        `| query_id=${result.queryId} | gate=${result.gate} | successful=${result.successful} | latency_ms=${result.latencyMs} | evidence_count=${result.selectedEvidenceIds.length} | missing_sources=${result.missingEvidenceIds.length} |`,
    )
    .join('\n');

  return [
    `## run_id=${runId}`,
    '',
    `- fixture_version=${fixtureVersion}`,
    `- ingestion_run_id=${ingestionRunId}`,
    `- query_count=${queryCount}`,
    `- successful_recalls=${successfulRecalls}`,
    `- failed_recalls=${failedRecalls}`,
    `- missing_sources=${missingSources}`,
    `- avg_latency_ms=${avgLatencyMs}`,
    `- pass_rate=${passRate}`,
    '',
    '| query | gate | successful | latency_ms | evidence_count | missing_sources |',
    '|-------|------|------------|------------|----------------|-----------------|',
    rows,
    '',
  ].join('\n');
}

function buildEvidenceTraceBlock(
  runId: string,
  fixture: RecallFixture,
  results: QueryResult[],
): string {
  const traceLines: string[] = [`## run_id=${runId}`, ''];
  const evidenceMap = new Map(fixture.corpus.map((entry) => [entry.id, entry]));

  for (const result of results) {
    traceLines.push(`### query_id=${result.queryId} gate=${result.gate}`);
    traceLines.push(`- query: ${result.query}`);
    traceLines.push(`- successful: ${result.successful}`);
    traceLines.push(
      `- evidence_ids: ${result.selectedEvidenceIds.length > 0 ? result.selectedEvidenceIds.join(', ') : 'none'}`,
    );
    traceLines.push(
      `- missing_evidence: ${result.missingEvidenceIds.length > 0 ? result.missingEvidenceIds.join(', ') : 'none'}`,
    );

    for (const evidenceId of result.selectedEvidenceIds) {
      const evidence = evidenceMap.get(evidenceId);
      if (!evidence) continue;
      traceLines.push(`  - evidence_ref: ${evidence.source_ref} (${evidence.id})`);
    }

    traceLines.push('');
  }

  return traceLines.join('\n');
}

async function appendBlock(path: string, block: string): Promise<void> {
  const current = await readFile(path, 'utf-8');
  await writeFile(path, `${current.trimEnd()}\n\n${block}\n`, 'utf-8');
}

async function run(): Promise<void> {
  const runId = randomUUID();
  const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf-8')) as RecallFixture;
  const ingestionLog = await readFile(INGEST_LOG_PATH, 'utf-8');
  const ingestionRunId = extractLatestIngestionRunId(ingestionLog);

  const results: QueryResult[] = fixture.queries.map((query) => {
    const started = Date.now();
    const selectedEvidenceIds = selectEvidence(query, fixture.corpus);
    const missingEvidenceIds = query.required_evidence_ids.filter(
      (requiredId) => !selectedEvidenceIds.includes(requiredId),
    );
    const successful = missingEvidenceIds.length === 0 && selectedEvidenceIds.length > 0;
    const latencyMs = Date.now() - started;

    return {
      queryId: query.id,
      gate: query.gate,
      query: query.query,
      successful,
      latencyMs,
      selectedEvidenceIds,
      missingEvidenceIds,
    };
  });

  await ensureLogHeaders();

  const recallBlock = buildRecallLogBlock(runId, fixture.fixture_version, ingestionRunId, results);
  const traceBlock = buildEvidenceTraceBlock(runId, fixture, results);
  await appendBlock(RECALL_LOG_PATH, recallBlock);
  await appendBlock(EVIDENCE_TRACE_PATH, traceBlock);

  const queryCount = results.length;
  const successfulRecalls = results.filter((result) => result.successful).length;
  const failedRecalls = queryCount - successfulRecalls;
  const passRate = queryCount > 0 ? Math.round((successfulRecalls / queryCount) * 10000) / 100 : 0;
  const missingSources = results.filter((result) => result.missingEvidenceIds.length > 0).length;
  const avgLatencyMs =
    queryCount > 0
      ? Math.round(
          (results.reduce((sum, result) => sum + result.latencyMs, 0) / queryCount) * 100,
        ) / 100
      : 0;

  console.log(`run_id=${runId}`);
  console.log(`query_count=${queryCount}`);
  console.log(`successful_recalls=${successfulRecalls}`);
  console.log(`failed_recalls=${failedRecalls}`);
  console.log(`missing_sources=${missingSources}`);
  console.log(`avg_latency_ms=${avgLatencyMs}`);
  console.log(`pass_rate=${passRate}`);
}

run().catch((error: unknown) => {
  console.error('Recall eval gagal:', formatScriptError(error));
  process.exit(1);
});
