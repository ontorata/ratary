import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { nowISO } from '../../utils/memory-mapper.js';
import type { IPluginAllowList } from '../../infrastructure-platform/ports/iplugin-allow-list.port.js';

/** SQL-backed tenant plugin allow-list (Phase 18 integration). */
export class SqlPluginAllowList implements IPluginAllowList {
  constructor(private readonly sql: ISqlDatabase) {}

  async isAllowed(organizationId: string, pluginId: string): Promise<boolean> {
    const rows = await this.sql.query<{ allowed: number }>(
      `SELECT allowed FROM plugin_allow_list
       WHERE organization_id = ? AND plugin_id = ?`,
      [organizationId, pluginId],
    );
    if (rows.length === 0) return true;
    return rows[0]!.allowed === 1;
  }

  async listAllowed(organizationId: string): Promise<string[]> {
    const rows = await this.sql.query<{ plugin_id: string }>(
      `SELECT plugin_id FROM plugin_allow_list
       WHERE organization_id = ? AND allowed = 1`,
      [organizationId],
    );
    return rows.map((r) => r.plugin_id);
  }

  async allow(organizationId: string, pluginId: string): Promise<void> {
    const updatedAt = nowISO();
    await this.sql.execute(
      `INSERT INTO plugin_allow_list (organization_id, plugin_id, allowed, updated_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(organization_id, plugin_id) DO UPDATE SET allowed = 1, updated_at = excluded.updated_at`,
      [organizationId, pluginId, updatedAt],
    );
  }

  async deny(organizationId: string, pluginId: string): Promise<void> {
    const updatedAt = nowISO();
    await this.sql.execute(
      `INSERT INTO plugin_allow_list (organization_id, plugin_id, allowed, updated_at)
       VALUES (?, ?, 0, ?)
       ON CONFLICT(organization_id, plugin_id) DO UPDATE SET allowed = 0, updated_at = excluded.updated_at`,
      [organizationId, pluginId, updatedAt],
    );
  }
}
