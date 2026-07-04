import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { IInspectionPatternStore } from '../../learning/inspection/iinspection-pattern-store.interface.js';
import type {
  InspectionPattern,
  InspectionPatternContradiction,
  InspectionPatternScope,
  InspectionPatternTrigger,
} from '../../learning/inspection/inspection-pattern.types.js';
import type { InspectionOutcomeCategory } from '../../ingest/memory-quality-signal.types.js';

interface PatternRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  organization_id: string | null;
  memory_id: string | null;
  pattern_key: string;
  pattern_scope: string;
  category: string;
  trigger_json: string;
  description: string;
  confidence: number;
  evidence_count: number;
  protected: number;
  disabled: number;
  lifecycle_state: string;
  last_confirmed_at: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: PatternRow): InspectionPattern {
  return {
    id: row.id,
    ownerId: row.owner_id,
    workspaceId: row.workspace_id ?? undefined,
    organizationId: row.organization_id ?? undefined,
    memoryId: row.memory_id ?? undefined,
    patternKey: row.pattern_key,
    patternScope: row.pattern_scope as InspectionPatternScope,
    category: row.category as InspectionOutcomeCategory,
    trigger: JSON.parse(row.trigger_json) as InspectionPatternTrigger,
    description: row.description,
    confidence: row.confidence,
    evidenceCount: row.evidence_count,
    protected: row.protected === 1,
    disabled: row.disabled === 1,
    lifecycleState: row.lifecycle_state as InspectionPattern['lifecycleState'],
    lastConfirmedAt: row.last_confirmed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SqlInspectionPatternStore implements IInspectionPatternStore {
  constructor(private readonly db: ISqlDatabase) {}

  async upsert(pattern: InspectionPattern): Promise<InspectionPattern> {
    await this.db.execute(
      `INSERT INTO inspection_patterns (
        id, owner_id, workspace_id, organization_id, memory_id, pattern_key, pattern_scope,
        category, trigger_json, description, confidence, evidence_count, protected, disabled,
        lifecycle_state, last_confirmed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        memory_id = excluded.memory_id,
        description = excluded.description,
        confidence = excluded.confidence,
        evidence_count = excluded.evidence_count,
        lifecycle_state = excluded.lifecycle_state,
        last_confirmed_at = excluded.last_confirmed_at,
        updated_at = excluded.updated_at`,
      [
        pattern.id,
        pattern.ownerId,
        pattern.workspaceId ?? null,
        pattern.organizationId ?? null,
        pattern.memoryId ?? null,
        pattern.patternKey,
        pattern.patternScope,
        pattern.category,
        JSON.stringify(pattern.trigger),
        pattern.description,
        pattern.confidence,
        pattern.evidenceCount,
        pattern.protected ? 1 : 0,
        pattern.disabled ? 1 : 0,
        pattern.lifecycleState,
        pattern.lastConfirmedAt,
        pattern.createdAt,
        pattern.updatedAt,
      ],
    );
    return pattern;
  }

  async findByPatternKey(
    scope: MemoryScope,
    patternKey: string,
    patternScope: InspectionPatternScope,
  ): Promise<InspectionPattern | null> {
    if (patternScope === 'organization') {
      const rows = await this.db.query<PatternRow>(
        `SELECT * FROM inspection_patterns
         WHERE owner_id = ? AND pattern_key = ? AND pattern_scope = 'organization'
         LIMIT 1`,
        [scope.ownerId, patternKey],
      );
      return rows[0] ? mapRow(rows[0]) : null;
    }

    const rows = await this.db.query<PatternRow>(
      `SELECT * FROM inspection_patterns
       WHERE owner_id = ? AND pattern_key = ? AND pattern_scope = ?
         AND (workspace_id IS ? OR workspace_id = ?)
       LIMIT 1`,
      [
        scope.ownerId,
        patternKey,
        patternScope,
        scope.workspaceId ?? null,
        scope.workspaceId ?? null,
      ],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async list(
    scope: MemoryScope,
    options?: { includeArchived?: boolean },
  ): Promise<InspectionPattern[]> {
    const rows = await this.db.query<PatternRow>(
      `SELECT * FROM inspection_patterns
       WHERE owner_id = ?
         AND (workspace_id IS ? OR workspace_id = ?)
         AND (? = 1 OR lifecycle_state != 'archived')
       ORDER BY confidence DESC, updated_at DESC`,
      [
        scope.ownerId,
        scope.workspaceId ?? null,
        scope.workspaceId ?? null,
        options?.includeArchived ? 1 : 0,
      ],
    );
    return rows.map(mapRow);
  }

  async listActiveForRecall(scope: MemoryScope, pathPrefix?: string): Promise<InspectionPattern[]> {
    const patterns = await this.list(scope);
    return patterns.filter((pattern) => {
      if (pattern.disabled || pattern.lifecycleState === 'archived') {
        return false;
      }
      if (pattern.confidence < 30) {
        return false;
      }
      if (!pathPrefix) {
        return true;
      }
      return pattern.trigger.paths?.some((path) => path.startsWith(pathPrefix)) ?? false;
    });
  }

  async appendEventLink(patternId: string, signalId: string, observedAt: string): Promise<void> {
    await this.db.execute(
      `INSERT INTO inspection_pattern_events (id, pattern_id, signal_id, observed_at)
       VALUES (?, ?, ?, ?)`,
      [crypto.randomUUID(), patternId, signalId, observedAt],
    );
  }

  async recordContradiction(contradiction: InspectionPatternContradiction): Promise<void> {
    await this.db.execute(
      `INSERT INTO inspection_pattern_contradictions (
        id, owner_id, pattern_id_a, pattern_id_b, reason, detected_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        contradiction.id,
        contradiction.ownerId,
        contradiction.patternIdA,
        contradiction.patternIdB,
        contradiction.reason,
        contradiction.detectedAt,
      ],
    );
  }

  async listContradictions(scope: MemoryScope): Promise<InspectionPatternContradiction[]> {
    const rows = await this.db.query<{
      id: string;
      owner_id: string;
      pattern_id_a: string;
      pattern_id_b: string;
      reason: string;
      detected_at: string;
    }>(
      `SELECT * FROM inspection_pattern_contradictions WHERE owner_id = ? ORDER BY detected_at DESC`,
      [scope.ownerId],
    );
    return rows.map((row) => ({
      id: row.id,
      ownerId: row.owner_id,
      patternIdA: row.pattern_id_a,
      patternIdB: row.pattern_id_b,
      reason: row.reason,
      detectedAt: row.detected_at,
    }));
  }

  async countWorkspacesByPatternKey(ownerId: string, patternKey: string): Promise<number> {
    const rows = await this.db.query<{ count: number }>(
      `SELECT COUNT(DISTINCT workspace_id) as count
       FROM inspection_patterns
       WHERE owner_id = ? AND pattern_key = ? AND pattern_scope = 'workspace' AND workspace_id IS NOT NULL`,
      [ownerId, patternKey],
    );
    return rows[0]?.count ?? 0;
  }

  async updateLifecycle(
    patternId: string,
    updates: Pick<
      InspectionPattern,
      'confidence' | 'lifecycleState' | 'lastConfirmedAt' | 'updatedAt'
    >,
  ): Promise<void> {
    await this.db.execute(
      `UPDATE inspection_patterns
       SET confidence = ?, lifecycle_state = ?, last_confirmed_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        updates.confidence,
        updates.lifecycleState,
        updates.lastConfirmedAt,
        updates.updatedAt,
        patternId,
      ],
    );
  }
}
