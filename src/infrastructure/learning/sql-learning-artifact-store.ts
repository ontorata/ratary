import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { ILearningArtifactStore } from '../../learning/ilearning-artifact-store.port.js';
import type { LearningScope, RankingPolicySnapshot } from '../../learning/learning.types.js';

const SNAPSHOT_TYPE_RANKING = 'ranking';

export class SqlLearningArtifactStore implements ILearningArtifactStore {
  constructor(private readonly db: ISqlDatabase) {}

  async saveRankingSnapshot(
    snapshot: RankingPolicySnapshot,
    options?: { activate?: boolean },
  ): Promise<void> {
    if (options?.activate) {
      await this.db.execute(
        `UPDATE learning_policy_snapshots
         SET active = 0
         WHERE owner_id = ? AND snapshot_type = ?
           AND (workspace_id IS ? OR workspace_id = ?)`,
        [
          snapshot.ownerId,
          SNAPSHOT_TYPE_RANKING,
          snapshot.workspaceId ?? null,
          snapshot.workspaceId ?? null,
        ],
      );
    }

    await this.db.execute(
      `INSERT INTO learning_policy_snapshots (
        id, owner_id, workspace_id, snapshot_type, payload, active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        snapshot.snapshotId,
        snapshot.ownerId,
        snapshot.workspaceId ?? null,
        SNAPSHOT_TYPE_RANKING,
        JSON.stringify(snapshot),
        options?.activate ? 1 : 0,
        snapshot.createdAt,
      ],
    );
  }

  async getActiveRankingSnapshot(scope: LearningScope): Promise<RankingPolicySnapshot | null> {
    const rows = await this.db.query<{ payload: string }>(
      `SELECT payload FROM learning_policy_snapshots
       WHERE owner_id = ? AND snapshot_type = ? AND active = 1
         AND (workspace_id IS ? OR workspace_id = ?)
       ORDER BY created_at DESC
       LIMIT 1`,
      [scope.ownerId, SNAPSHOT_TYPE_RANKING, scope.workspaceId ?? null, scope.workspaceId ?? null],
    );

    if (rows.length === 0) {
      return null;
    }

    return JSON.parse(rows[0].payload) as RankingPolicySnapshot;
  }
}
