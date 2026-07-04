import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { workspaceIdFromScope } from '../../repositories/repository-scope.js';
import { generateId, nowISO } from '../../utils/memory-mapper.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { IFederationMetadataStore } from '../../federation/ports/ifederation-metadata-store.port.js';
import type { FederationExchangeResult } from '../../federation/types/federation-exchange.types.js';

/** SQL-backed federation cursors, trust links, and exchange audit (ADR-029 Phase 14). */
export class SqlFederationMetadataStore implements IFederationMetadataStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async getSyncCursor(peerId: string, scope: MemoryScope): Promise<string | null> {
    const workspaceId = workspaceIdFromScope(scope) ?? null;
    const rows = await this.sql.query<{ cursor_value: string }>(
      `SELECT cursor_value FROM federation_sync_cursors
       WHERE peer_id = ? AND owner_id = ?
         AND ((workspace_id IS NULL AND ? IS NULL) OR workspace_id = ?)`,
      [peerId, scope.ownerId, workspaceId, workspaceId],
    );
    return rows[0]?.cursor_value ?? null;
  }

  async setSyncCursor(peerId: string, scope: MemoryScope, cursor: string): Promise<void> {
    const workspaceId = workspaceIdFromScope(scope) ?? null;
    const updatedAt = nowISO();
    const existing = await this.getSyncCursor(peerId, scope);
    if (existing !== null) {
      await this.sql.execute(
        `UPDATE federation_sync_cursors SET cursor_value = ?, updated_at = ?
         WHERE peer_id = ? AND owner_id = ?
           AND ((workspace_id IS NULL AND ? IS NULL) OR workspace_id = ?)`,
        [cursor, updatedAt, peerId, scope.ownerId, workspaceId, workspaceId],
      );
      return;
    }
    await this.sql.execute(
      `INSERT INTO federation_sync_cursors (id, peer_id, owner_id, workspace_id, cursor_value, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [generateId(), peerId, scope.ownerId, workspaceId, cursor, updatedAt],
    );
  }

  async recordExchange(result: FederationExchangeResult): Promise<void> {
    await this.sql.execute(
      `INSERT INTO federation_exchange_log (id, peer_id, direction, accepted, rejected, bundle_id, cursor_value, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        result.peerId,
        result.direction,
        result.accepted,
        result.rejected,
        result.bundleId ?? null,
        result.cursor ?? null,
        result.timestamp,
      ],
    );
  }

  async getLastExchangeAt(peerId: string): Promise<string | null> {
    const rows = await this.sql.query<{ created_at: string }>(
      `SELECT created_at FROM federation_exchange_log
       WHERE peer_id = ? ORDER BY created_at DESC LIMIT 1`,
      [peerId],
    );
    return rows[0]?.created_at ?? null;
  }

  async upsertPeerTrust(peerId: string, trusted: boolean, organizationId?: string): Promise<void> {
    await this.sql.execute(
      `INSERT INTO federation_peers (peer_id, organization_id, trusted, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(peer_id, organization_id) DO UPDATE SET
         trusted = excluded.trusted,
         updated_at = excluded.updated_at`,
      [peerId, organizationId ?? '', trusted ? 1 : 0, nowISO()],
    );
  }

  async isPeerTrusted(peerId: string, organizationId?: string): Promise<boolean> {
    const rows = await this.sql.query<{ trusted: number }>(
      `SELECT trusted FROM federation_peers
       WHERE peer_id = ? AND organization_id = ? AND trusted = 1`,
      [peerId, organizationId ?? ''],
    );
    return Boolean(rows[0]?.trusted);
  }
}
