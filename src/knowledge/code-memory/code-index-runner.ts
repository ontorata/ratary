import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { CodeMemoryPorts } from './icode-memory-store.js';
import { extractTsJsCodeGraph, type ExtractCodeGraphInput } from './ts-api-indexer.js';
import { CODE_INDEXER_VERSION } from '../../types/code-memory.js';

export interface RunCodeIndexOptions extends ExtractCodeGraphInput {
  dryRun: boolean;
  ports: CodeMemoryPorts;
  sql?: ISqlDatabase;
}

export interface CodeIndexRunReport {
  dryRun: boolean;
  enabled: boolean;
  indexerVersion: string;
  stats: { filesScanned: number; nodes: number; edges: number };
  runId: string | null;
}

export async function runCodeIndex(options: RunCodeIndexOptions): Promise<CodeIndexRunReport> {
  const extracted = extractTsJsCodeGraph(options);

  if (!options.ports.enabled) {
    return {
      dryRun: options.dryRun,
      enabled: false,
      indexerVersion: extracted.indexerVersion,
      stats: extracted.stats,
      runId: null,
    };
  }

  if (options.dryRun) {
    return {
      dryRun: true,
      enabled: true,
      indexerVersion: extracted.indexerVersion,
      stats: extracted.stats,
      runId: null,
    };
  }

  for (const node of extracted.nodes) {
    await options.ports.nodes.upsertNode(node);
  }
  for (const edge of extracted.edges) {
    await options.ports.edges.upsertEdge(edge);
  }

  const runId = randomUUID();
  if (options.sql) {
    await options.sql.execute(
      `INSERT INTO code_index_runs (
        id, owner_id, repo_fingerprint, git_commit, indexer_version, status, stats_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        runId,
        options.ownerId,
        options.repository,
        options.gitCommit ?? null,
        CODE_INDEXER_VERSION,
        'completed',
        JSON.stringify(extracted.stats),
        new Date().toISOString(),
      ],
    );
  }

  return {
    dryRun: false,
    enabled: true,
    indexerVersion: extracted.indexerVersion,
    stats: extracted.stats,
    runId,
  };
}
