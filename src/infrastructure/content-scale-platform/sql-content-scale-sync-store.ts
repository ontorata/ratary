import { generateId, nowISO } from '../../utils/memory-mapper.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { IContentScaleSyncStore } from '../../content-scale-platform/ports/icontent-scale-sync-store.port.js';
import type {
  ContentScaleSyncRun,
  ContentScaleSyncState,
  ContentScaleSyncTarget,
} from '../../content-scale-platform/types/sync.types.js';

interface RunRow {
  id: string;
  target: string;
  mode: string;
  status: string;
  owner_id: string | null;
  stats_json: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

interface StateRow {
  target: string;
  last_watermark: string;
  last_run_id: string | null;
  updated_at: string;
}

function mapRun(row: RunRow): ContentScaleSyncRun {
  return {
    id: row.id,
    target: row.target as ContentScaleSyncRun['target'],
    mode: row.mode as ContentScaleSyncRun['mode'],
    status: row.status as ContentScaleSyncRun['status'],
    ownerId: row.owner_id ?? undefined,
    stats: JSON.parse(row.stats_json),
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
    errorMessage: row.error_message ?? undefined,
  };
}

/** SQL-backed content scale sync store (Phase 22). */
export class SqlContentScaleSyncStore implements IContentScaleSyncStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async startRun(run: Omit<ContentScaleSyncRun, 'finishedAt' | 'errorMessage'>): Promise<void> {
    await this.sql.execute(
      `INSERT INTO content_scale_sync_runs
       (id, target, mode, status, owner_id, stats_json, started_at, finished_at, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [
        run.id,
        run.target,
        run.mode,
        run.status,
        run.ownerId ?? null,
        JSON.stringify(run.stats),
        run.startedAt,
      ],
    );
  }

  async completeRun(
    runId: string,
    update: Pick<ContentScaleSyncRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void> {
    await this.sql.execute(
      `UPDATE content_scale_sync_runs
       SET status = ?, stats_json = ?, finished_at = ?, error_message = ?
       WHERE id = ?`,
      [
        update.status,
        JSON.stringify(update.stats),
        update.finishedAt ?? nowISO(),
        update.errorMessage ?? null,
        runId,
      ],
    );
  }

  async getState(target: ContentScaleSyncTarget): Promise<ContentScaleSyncState | null> {
    const rows = await this.sql.query<StateRow>(
      `SELECT target, last_watermark, last_run_id, updated_at
       FROM content_scale_sync_state WHERE target = ?`,
      [target],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      target: row.target as ContentScaleSyncTarget,
      lastWatermark: row.last_watermark,
      lastRunId: row.last_run_id ?? undefined,
      updatedAt: row.updated_at,
    };
  }

  async setWatermark(target: ContentScaleSyncTarget, watermark: string, runId: string): Promise<void> {
    const updatedAt = nowISO();
    await this.sql.execute(
      `INSERT INTO content_scale_sync_state (target, last_watermark, last_run_id, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(target) DO UPDATE SET
         last_watermark = excluded.last_watermark,
         last_run_id = excluded.last_run_id,
         updated_at = excluded.updated_at`,
      [target, watermark, runId, updatedAt],
    );
  }

  async listRuns(limit = 20): Promise<ContentScaleSyncRun[]> {
    const rows = await this.sql.query<RunRow>(
      `SELECT id, target, mode, status, owner_id, stats_json, started_at, finished_at, error_message
       FROM content_scale_sync_runs
       ORDER BY started_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.map(mapRun);
  }

  async getLatestRun(target: ContentScaleSyncTarget): Promise<ContentScaleSyncRun | null> {
    const rows = await this.sql.query<RunRow>(
      `SELECT id, target, mode, status, owner_id, stats_json, started_at, finished_at, error_message
       FROM content_scale_sync_runs
       WHERE target = ?
       ORDER BY started_at DESC
       LIMIT 1`,
      [target],
    );
    return rows[0] ? mapRun(rows[0]) : null;
  }
}

export class InMemoryContentScaleSyncStore implements IContentScaleSyncStore {
  private readonly runs = new Map<string, ContentScaleSyncRun>();
  private readonly states = new Map<ContentScaleSyncTarget, ContentScaleSyncState>();

  async startRun(run: Omit<ContentScaleSyncRun, 'finishedAt' | 'errorMessage'>): Promise<void> {
    this.runs.set(run.id, { ...run });
  }

  async completeRun(
    runId: string,
    update: Pick<ContentScaleSyncRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) return;
    Object.assign(run, update);
    this.runs.set(runId, run);
  }

  async getState(target: ContentScaleSyncTarget): Promise<ContentScaleSyncState | null> {
    return this.states.get(target) ?? null;
  }

  async setWatermark(target: ContentScaleSyncTarget, watermark: string, runId: string): Promise<void> {
    this.states.set(target, {
      target,
      lastWatermark: watermark,
      lastRunId: runId,
      updatedAt: nowISO(),
    });
  }

  async listRuns(limit = 20): Promise<ContentScaleSyncRun[]> {
    return [...this.runs.values()]
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
  }

  async getLatestRun(target: ContentScaleSyncTarget): Promise<ContentScaleSyncRun | null> {
    return (
      [...this.runs.values()]
        .filter((r) => r.target === target)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null
    );
  }
}

export class NoOpContentScaleSyncStore implements IContentScaleSyncStore {
  async startRun(_run: Omit<ContentScaleSyncRun, 'finishedAt' | 'errorMessage'>): Promise<void> {}
  async completeRun(
    _runId: string,
    _update: Pick<ContentScaleSyncRun, 'status' | 'stats' | 'finishedAt' | 'errorMessage'>,
  ): Promise<void> {}
  async getState(_target: ContentScaleSyncTarget): Promise<ContentScaleSyncState | null> {
    return null;
  }
  async setWatermark(
    _target: ContentScaleSyncTarget,
    _watermark: string,
    _runId: string,
  ): Promise<void> {}
  async listRuns(_limit?: number): Promise<ContentScaleSyncRun[]> {
    return [];
  }
  async getLatestRun(_target: ContentScaleSyncTarget): Promise<ContentScaleSyncRun | null> {
    return null;
  }
}

export function newContentScaleSyncRunId(): string {
  return generateId();
}
