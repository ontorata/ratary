import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { formatScriptError } from '../lib/cli-error.js';
import { orgMemoryReviewsPath, orgMemoryReviewsRoot } from '../lib/org-memory-paths.js';
import {
  loadProductionWorkloadRegistry,
  PRODUCTION_REGISTRY_SCHEMA_VERSION,
  summarizeRegistry,
} from '../lib/production-workload-registry.js';

export const PRODUCTION_METRICS_SCHEMA_VERSION = '1.0';

function metricsMarkdownPath(): string {
  return orgMemoryReviewsPath('production-metrics.md');
}

function metricsJsonPath(): string {
  return orgMemoryReviewsPath('production-metrics.json');
}

function operationalMetricsJsonPath(): string {
  return orgMemoryReviewsPath('operational-metrics.json');
}

function internalUsageMetricsPath(): string {
  return orgMemoryReviewsPath('internal-usage-metrics.md');
}

type LiveSignals = {
  productionDocuments: number;
  productionQueries: number;
  productionRecallAccuracy: number;
  dogfoodSessionCount: number;
  recallPassRate: number;
};

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return '';
  }
}

function latestMetricBlock(content: string, key: string): number {
  const matches = [...content.matchAll(new RegExp(`- ${key}=([0-9]+(?:\\.[0-9]+)?)`, 'g'))];
  if (matches.length === 0) return 0;
  const latest = matches[matches.length - 1]?.[1];
  return latest ? Number(latest) : 0;
}

async function collectLiveSignals(): Promise<LiveSignals> {
  const operationalRaw = await readOptional(operationalMetricsJsonPath());
  const internalUsage = await readOptional(internalUsageMetricsPath());

  let ingestionCount = 0;
  let sessionCount = 0;
  let recallPassRate = 0;

  if (operationalRaw) {
    try {
      const operational = JSON.parse(operationalRaw) as {
        ingestionCount?: number;
        sessionCount?: number;
        recallPassRate?: number;
      };
      ingestionCount = operational.ingestionCount ?? 0;
      sessionCount = operational.sessionCount ?? 0;
      recallPassRate = operational.recallPassRate ?? 0;
    } catch {
      // fall through to markdown parsing
    }
  }

  const ingestionFromLog = latestMetricBlock(internalUsage, 'ingestion_count');
  const recallFromLog = latestMetricBlock(internalUsage, 'pass_rate');
  const recallCount = latestMetricBlock(internalUsage, 'recall_count');

  return {
    productionDocuments: ingestionCount > 0 ? ingestionCount : ingestionFromLog,
    productionQueries: recallCount > 0 ? recallCount : sessionCount,
    productionRecallAccuracy: recallPassRate > 0 ? recallPassRate : recallFromLog,
    dogfoodSessionCount: sessionCount,
    recallPassRate: recallPassRate > 0 ? recallPassRate : recallFromLog,
  };
}

export type ProductionMetricsSnapshot = {
  schemaVersion: string;
  metricsRunId: string;
  timestamp: string;
  registrySchemaVersion: string;
  registryUpdated: string;
  productionOrganizations: number;
  productionWorkloads: number;
  internalOrganizations: number;
  externalOrganizations: number;
  internalWorkloads: number;
  externalWorkloads: number;
  trustedOrganizations: number;
  trustedWorkloads: number;
  northStarWorkloads: number;
  productionDocuments: number;
  productionQueries: number;
  productionRecallAccuracy: number;
  dogfoodSessionCount: number;
  phase4ExitGapExternalOrg: boolean;
};

export async function collectProductionMetrics(): Promise<ProductionMetricsSnapshot> {
  const registry = await loadProductionWorkloadRegistry();
  const summary = summarizeRegistry(registry);
  const live = await collectLiveSignals();

  return {
    schemaVersion: PRODUCTION_METRICS_SCHEMA_VERSION,
    metricsRunId: randomUUID(),
    timestamp: new Date().toISOString(),
    registrySchemaVersion: registry.schemaVersion,
    registryUpdated: registry.updated,
    ...summary,
    productionDocuments: live.productionDocuments,
    productionQueries: live.productionQueries,
    productionRecallAccuracy: live.productionRecallAccuracy,
    dogfoodSessionCount: live.dogfoodSessionCount,
    phase4ExitGapExternalOrg: summary.externalOrganizations === 0,
  };
}

function renderMetricsBlock(snapshot: ProductionMetricsSnapshot): string {
  return [
    `## metrics_run_id=${snapshot.metricsRunId}`,
    '',
    `- schema_version=${snapshot.schemaVersion}`,
    `- timestamp=${snapshot.timestamp}`,
    `- registry_schema_version=${snapshot.registrySchemaVersion}`,
    `- registry_updated=${snapshot.registryUpdated}`,
    `- production_organizations=${snapshot.productionOrganizations}`,
    `- production_workloads=${snapshot.productionWorkloads}`,
    `- internal_organizations=${snapshot.internalOrganizations}`,
    `- external_organizations=${snapshot.externalOrganizations}`,
    `- internal_workloads=${snapshot.internalWorkloads}`,
    `- external_workloads=${snapshot.externalWorkloads}`,
    `- trusted_organizations=${snapshot.trustedOrganizations}`,
    `- trusted_workloads=${snapshot.trustedWorkloads}`,
    `- north_star_workloads=${snapshot.northStarWorkloads}`,
    `- production_documents=${snapshot.productionDocuments}`,
    `- production_queries=${snapshot.productionQueries}`,
    `- production_recall_accuracy=${snapshot.productionRecallAccuracy}`,
    `- dogfood_session_count=${snapshot.dogfoodSessionCount}`,
    `- phase4_exit_gap_external_org=${snapshot.phase4ExitGapExternalOrg}`,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| production_organizations | ${snapshot.productionOrganizations} |`,
    `| production_workloads | ${snapshot.productionWorkloads} |`,
    `| external_organizations | ${snapshot.externalOrganizations} |`,
    `| external_workloads | ${snapshot.externalWorkloads} |`,
    `| production_documents | ${snapshot.productionDocuments} |`,
    `| production_queries | ${snapshot.productionQueries} |`,
    `| production_recall_accuracy | ${snapshot.productionRecallAccuracy} |`,
    '',
  ].join('\n');
}

async function ensureMetricsMarkdown(): Promise<void> {
  const metricsPath = metricsMarkdownPath();
  await mkdir(orgMemoryReviewsRoot(), { recursive: true });
  try {
    await stat(metricsPath);
  } catch {
    const header = [
      '# Phase 4 Production Metrics',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      `| **Schema version** | ${PRODUCTION_METRICS_SCHEMA_VERSION} |`,
      '| **Registry** | `production-workload-registry.json` |',
      '',
      'North star: `production_workloads` · Proof: `production_organizations`',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(metricsPath, `${header}\n`, 'utf-8');
  }
}

export async function writeProductionMetrics(): Promise<ProductionMetricsSnapshot> {
  const snapshot = await collectProductionMetrics();
  await ensureMetricsMarkdown();
  const metricsPath = metricsMarkdownPath();
  const jsonPath = metricsJsonPath();
  const current = await readFile(metricsPath, 'utf-8');
  await writeFile(metricsPath, `${current.trimEnd()}\n\n${renderMetricsBlock(snapshot)}`, 'utf-8');
  await writeFile(jsonPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf-8');
  return snapshot;
}

async function main(): Promise<void> {
  const snapshot = await writeProductionMetrics();
  console.log(`metrics_run_id=${snapshot.metricsRunId}`);
  console.log(`production_organizations=${snapshot.productionOrganizations}`);
  console.log(`production_workloads=${snapshot.productionWorkloads}`);
  console.log(`external_organizations=${snapshot.externalOrganizations}`);
  console.log(`external_workloads=${snapshot.externalWorkloads}`);
  console.log(`production_documents=${snapshot.productionDocuments}`);
  console.log(`production_queries=${snapshot.productionQueries}`);
  console.log(`production_recall_accuracy=${snapshot.productionRecallAccuracy}`);
  console.log(`phase4_exit_gap_external_org=${snapshot.phase4ExitGapExternalOrg}`);
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  main().catch((error: unknown) => {
    console.error('metrics production gagal:', formatScriptError(error));
    process.exit(1);
  });
}
