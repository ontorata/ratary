import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ICandidateProvider } from '../src/memory/recall/candidate-provider.port.js';
import {
  CandidateSetSchema,
  type CandidateSet,
  type RecallCandidate,
  type RecallRequest,
} from '../src/memory/recall/recall-contracts.js';
import { RecallPolicy } from '../src/memory/recall/recall-policy.js';
import { RecallService } from '../src/memory/recall/recall-service.js';
import { formatScriptError } from './lib/cli-error.js';

type FixtureCandidate = RecallCandidate & {
  title?: string;
  text?: string;
  confidence?: number;
  updatedAt?: string;
  embeddingVersion?: string;
};

type FixtureQuery = {
  id: string;
  gate: 'G1' | 'G2' | 'G3' | 'G4';
  query: string;
  organizationId: string;
  limit?: number;
  expected_selected_order: string[];
  expected_rejected_contains: string[];
};

type RecallIntelligenceFixture = {
  fixture_version: string;
  description: string;
  policy_version: string;
  organization_id: string;
  corpus: FixtureCandidate[];
  queries: FixtureQuery[];
};

type QueryEval = {
  queryId: string;
  gate: string;
  query: string;
  successful: boolean;
  latencyMs: number;
  expectedOrder: string[];
  actualOrder: string[];
  topKPrecision: number;
  orderingCorrect: boolean;
  missingExpected: string[];
  isolationLeak: boolean;
  candidateSetHash: string;
  decisionHash: string;
  policyVersion: string;
  traceComplete: boolean;
  contextPackagePresent: boolean;
};

const REPO_ROOT = resolve(process.cwd());
const FIXTURE_PATH = resolve(
  REPO_ROOT,
  '.ai/reviews/org-memory-dogfood/fixtures/recall-intelligence-fixture.json',
);
const LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/recall-intelligence-log.md');
const FIXED_NOW = Date.parse('2026-07-08T12:00:00.000Z');

function hashList(ids: string[]): string {
  return createHash('sha256').update(ids.join('|')).digest('hex').slice(0, 16);
}

function topKPrecision(expected: string[], actual: string[], k: number): number {
  if (expected.length === 0) return 1;
  const topExpected = expected.slice(0, k);
  const topActual = new Set(actual.slice(0, k));
  const hits = topExpected.filter((id) => topActual.has(id)).length;
  return hits / topExpected.length;
}

class FixtureCandidateProvider implements ICandidateProvider {
  readonly providerName = 'fixture';

  constructor(private readonly corpus: FixtureCandidate[]) {}

  async provideCandidates(request: RecallRequest): Promise<CandidateSet> {
    const scoped = this.corpus
      .filter((candidate) => candidate.organizationId === request.organizationId)
      .map((candidate) => ({
        candidateId: candidate.candidateId,
        organizationId: candidate.organizationId,
        sourceType: candidate.sourceType,
        sourceReference: candidate.sourceReference,
        signals: {},
        confidence: candidate.confidence,
        metadata: candidate.metadata,
      }));

    return CandidateSetSchema.parse({
      requestId: request.requestId,
      organizationId: request.organizationId,
      candidates: scoped,
      generatedAt: '2026-07-08T12:00:00.000Z',
      providerName: this.providerName,
      providerLatencyMs: 0,
    });
  }
}

async function ensureLogHeader(): Promise<void> {
  await mkdir(resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood'), { recursive: true });
  try {
    await readFile(LOG_PATH, 'utf-8');
  } catch {
    const header = [
      '# P1-C Recall Intelligence — Evaluation Log',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Schema** | `run_id`, `fixture_version`, `policy_version`, `query_count`, `pass_rate`, `avg_top_k_precision`, `ordering_correct_rate`, `isolation_failures`, `trace_complete_rate`, `candidate_set_hash` |',
      '| **Mode** | fixed fixture ranking evaluation |',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(LOG_PATH, `${header}\n`, 'utf-8');
  }
}

async function main(): Promise<void> {
  await ensureLogHeader();
  const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf-8')) as RecallIntelligenceFixture;
  const provider = new FixtureCandidateProvider(fixture.corpus);
  const policy = new RecallPolicy(() => FIXED_NOW);
  const service = new RecallService(provider, policy);

  const evaluations: QueryEval[] = [];

  for (const query of fixture.queries) {
    const started = Date.now();
    const request: RecallRequest = {
      requestId: `eval-${query.id}`,
      organizationId: query.organizationId,
      query: query.query,
      limit: query.limit,
      contextBudget: 4096,
      traceContext: { correlationId: `corr-${query.id}` },
    };

    const first = await service.recall(request);
    const second = await service.recall(request);
    const latencyMs = Date.now() - started;

    const actualOrder = first.rankedCandidates.map((candidate) => candidate.candidateId);
    const secondOrder = second.rankedCandidates.map((candidate) => candidate.candidateId);
    const deterministic = actualOrder.join('|') === secondOrder.join('|');
    const orderingCorrect =
      actualOrder.length === query.expected_selected_order.length &&
      actualOrder.every((id, index) => id === query.expected_selected_order[index]);
    const missingExpected = query.expected_selected_order.filter((id) => !actualOrder.includes(id));
    const isolationLeak =
      first.rankedCandidates.some((candidate) => candidate.organizationId !== query.organizationId) ||
      first.candidates.some((candidate) => candidate.organizationId !== query.organizationId);
    const rejected = first.decision?.rejectedCandidates ?? [];
    const rejectedOk = query.expected_rejected_contains.every((id) => rejected.includes(id));
    const k = query.expected_selected_order.length || 1;
    const precision = topKPrecision(query.expected_selected_order, actualOrder, k);
    const successful =
      deterministic &&
      orderingCorrect &&
      missingExpected.length === 0 &&
      !isolationLeak &&
      rejectedOk &&
      first.decision?.policyVersion === fixture.policy_version &&
      Boolean(first.contextPackage);

    evaluations.push({
      queryId: query.id,
      gate: query.gate,
      query: query.query,
      successful,
      latencyMs,
      expectedOrder: query.expected_selected_order,
      actualOrder,
      topKPrecision: precision,
      orderingCorrect,
      missingExpected,
      isolationLeak,
      candidateSetHash: hashList(first.candidates.map((candidate) => candidate.candidateId).sort()),
      decisionHash: hashList(actualOrder),
      policyVersion: first.decision?.policyVersion ?? 'unknown',
      traceComplete: Boolean(first.decision && first.contextPackage),
      contextPackagePresent: Boolean(first.contextPackage),
    });
  }

  const queryCount = evaluations.length;
  const successful = evaluations.filter((item) => item.successful).length;
  const failed = queryCount - successful;
  const isolationFailures = evaluations.filter((item) => item.isolationLeak).length;
  const orderingCorrectRate =
    evaluations.filter((item) => item.orderingCorrect).length / Math.max(queryCount, 1);
  const avgTopK =
    evaluations.reduce((sum, item) => sum + item.topKPrecision, 0) / Math.max(queryCount, 1);
  const traceCompleteRate =
    evaluations.filter((item) => item.traceComplete).length / Math.max(queryCount, 1);
  const passRate = successful / Math.max(queryCount, 1);
  const runId = randomUUID();
  const aggregateHash = hashList(evaluations.map((item) => item.decisionHash));

  const lines = [
    `## run_id=${runId}`,
    '',
    `- started_at: ${new Date().toISOString()}`,
    `- fixture_version: ${fixture.fixture_version}`,
    `- policy_version: ${fixture.policy_version}`,
    `- query_count: ${queryCount}`,
    `- successful_recalls: ${successful}`,
    `- failed_recalls: ${failed}`,
    `- pass_rate: ${(passRate * 100).toFixed(2)}%`,
    `- avg_top_k_precision: ${avgTopK.toFixed(4)}`,
    `- ordering_correct_rate: ${(orderingCorrectRate * 100).toFixed(2)}%`,
    `- isolation_failures: ${isolationFailures}`,
    `- trace_complete_rate: ${(traceCompleteRate * 100).toFixed(2)}%`,
    `- candidate_set_hash: ${aggregateHash}`,
    '',
    '| query_id | gate | successful | ordering_correct | top_k_precision | isolation_leak | policy_version |',
    '|----------|------|------------|------------------|-----------------|----------------|----------------|',
    ...evaluations.map(
      (item) =>
        `| ${item.queryId} | ${item.gate} | ${item.successful} | ${item.orderingCorrect} | ${item.topKPrecision.toFixed(2)} | ${item.isolationLeak} | ${item.policyVersion} |`,
    ),
    '',
    '### Ranking comparisons',
    '',
    ...evaluations.flatMap((item) => [
      `#### ${item.queryId}`,
      `- expected: \`${item.expectedOrder.join(' > ')}\``,
      `- actual: \`${item.actualOrder.join(' > ')}\``,
      `- decision_hash: \`${item.decisionHash}\``,
      `- missing_expected: \`${item.missingExpected.join(',') || 'none'}\``,
      '',
    ]),
    '---',
    '',
  ];

  const existing = await readFile(LOG_PATH, 'utf-8');
  await writeFile(LOG_PATH, `${existing.trimEnd()}\n\n${lines.join('\n')}`, 'utf-8');

  console.log(`run_id=${runId}`);
  console.log(`fixture_version=${fixture.fixture_version}`);
  console.log(`policy_version=${fixture.policy_version}`);
  console.log(`query_count=${queryCount}`);
  console.log(`successful=${successful}`);
  console.log(`failed=${failed}`);
  console.log(`pass_rate=${(passRate * 100).toFixed(2)}%`);
  console.log(`avg_top_k_precision=${avgTopK.toFixed(4)}`);
  console.log(`ordering_correct_rate=${(orderingCorrectRate * 100).toFixed(2)}%`);
  console.log(`isolation_failures=${isolationFailures}`);
  console.log(`trace_complete_rate=${(traceCompleteRate * 100).toFixed(2)}%`);
  console.log(`candidate_set_hash=${aggregateHash}`);

  if (failed > 0 || isolationFailures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(formatScriptError(error));
  process.exit(1);
});
