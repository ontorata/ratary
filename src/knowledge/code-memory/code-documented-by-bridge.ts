/**
 * Stewardship-only bridge: validated memory.source_path → CODE_DOCUMENTED_BY (ADR-070 C6).
 * Never invoked from save_memory / memory write hot path.
 */
import { randomUUID } from 'node:crypto';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { CodeMemoryPorts } from './icode-memory-store.js';
import { CODE_INDEXER_VERSION } from '../../types/code-memory.js';
import { stableCodeId } from './stable-code-id.js';

export interface BridgeCodeDocumentedByOptions {
  ownerId: string;
  repository: string;
  dryRun: boolean;
  ports: CodeMemoryPorts;
  sql: ISqlDatabase;
  /** Optional project filter on memories.project_id / project column. */
  projectId?: string;
}

export interface BridgeCodeDocumentedByReport {
  dryRun: boolean;
  enabled: boolean;
  candidates: number;
  created: number;
  skipped: number;
}

export async function bridgeCodeDocumentedBy(
  options: BridgeCodeDocumentedByOptions,
): Promise<BridgeCodeDocumentedByReport> {
  if (!options.ports.enabled) {
    return { dryRun: options.dryRun, enabled: false, candidates: 0, created: 0, skipped: 0 };
  }

  const projectClause = options.projectId ? 'AND (project_id = ? OR project = ?)' : '';
  const params: unknown[] = [options.ownerId];
  if (options.projectId) params.push(options.projectId, options.projectId);

  const rows = await options.sql.query<{
    id: string;
    source_path: string | null;
  }>(
    `SELECT id, source_path FROM memories
     WHERE owner_id = ?
       AND archived = 0
       AND source_path IS NOT NULL
       AND length(trim(source_path)) > 0
       ${projectClause}`,
    params,
  );

  let created = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const row of rows) {
    const path = String(row.source_path ?? '')
      .trim()
      .replace(/\\/g, '/');
    if (!path) {
      skipped += 1;
      continue;
    }

    const fileKey = `file:${options.repository}:${path}`;
    let codeNode = await options.ports.nodes.getByStableKey(options.ownerId, fileKey);
    if (!codeNode) {
      // Accept repo-relative paths already prefixed, or bare paths.
      skipped += 1;
      continue;
    }

    const existing = await options.ports.bridges.listByCodeNode(options.ownerId, codeNode.id, [
      'CODE_DOCUMENTED_BY',
    ]);
    if (existing.some((b) => b.targetId === row.id)) {
      skipped += 1;
      continue;
    }

    if (options.dryRun) {
      created += 1;
      continue;
    }

    await options.ports.bridges.upsertBridge({
      id: randomUUID(),
      ownerId: options.ownerId,
      type: 'CODE_DOCUMENTED_BY',
      codeNodeId: codeNode.id,
      targetId: row.id,
      targetPlane: 'memory',
      evidence: {
        indexerVersion: CODE_INDEXER_VERSION,
        rule: 'source_path_exact',
        sourcePath: path,
        stableKey: fileKey,
        codeNodeIdDeterministic: stableCodeId(options.ownerId, fileKey),
      },
      createdAt: now,
    });
    created += 1;
  }

  return {
    dryRun: options.dryRun,
    enabled: true,
    candidates: rows.length,
    created,
    skipped,
  };
}
