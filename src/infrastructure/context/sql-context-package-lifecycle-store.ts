import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  ContextPackageLifecycleRecord,
  IContextPackageLifecycleStore,
} from '../../ports/context/icontext-package-lifecycle-store.port.js';
import type { ContextPackageLifecycleState } from '../../memory/context-package-envelope.js';

interface ContextPackageRow {
  package_id: string;
  owner_id: string;
  lifecycle_state: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ContextPackageRow): ContextPackageLifecycleRecord {
  return {
    packageId: row.package_id,
    ownerId: row.owner_id,
    lifecycleState: row.lifecycle_state as ContextPackageLifecycleState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SqlContextPackageLifecycleStore implements IContextPackageLifecycleStore {
  constructor(private readonly db: ISqlDatabase) {}

  async insertActive(input: {
    packageId: string;
    ownerId: string;
    createdAt: string;
  }): Promise<void> {
    await this.db.execute(
      `INSERT INTO context_packages (package_id, owner_id, lifecycle_state, created_at, updated_at)
       VALUES (?, ?, 'active', ?, ?)
       ON CONFLICT(package_id) DO NOTHING`,
      [input.packageId, input.ownerId, input.createdAt, input.createdAt],
    );
  }

  async get(ownerId: string, packageId: string): Promise<ContextPackageLifecycleRecord | null> {
    const rows = await this.db.query<ContextPackageRow>(
      `SELECT package_id, owner_id, lifecycle_state, created_at, updated_at
       FROM context_packages
       WHERE owner_id = ? AND package_id = ?`,
      [ownerId, packageId],
    );
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async updateState(
    ownerId: string,
    packageId: string,
    lifecycleState: ContextPackageLifecycleState,
    updatedAt: string,
  ): Promise<boolean> {
    const result = await this.db.execute(
      `UPDATE context_packages
       SET lifecycle_state = ?, updated_at = ?
       WHERE owner_id = ? AND package_id = ?`,
      [lifecycleState, updatedAt, ownerId, packageId],
    );
    return (result.meta?.changes ?? 0) > 0;
  }
}
