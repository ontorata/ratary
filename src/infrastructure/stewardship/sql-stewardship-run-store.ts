import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { StewardshipRunReport } from '../../memory/stewardship/imemory-stewardship-orchestrator.interface.js';
import type { IStewardshipRunStore } from '../../memory/stewardship/istewardship-run-store.interface.js';

interface RunRow {
  run_id: string;
  owner_id: string;
  project_id: string | null;
  dry_run: number;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  report_json: string;
  had_errors: number;
}

const DEFAULT_LIMIT = 50;

/** SQL-backed stewardship run history (Phase 04.7 follow-up). */
export class SqlStewardshipRunStore implements IStewardshipRunStore {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly cap: number = DEFAULT_LIMIT,
  ) {}

  async save(report: StewardshipRunReport): Promise<void> {
    await this.sql.execute(
      `INSERT INTO stewardship_runs
       (run_id, owner_id, project_id, dry_run, started_at, finished_at, duration_ms, report_json, had_errors)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.runId,
        report.ownerId,
        report.projectId ?? null,
        report.dryRun ? 1 : 0,
        report.startedAt,
        report.finishedAt,
        report.durationMs,
        JSON.stringify(report),
        report.hadErrors ? 1 : 0,
      ],
    );
  }

  async list(ownerId: string, limit = this.cap): Promise<StewardshipRunReport[]> {
    const rows = await this.sql.query<RunRow>(
      `SELECT run_id, owner_id, project_id, dry_run, started_at, finished_at, duration_ms, report_json, had_errors
       FROM stewardship_runs
       WHERE owner_id = ?
       ORDER BY started_at DESC
       LIMIT ?`,
      [ownerId, limit],
    );
    return rows.map((row) => JSON.parse(row.report_json) as StewardshipRunReport);
  }

  async latest(ownerId: string): Promise<StewardshipRunReport | null> {
    const rows = await this.list(ownerId, 1);
    return rows[0] ?? null;
  }
}
