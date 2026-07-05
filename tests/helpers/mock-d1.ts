import type { D1Client, D1QueryResult } from '../../src/db/d1-client.js';
import type { MemoryRow, MemoryLevel } from '../../src/types/memory.js';
import type { IdentityRow } from '../../src/auth/auth.types.js';

interface ClientRow {
  id: string;
  name: string;
  type: string;
  description: string;
  metadata: string;
  owner_id: string;
  created_at: string;
  active: number;
  [key: string]: unknown;
}

interface WorkspaceRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
  organization_id?: string | null;
  [key: string]: unknown;
}

interface OrganizationRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface WorkspaceMembershipRow {
  id: string;
  organization_id: string;
  workspace_id: string;
  identity_id: string;
  role: string;
  created_at: string;
}

interface AgentRow {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  client_id: string | null;
  agent_type: string;
  metadata: string;
  created_at: string;
  active: number;
  [key: string]: unknown;
}

interface MemoryEmbeddingRow {
  id: string;
  memory_id: string;
  owner_id: string;
  model_id: string;
  dimensions: number;
  vector_json: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class MockD1Client implements D1Client {
  private memories: Map<string, MemoryRow> = new Map();
  private memoryEmbeddings: Map<string, MemoryEmbeddingRow> = new Map();
  private relations: Map<string, Record<string, unknown>> = new Map();
  private identities: Map<string, IdentityRow> = new Map();
  private identityByHash: Map<string, string> = new Map();
  private clients: Map<string, ClientRow> = new Map();
  private workspaces: Map<string, WorkspaceRow> = new Map();
  private organizations: Map<string, OrganizationRow> = new Map();
  private workspaceMemberships: Map<string, WorkspaceMembershipRow> = new Map();
  private agents: Map<string, AgentRow> = new Map();
  private memorySignals: Map<string, Record<string, unknown>> = new Map();
  private settings: Map<string, string> = new Map();
  private auditLogs: unknown[] = [];
  private cloudRegions: Map<string, Record<string, unknown>> = new Map();
  private cloudTenantMetadata: Map<string, Record<string, unknown>> = new Map();
  private cloudWorkspaceRegions: Map<string, Record<string, unknown>> = new Map();
  private cloudUsageRecords: Map<string, Record<string, unknown>> = new Map();
  private cloudDrSchedules: Map<string, Record<string, unknown>> = new Map();
  private pluginRegistry: Map<string, Record<string, unknown>> = new Map();
  private pluginAllowList: Map<string, Record<string, unknown>> = new Map();
  private searchGraphSyncRuns: Map<string, Record<string, unknown>> = new Map();
  private searchGraphSyncState: Map<string, Record<string, unknown>> = new Map();
  private contentScaleSyncRuns: Map<string, Record<string, unknown>> = new Map();
  private contentScaleSyncState: Map<string, Record<string, unknown>> = new Map();
  private knowledgeFabricIngestRuns: Map<string, Record<string, unknown>> = new Map();
  private knowledgeFabricConnectorState: Map<string, Record<string, unknown>> = new Map();
  private knowledgeFabricExternalRefs: Map<string, Record<string, unknown>> = new Map();
  private platformWebhookSubscriptions: Map<string, Record<string, unknown>> = new Map();
  private intelligenceTelemetryEvents: Map<string, Record<string, unknown>> = new Map();
  private intelligenceSyncState: Map<string, Record<string, unknown>> = new Map();
  private intelligenceOfflineJournal: Map<string, Record<string, unknown>> = new Map();
  private stewardshipRuns: Map<string, Record<string, unknown>> = new Map();
  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.execute(sql, params);
    return result.results as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1QueryResult> {
    const normalizedSql = sql.trim().toUpperCase();

    if (normalizedSql.startsWith('CREATE TABLE') || normalizedSql.startsWith('CREATE INDEX')) {
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql.startsWith('PRAGMA TABLE_INFO')) {
      const columns = [
        { name: 'id' },
        { name: 'title' },
        { name: 'project' },
        { name: 'content' },
        { name: 'summary' },
        { name: 'tags' },
        { name: 'favorite' },
        { name: 'archived' },
        { name: 'owner_id' },
        { name: 'created_at' },
        { name: 'updated_at' },
        { name: 'codename' },
        { name: 'slug' },
        { name: 'keywords' },
        { name: 'category' },
        { name: 'memory_type' },
        { name: 'importance' },
        { name: 'language' },
        { name: 'notes' },
        { name: 'project_id' },
        { name: 'level' },
        { name: 'last_accessed' },
        { name: 'access_count' },
        { name: 'embedding_id' },
        { name: 'object_key' },
        { name: 'semantic_hash' },
        { name: 'aliases' },
        { name: 'source_path' },
        { name: 'workspace_id' },
        { name: 'last_modified_by_agent_id' },
        { name: 'lifecycle_state' },
      ];
      return { results: columns, success: true };
    }

    if (normalizedSql.startsWith('ALTER TABLE')) {
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (
      normalizedSql === 'BEGIN IMMEDIATE' ||
      normalizedSql === 'COMMIT' ||
      normalizedSql === 'ROLLBACK'
    ) {
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql.includes('SELECT 1 AS OK')) {
      return { results: [{ ok: 1 }], success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO IDENTITIES')) {
      const expiresAt = params.length >= 11 ? (params[10] as string | null) : null;
      const createdAt = params[9] as string;
      const row: IdentityRow = {
        id: params[0] as string,
        type: params[1] as string,
        name: params[2] as string,
        secret_hash: params[3] as string | null,
        owner_id: params[4] as string,
        description: params[5] as string,
        metadata: params[6] as string,
        client_id: params[7] as string | null,
        created_by: params[8] as string | null,
        created_at: createdAt,
        last_used_at: null,
        expires_at: expiresAt,
        revoked_at: null,
        active: 1,
      };
      this.identities.set(row.id, row);
      if (row.secret_hash) this.identityByHash.set(row.secret_hash, row.id);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO CLIENTS')) {
      const row: ClientRow = {
        id: params[0] as string,
        name: params[1] as string,
        type: params[2] as string,
        description: params[3] as string,
        metadata: params[4] as string,
        owner_id: (params[5] as string) ?? '',
        created_at: params[6] as string,
        active: 1,
      };
      this.clients.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('SELECT * FROM CLIENTS WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      const rows = [...this.clients.values()]
        .filter((c) => c.owner_id === ownerId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT * FROM CLIENTS WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.clients.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO WORKSPACES')) {
      const row: WorkspaceRow = {
        id: params[0] as string,
        owner_id: params[1] as string,
        name: params[2] as string,
        slug: params[3] as string,
        created_at: params[4] as string,
        organization_id: null,
      };
      this.workspaces.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO ORGANIZATIONS')) {
      const row: OrganizationRow = {
        id: params[0] as string,
        owner_id: params[1] as string,
        name: params[2] as string,
        slug: params[3] as string,
        created_at: params[4] as string,
      };
      this.organizations.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO WORKSPACE_MEMBERSHIPS')) {
      const row: WorkspaceMembershipRow = {
        id: params[0] as string,
        organization_id: params[1] as string,
        workspace_id: params[2] as string,
        identity_id: params[3] as string,
        role: params[4] as string,
        created_at: params[5] as string,
      };
      this.workspaceMemberships.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (
      normalizedSql.includes('FROM WORKSPACE_MEMBERSHIPS') &&
      normalizedSql.includes('WHERE WORKSPACE_ID = ? AND IDENTITY_ID = ?')
    ) {
      const [workspaceId, identityId] = params as [string, string];
      const row = [...this.workspaceMemberships.values()].find(
        (m) => m.workspace_id === workspaceId && m.identity_id === identityId,
      );
      return { results: row ? [{ role: row.role }] : [], success: true };
    }

    if (normalizedSql.startsWith('UPDATE WORKSPACE_MEMBERSHIPS SET ROLE = ?')) {
      const [role, workspaceId, identityId] = params as [string, string, string];
      const row = [...this.workspaceMemberships.values()].find(
        (m) => m.workspace_id === workspaceId && m.identity_id === identityId,
      );
      if (row) {
        row.role = role;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM WORKSPACE_MEMBERSHIPS')) {
      const [workspaceId, identityId] = params as [string, string];
      for (const [key, row] of this.workspaceMemberships.entries()) {
        if (row.workspace_id === workspaceId && row.identity_id === identityId) {
          this.workspaceMemberships.delete(key);
        }
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE WORKSPACES SET ORGANIZATION_ID = ? WHERE ID = ?')) {
      const [organizationId, workspaceId] = params as [string, string];
      const row = this.workspaces.get(workspaceId);
      if (row) {
        row.organization_id = organizationId;
        this.workspaces.set(workspaceId, row);
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (
      normalizedSql.includes('UPDATE WORKSPACES SET ORGANIZATION_ID = ?') &&
      normalizedSql.includes('OWNER_ID = ?') &&
      normalizedSql.includes('ORGANIZATION_ID IS NULL')
    ) {
      const [organizationId, ownerId] = params as [string, string];
      let changes = 0;
      for (const [id, row] of this.workspaces.entries()) {
        if (
          row.owner_id === ownerId &&
          (row.organization_id === null ||
            row.organization_id === undefined ||
            row.organization_id === '')
        ) {
          row.organization_id = organizationId;
          this.workspaces.set(id, row);
          changes++;
        }
      }
      return { results: [], success: true, meta: { changes } };
    }

    if (
      normalizedSql.includes('FROM WORKSPACES') &&
      normalizedSql.includes('ORGANIZATION_ID IS NULL')
    ) {
      const owners = new Set<string>();
      for (const row of this.workspaces.values()) {
        if (
          row.organization_id === null ||
          row.organization_id === undefined ||
          row.organization_id === ''
        ) {
          owners.add(row.owner_id);
        }
      }
      return {
        results: [...owners].map((owner_id) => ({ owner_id })),
        success: true,
      };
    }

    if (
      normalizedSql.includes('FROM ORGANIZATIONS') &&
      normalizedSql.includes('WHERE OWNER_ID = ? AND SLUG = ?')
    ) {
      const [ownerId, slug] = params as [string, string];
      const row = [...this.organizations.values()].find(
        (org) => org.owner_id === ownerId && org.slug === slug,
      );
      return { results: row ? [{ id: row.id }] : [], success: true };
    }

    if (
      normalizedSql.includes('COUNT(*) AS COUNT FROM WORKSPACES') &&
      normalizedSql.includes('ORGANIZATION_ID IS NULL')
    ) {
      const count = [...this.workspaces.values()].filter(
        (row) =>
          row.organization_id === null ||
          row.organization_id === undefined ||
          row.organization_id === '',
      ).length;
      return { results: [{ count }], success: true };
    }

    if (
      normalizedSql.includes('FROM WORKSPACES') &&
      normalizedSql.includes('WHERE ID = ? AND OWNER_ID = ?')
    ) {
      const [id, ownerId] = params as [string, string];
      const row = [...this.workspaces.values()].find((w) => w.id === id && w.owner_id === ownerId);
      return {
        results: row ? [{ ...row, organization_id: row.organization_id ?? null }] : [],
        success: true,
      };
    }

    if (
      normalizedSql.includes('FROM WORKSPACES') &&
      normalizedSql.includes('WHERE OWNER_ID = ? AND SLUG = ?')
    ) {
      const [ownerId, slug] = params as [string, string];
      const row = [...this.workspaces.values()].find(
        (w) => w.owner_id === ownerId && w.slug === slug,
      );
      return { results: row ? [row] : [], success: true };
    }

    if (
      normalizedSql.includes('FROM WORKSPACES') &&
      normalizedSql.includes('WHERE OWNER_ID = ?') &&
      normalizedSql.includes('ORDER BY CREATED_AT ASC')
    ) {
      const ownerId = params[0] as string;
      const rows = [...this.workspaces.values()]
        .filter((w) => w.owner_id === ownerId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      return { results: rows, success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO AGENTS')) {
      const row = {
        id: params[0] as string,
        workspace_id: params[1] as string,
        owner_id: params[2] as string,
        name: params[3] as string,
        client_id: (params[4] as string | null) ?? null,
        agent_type: params[5] as string,
        metadata: params[6] as string,
        created_at: params[7] as string,
        active: 1,
      };
      this.agents.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (
      normalizedSql.includes('FROM AGENTS') &&
      normalizedSql.includes('WHERE ID = ? AND OWNER_ID = ? AND WORKSPACE_ID = ?')
    ) {
      const [id, ownerId, workspaceId] = params as [string, string, string];
      const activeOnly = normalizedSql.includes('AND ACTIVE = 1');
      const row = this.agents.get(id);
      const match =
        row &&
        row.owner_id === ownerId &&
        row.workspace_id === workspaceId &&
        (!activeOnly || row.active === 1);
      return { results: match ? [row] : [], success: true };
    }

    if (
      normalizedSql.includes('FROM AGENTS') &&
      normalizedSql.includes('WHERE OWNER_ID = ? AND WORKSPACE_ID = ?') &&
      normalizedSql.includes('ORDER BY CREATED_AT DESC')
    ) {
      const [ownerId, workspaceId] = params as [string, string];
      const rows = [...this.agents.values()]
        .filter((a) => a.owner_id === ownerId && a.workspace_id === workspaceId && a.active === 1)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('UPDATE CLIENTS')) {
      const id = params[5] as string;
      const ownerId = params[6] as string;
      const row = this.clients.get(id);
      if (row && row.owner_id === ownerId) {
        row.name = params[0] as string;
        row.type = params[1] as string;
        row.description = params[2] as string;
        row.metadata = params[3] as string;
        row.active = params[4] as number;
        this.clients.set(id, row);
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('INSERT INTO SETTINGS')) {
      const key = params[0] as string;
      const value = params[1] as string;
      this.settings.set(key, value);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO AUDIT_LOGS')) {
      this.auditLogs.push(params);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.identities.get(id);
      return { results: row ? ([row] as unknown as Record<string, unknown>[]) : [], success: true };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES WHERE SECRET_HASH = ?')) {
      const hash = params[0] as string;
      const id = this.identityByHash.get(hash);
      const row = id ? this.identities.get(id) : undefined;
      return { results: row ? ([row] as unknown as Record<string, unknown>[]) : [], success: true };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      const rows = [...this.identities.values()].filter((i) => i.owner_id === ownerId);
      return { results: rows as unknown as Record<string, unknown>[], success: true };
    }

    if (normalizedSql.includes('SELECT * FROM IDENTITIES ORDER BY')) {
      const rows = [...this.identities.values()].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
      return { results: rows as unknown as Record<string, unknown>[], success: true };
    }

    if (normalizedSql.includes('SELECT COUNT(*) AS COUNT FROM IDENTITIES')) {
      return { results: [{ count: this.identities.size }], success: true };
    }

    if (normalizedSql.includes('UPDATE IDENTITIES SET LAST_USED_AT')) {
      const id = params[1] as string;
      const row = this.identities.get(id);
      if (row) {
        row.last_used_at = params[0] as string;
        this.identities.set(id, row);
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('UPDATE IDENTITIES SET ACTIVE = 0')) {
      const id = params[1] as string;
      const row = this.identities.get(id);
      if (row) {
        row.active = 0;
        row.revoked_at = params[0] as string;
        this.identities.set(id, row);
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('UPDATE IDENTITIES SET SECRET_HASH = ?')) {
      const id = params[1] as string;
      const row = this.identities.get(id);
      if (row) {
        if (row.secret_hash) this.identityByHash.delete(row.secret_hash);
        row.secret_hash = params[0] as string;
        row.last_used_at = null;
        this.identities.set(id, row);
        if (row.secret_hash) this.identityByHash.set(row.secret_hash, id);
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('SELECT VALUE FROM SETTINGS WHERE KEY = ?')) {
      const value = this.settings.get(params[0] as string);
      return { results: value !== undefined ? [{ value }] : [], success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO MEMORIES')) {
      const row: MemoryRow = {
        id: params[0] as string,
        title: params[1] as string,
        project: params[2] as string,
        content: params[3] as string,
        summary: params[4] as string,
        tags: params[5] as string,
        favorite: params[6] as number,
        archived: params[7] as number,
        owner_id: (params[8] as string) ?? '',
        created_at: params[9] as string,
        updated_at: params[10] as string,
        codename: (params[11] as string | null | undefined) ?? null,
        slug: (params[12] as string | null | undefined) ?? null,
        keywords: (params[13] as string | undefined) ?? '[]',
        category: (params[14] as string | undefined) ?? '',
        memory_type: (params[15] as string | undefined) ?? 'note',
        importance: (params[16] as number | undefined) ?? 50,
        language: (params[17] as string | undefined) ?? 'id',
        notes: (params[18] as string | undefined) ?? '',
        project_id: (params[19] as string | undefined) ?? '',
        level: (params[20] as MemoryLevel | undefined) ?? 'note',
        last_accessed: (params[21] as string | null | undefined) ?? null,
        access_count: (params[22] as number | undefined) ?? 0,
        embedding_id: (params[23] as string | null | undefined) ?? null,
        object_key: (params[24] as string | null | undefined) ?? null,
        semantic_hash: (params[25] as string | null | undefined) ?? null,
        aliases: (params[26] as string | undefined) ?? '[]',
        source_path: (params[27] as string | null | undefined) ?? null,
        workspace_id: (params[28] as string | null | undefined) ?? null,
        last_modified_by_agent_id: (params[29] as string | null | undefined) ?? null,
      };
      this.memories.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO MEMORY_EMBEDDINGS')) {
      const row: MemoryEmbeddingRow = {
        id: params[0] as string,
        memory_id: params[1] as string,
        owner_id: params[2] as string,
        model_id: params[3] as string,
        dimensions: params[4] as number,
        vector_json: params[5] as string,
        content_hash: params[6] as string,
        created_at: params[7] as string,
        updated_at: params[8] as string,
      };
      this.memoryEmbeddings.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO MEMORY_RELATIONS')) {
      const id = params[0] as string;
      this.relations.set(id, {
        id,
        source_memory_id: params[1],
        target_memory_id: params[2],
        relation: params[3],
        owner_id: params[4],
        weight: params[5],
        confidence: params[6],
        created_by: params[7],
        source_type: params[8],
        metadata: params[9],
        created_at: params[10],
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO MEMORY_SIGNALS')) {
      const row = {
        id: params[0] as string,
        owner_id: params[1] as string,
        workspace_id: params[2] as string | null,
        memory_id: params[3] as string | null,
        signal_type: params[4] as string,
        payload: params[5] as string,
        created_at: params[6] as string,
      };
      this.memorySignals.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE MEMORY_EMBEDDINGS')) {
      const dimensions = params[0] as number;
      const vectorJson = params[1] as string;
      const contentHash = params[2] as string;
      const updatedAt = params[3] as string;
      const id = params[4] as string;
      const ownerId = params[5] as string;
      const existing = this.memoryEmbeddings.get(id);
      if (!existing || existing.owner_id !== ownerId) {
        return { results: [], success: true, meta: { changes: 0 } };
      }
      existing.dimensions = dimensions;
      existing.vector_json = vectorJson;
      existing.content_hash = contentHash;
      existing.updated_at = updatedAt;
      this.memoryEmbeddings.set(id, existing);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE MEMORIES')) {
      if (
        normalizedSql.includes('LAST_ACCESSED = ?') &&
        normalizedSql.includes('ACCESS_COUNT = ACCESS_COUNT + 1') &&
        normalizedSql.includes('ID IN (')
      ) {
        const lastAccessed = params[0] as string;
        const hasWorkspace = normalizedSql.includes('WORKSPACE_ID = ?');
        const trailing = hasWorkspace ? 2 : 1;
        const ownerId = params[params.length - trailing] as string;
        const workspaceId = hasWorkspace ? (params[params.length - 1] as string) : undefined;
        const ids = params.slice(1, params.length - trailing) as string[];
        let changes = 0;
        for (const id of ids) {
          const existing = this.memories.get(id);
          if (!existing || existing.owner_id !== ownerId) continue;
          if (workspaceId !== undefined && (existing.workspace_id ?? null) !== workspaceId)
            continue;
          existing.last_accessed = lastAccessed;
          existing.access_count = (existing.access_count ?? 0) + 1;
          this.memories.set(id, existing);
          changes++;
        }
        return { results: [], success: true, meta: { changes } };
      }

      if (
        normalizedSql.includes('LAST_ACCESSED = ?') &&
        normalizedSql.includes('ACCESS_COUNT = ACCESS_COUNT + 1')
      ) {
        const lastAccessed = params[0] as string;
        const id = params[1] as string;
        const ownerId = params[2] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.last_accessed = lastAccessed;
        existing.access_count = (existing.access_count ?? 0) + 1;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (normalizedSql.startsWith('UPDATE MEMORIES SET IMPORTANCE = ?, UPDATED_AT = ?')) {
        const importance = params[0] as number;
        const updatedAt = params[1] as string;
        const hasWorkspace = normalizedSql.includes('WORKSPACE_ID = ?');
        const id = params[params.length - (hasWorkspace ? 3 : 2)] as string;
        const ownerId = params[params.length - (hasWorkspace ? 2 : 1)] as string;
        const workspaceId = hasWorkspace ? (params[params.length - 1] as string) : undefined;
        const existing = this.memories.get(id);
        if (
          !existing ||
          existing.owner_id !== ownerId ||
          (workspaceId !== undefined && (existing.workspace_id ?? null) !== workspaceId)
        ) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.importance = importance;
        existing.updated_at = updatedAt;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (normalizedSql.startsWith('UPDATE MEMORIES SET LIFECYCLE_STATE = ?, UPDATED_AT = ?')) {
        const state = params[0] as string;
        const updatedAt = params[1] as string;
        const hasWorkspace = normalizedSql.includes('WORKSPACE_ID = ?');
        const id = params[params.length - (hasWorkspace ? 3 : 2)] as string;
        const ownerId = params[params.length - (hasWorkspace ? 2 : 1)] as string;
        const workspaceId = hasWorkspace ? (params[params.length - 1] as string) : undefined;
        const existing = this.memories.get(id);
        if (
          !existing ||
          existing.owner_id !== ownerId ||
          (workspaceId !== undefined && (existing.workspace_id ?? null) !== workspaceId)
        ) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.lifecycle_state = state;
        existing.updated_at = updatedAt;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (
        normalizedSql.includes('PROJECT_ID = ?') &&
        normalizedSql.includes('SEMANTIC_HASH = ?') &&
        params.length === 6
      ) {
        const projectId = params[0] as string;
        const level = params[1] as string;
        const semanticHash = params[2] as string;
        const updatedAt = params[3] as string;
        const id = params[4] as string;
        const ownerId = params[5] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.project_id = projectId;
        existing.level = level as MemoryLevel;
        existing.semantic_hash = semanticHash;
        existing.updated_at = updatedAt;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (normalizedSql.includes('EMBEDDING_ID = ?') && params.length === 3) {
        const embeddingId = params[0] as string;
        const id = params[1] as string;
        const ownerId = params[2] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.embedding_id = embeddingId;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (
        normalizedSql.includes('COMPRESSION_META = ?') &&
        normalizedSql.includes('COMPRESSION_VERSION = ?')
      ) {
        const meta = params[0] as string;
        const version = params[1] as number;
        const updatedAt = params[2] as string;
        const id = params[3] as string;
        const ownerId = params[4] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        (existing as Record<string, unknown>).compression_meta = meta;
        (existing as Record<string, unknown>).compression_version = version;
        existing.updated_at = updatedAt;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      let id: string;
      let ownerId: string | undefined;

      if (
        params.length === 4 &&
        (normalizedSql.includes('FAVORITE = ?') || normalizedSql.includes('ARCHIVED = ?'))
      ) {
        id = params[2] as string;
        ownerId = params[3] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        if (normalizedSql.includes('FAVORITE = ?')) {
          existing.favorite = params[0] as number;
        } else {
          existing.archived = params[0] as number;
        }
        existing.updated_at = params[1] as string;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (normalizedSql.includes('LAST_MODIFIED_BY_AGENT_ID = ?') && params.length >= 22) {
        const hasWorkspace = normalizedSql.includes('WORKSPACE_ID = ?');
        id = params[params.length - (hasWorkspace ? 3 : 2)] as string;
        ownerId = params[params.length - (hasWorkspace ? 2 : 1)] as string;
        const workspaceId = hasWorkspace ? (params[params.length - 1] as string) : undefined;
        const existing = this.memories.get(id);
        if (
          !existing ||
          existing.owner_id !== ownerId ||
          (workspaceId !== undefined && (existing.workspace_id ?? null) !== workspaceId)
        ) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.keywords = params[5] as string;
        existing.category = params[6] as string;
        existing.memory_type = params[7] as string;
        existing.importance = params[8] as number;
        existing.language = params[9] as string;
        existing.notes = params[10] as string;
        existing.slug = params[11] as string | null;
        existing.aliases = (params[12] as string | undefined) ?? '[]';
        existing.source_path = (params[13] as string | null | undefined) ?? null;
        existing.project_id = params[14] as string;
        existing.level = params[15] as MemoryLevel;
        existing.favorite = params[16] as number;
        existing.archived = params[17] as number;
        existing.updated_at = params[18] as string;
        existing.last_modified_by_agent_id = (params[19] as string | null | undefined) ?? null;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (params.length >= 19) {
        id = params[17] as string;
        ownerId = params[18] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.keywords = params[5] as string;
        existing.category = params[6] as string;
        existing.memory_type = params[7] as string;
        existing.importance = params[8] as number;
        existing.language = params[9] as string;
        existing.notes = params[10] as string;
        existing.slug = params[11] as string | null;
        existing.project_id = params[12] as string;
        existing.level = params[13] as MemoryLevel;
        existing.favorite = params[14] as number;
        existing.archived = params[15] as number;
        existing.updated_at = params[16] as string;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (params.length >= 17) {
        id = params[15] as string;
        ownerId = params[16] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.keywords = params[5] as string;
        existing.category = params[6] as string;
        existing.memory_type = params[7] as string;
        existing.importance = params[8] as number;
        existing.language = params[9] as string;
        existing.notes = params[10] as string;
        existing.slug = params[11] as string | null;
        existing.favorite = params[12] as number;
        existing.archived = params[13] as number;
        existing.updated_at = params[14] as string;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      if (params.length === 10) {
        id = params[8] as string;
        ownerId = params[9] as string;
        const existing = this.memories.get(id);
        if (!existing || existing.owner_id !== ownerId) {
          return { results: [], success: true, meta: { changes: 0 } };
        }
        existing.title = params[0] as string;
        existing.project = params[1] as string;
        existing.content = params[2] as string;
        existing.summary = params[3] as string;
        existing.tags = params[4] as string;
        existing.favorite = params[5] as number;
        existing.archived = params[6] as number;
        existing.updated_at = params[7] as string;
        this.memories.set(id, existing);
        return { results: [], success: true, meta: { changes: 1 } };
      }

      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (
      normalizedSql.includes('DELETE FROM MEMORIES WHERE') &&
      normalizedSql.includes('ID = ?') &&
      normalizedSql.includes('OWNER_ID = ?')
    ) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const workspaceId = normalizedSql.includes('WORKSPACE_ID = ?')
        ? (params[2] as string)
        : undefined;
      const row = this.memories.get(id);
      let existed = row?.owner_id === ownerId;
      if (existed && workspaceId !== undefined) {
        existed = (row?.workspace_id ?? null) === workspaceId;
      }
      if (existed) this.memories.delete(id);
      return { results: [], success: true, meta: { changes: existed ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORY_EMBEDDINGS WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      let deleted = 0;
      for (const [id, row] of this.memoryEmbeddings.entries()) {
        if (row.owner_id === ownerId) {
          this.memoryEmbeddings.delete(id);
          deleted++;
        }
      }
      return { results: [], success: true, meta: { changes: deleted } };
    }

    if (
      normalizedSql.startsWith('DELETE FROM MEMORY_EMBEDDINGS WHERE MEMORY_ID = ? AND OWNER_ID = ?')
    ) {
      const memoryId = params[0] as string;
      const ownerId = params[1] as string;
      let deleted = 0;
      for (const [id, row] of this.memoryEmbeddings.entries()) {
        if (row.memory_id === memoryId && row.owner_id === ownerId) {
          this.memoryEmbeddings.delete(id);
          deleted++;
        }
      }
      return { results: [], success: true, meta: { changes: deleted } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES WHERE ID')) {
      const id = params[0] as string;
      const existed = this.memories.has(id);
      this.memories.delete(id);
      return { results: [], success: true, meta: { changes: existed ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      let count = 0;
      for (const [id, row] of this.memories) {
        if (row.owner_id === ownerId) {
          this.memories.delete(id);
          count++;
        }
      }
      return { results: [], success: true, meta: { changes: count } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORIES')) {
      const count = this.memories.size;
      this.memories.clear();
      return { results: [], success: true, meta: { changes: count } };
    }

    if (normalizedSql.includes('FROM MEMORIES WHERE OWNER_ID = ? AND CODENAME = ?')) {
      const ownerId = params[0] as string;
      const codename = params[1] as string;
      const row = [...this.memories.values()].find(
        (m) => m.owner_id === ownerId && m.codename === codename,
      );
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('FROM MEMORIES WHERE OWNER_ID = ? AND SLUG = ?')) {
      const ownerId = params[0] as string;
      const slug = params[1] as string;
      const row = [...this.memories.values()].find(
        (m) => m.owner_id === ownerId && m.slug === slug,
      );
      return { results: row ? [row] : [], success: true };
    }

    if (
      normalizedSql.includes('SELECT CODENAME FROM MEMORIES') &&
      normalizedSql.includes('CODENAME LIKE ?')
    ) {
      const ownerId = params[0] as string;
      const pattern = (params[1] as string).replace(/%/g, '');
      const prefix = pattern.replace(/-$/, '');
      const rows = [...this.memories.values()]
        .filter((m) => m.owner_id === ownerId && (m.codename ?? '').startsWith(prefix))
        .sort((a, b) => (b.codename ?? '').localeCompare(a.codename ?? ''))
        .slice(0, 1)
        .map((m) => ({ codename: m.codename }));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT COUNT(*) AS COUNT FROM MEMORY_SIGNALS')) {
      const signalId = params[0] as string;
      const count = this.memorySignals.has(signalId) ? 1 : 0;
      return { results: [{ count }], success: true };
    }

    if (normalizedSql.includes('SELECT DISTINCT OWNER_ID FROM MEMORY_SIGNALS')) {
      const owners = [
        ...new Set(
          [...this.memorySignals.values()].map((row) => row.owner_id as string).filter(Boolean),
        ),
      ]
        .filter((ownerId) => ownerId !== (params[0] as string))
        .map((owner_id) => ({ owner_id }));
      return { results: owners, success: true };
    }

    if (
      normalizedSql.includes('FROM MEMORY_SIGNALS') &&
      normalizedSql.includes('ORDER BY CREATED_AT DESC')
    ) {
      const hasWorkspace = normalizedSql.includes('WORKSPACE_ID = ?');
      const ownerId = params[0] as string;
      const workspaceId = hasWorkspace ? (params[1] as string) : undefined;
      const limit = params[params.length - 1] as number;
      let rows = [...this.memorySignals.values()].filter((row) => row.owner_id === ownerId);
      if (workspaceId) {
        rows = rows.filter((row) => (row.workspace_id ?? null) === workspaceId);
      }
      rows.sort((a, b) =>
        String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')),
      );
      return { results: rows.slice(0, limit), success: true };
    }

    if (
      normalizedSql.includes('SELECT COUNT(*) AS COUNT FROM MEMORIES') &&
      normalizedSql.includes('SLUG = ?')
    ) {
      const ownerId = params[0] as string;
      const slug = params[1] as string;
      const count = [...this.memories.values()].filter(
        (m) => m.owner_id === ownerId && m.slug === slug,
      ).length;
      return { results: [{ count }], success: true };
    }

    if (normalizedSql.includes('SELECT DISTINCT CATEGORY')) {
      const ownerId = params[0] as string;
      const categories = [
        ...new Set(
          [...this.memories.values()]
            .filter((m) => m.owner_id === ownerId && m.category !== '' && m.archived === 0)
            .map((m) => m.category ?? ''),
        ),
      ].sort();
      return { results: categories.map((c) => ({ category: c })), success: true };
    }

    if (
      normalizedSql.includes(
        'SELECT SOURCE_MEMORY_ID, TARGET_MEMORY_ID, RELATION FROM MEMORY_RELATIONS WHERE OWNER_ID = ?',
      )
    ) {
      const ownerId = params[0] as string;
      const rows = [...this.relations.values()]
        .filter((r) => r.owner_id === ownerId)
        .map((r) => ({
          source_memory_id: r.source_memory_id,
          target_memory_id: r.target_memory_id,
          relation: r.relation,
        }));
      return { results: rows, success: true };
    }

    if (
      normalizedSql.startsWith('SELECT') &&
      normalizedSql.includes('FROM MEMORY_RELATIONS WHERE ID = ? AND OWNER_ID = ?')
    ) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const row = this.relations.get(id);
      return {
        results: row && row.owner_id === ownerId ? [row] : [],
        success: true,
      };
    }

    if (
      normalizedSql.startsWith('SELECT') &&
      normalizedSql.includes('FROM MEMORY_RELATIONS') &&
      normalizedSql.includes('SOURCE_MEMORY_ID = ? OR TARGET_MEMORY_ID = ?') &&
      !normalizedSql.includes('INNER JOIN')
    ) {
      const ownerId = params[0] as string;
      const memoryId = params[1] as string;
      const rows = [...this.relations.values()].filter(
        (r) =>
          r.owner_id === ownerId &&
          (r.source_memory_id === memoryId || r.target_memory_id === memoryId),
      );
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('FROM MEMORY_RELATIONS') && normalizedSql.includes('COUNT(*)')) {
      const ownerId = params[0] as string;
      const sourceId = params[1] as string;
      const targetId = params[2] as string;
      const relation = params[3] as string;
      const count = [...this.relations.values()].filter(
        (r) =>
          r.owner_id === ownerId &&
          r.source_memory_id === sourceId &&
          r.target_memory_id === targetId &&
          r.relation === relation,
      ).length;
      return { results: [{ count }], success: true };
    }

    if (
      normalizedSql.startsWith('SELECT') &&
      normalizedSql.includes('FROM MEMORY_RELATIONS') &&
      normalizedSql.includes('SOURCE_MEMORY_ID = ?') &&
      normalizedSql.includes('TARGET_MEMORY_ID = ?') &&
      normalizedSql.includes('RELATION = ?') &&
      !normalizedSql.includes('COUNT(*)') &&
      !normalizedSql.includes('SOURCE_MEMORY_ID = ? OR TARGET_MEMORY_ID = ?')
    ) {
      const ownerId = params[0] as string;
      const sourceId = params[1] as string;
      const targetId = params[2] as string;
      const relation = params[3] as string;
      const rows = [...this.relations.values()].filter(
        (r) =>
          r.owner_id === ownerId &&
          r.source_memory_id === sourceId &&
          r.target_memory_id === targetId &&
          r.relation === relation,
      );
      return { results: rows, success: true };
    }

    if (normalizedSql.startsWith('UPDATE MEMORY_RELATIONS')) {
      const weight = params[0] as number;
      const confidence = params[1] as number;
      const metadata = params[2] as string;
      const id = params[3] as string;
      const ownerId = params[4] as string;
      const row = this.relations.get(id);
      if (row && row.owner_id === ownerId) {
        row.weight = weight;
        row.confidence = confidence;
        row.metadata = metadata;
        this.relations.set(id, row);
        return { results: [], success: true, meta: { changes: 1 } };
      }
      return { results: [], success: true, meta: { changes: 0 } };
    }

    if (normalizedSql.startsWith('DELETE FROM MEMORY_RELATIONS')) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const row = this.relations.get(id);
      const existed = row?.owner_id === ownerId;
      if (existed) this.relations.delete(id);
      return { results: [], success: true, meta: { changes: existed ? 1 : 0 } };
    }

    // Check ID-specific queries BEFORE general SELECT * handlers
    // More specific: must have ID = ? AND OWNER_ID = ? exactly
    if (
      normalizedSql.includes('WHERE ID = ?') &&
      normalizedSql.includes('OWNER_ID = ?') &&
      !normalizedSql.includes('SELECT * FROM MEMORIES WHERE ID')
    ) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const workspaceId = normalizedSql.includes('WORKSPACE_ID = ?')
        ? (params[2] as string)
        : undefined;
      const row = this.memories.get(id);
      const matchesOwner = row && row.owner_id === ownerId;
      const matchesWorkspace = !workspaceId || (row?.workspace_id ?? null) === workspaceId;
      return {
        results: matchesOwner && matchesWorkspace && row ? [row] : [],
        success: true,
      };
    }

    // IN clause handler - specific pattern for findByIds / findByIdsWithContent
    if (normalizedSql.includes('WHERE ID IN (')) {
      const hasWorkspace = normalizedSql.includes('WORKSPACE_ID = ?');
      const ownerId = hasWorkspace
        ? (params[params.length - 2] as string)
        : (params[params.length - 1] as string);
      const workspaceId = hasWorkspace ? (params[params.length - 1] as string) : undefined;
      const idParams = hasWorkspace ? params.slice(0, -2) : params.slice(0, -1);
      const ids = idParams as string[];
      const rows = ids
        .map((id) => this.memories.get(id))
        .filter((row): row is MemoryRow => {
          if (row === undefined || row.owner_id !== ownerId) return false;
          if (workspaceId && (row.workspace_id ?? null) !== workspaceId) return false;
          return true;
        });
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT * FROM MEMORIES WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.memories.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('SELECT COUNT(*)')) {
      if (normalizedSql.includes('FROM IDENTITIES')) {
        return { results: [{ count: this.identities.size }], success: true };
      }
      const filtered = this.filterMemories(sql, params);
      return { results: [{ count: filtered.length }], success: true };
    }
    if (normalizedSql.includes('FROM MEMORIES WHERE OWNER_ID = ? ORDER BY CREATED_AT ASC')) {
      const ownerId = params[0] as string;
      const rows = [...this.memories.values()]
        .filter((m) => m.owner_id === ownerId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('SELECT DISTINCT PROJECT')) {
      const ownerId = params[0] as string;
      const workspaceId = normalizedSql.includes('WORKSPACE_ID = ?')
        ? (params[1] as string)
        : undefined;
      const projects = [
        ...new Set(
          [...this.memories.values()]
            .filter((m) => {
              if (m.owner_id !== ownerId || m.project === '' || m.archived !== 0) return false;
              if (workspaceId !== undefined) return (m.workspace_id ?? null) === workspaceId;
              return true;
            })
            .map((m) => m.project),
        ),
      ].sort();
      return { results: projects.map((p) => ({ project: p })), success: true };
    }

    if (normalizedSql.includes('SELECT TAGS FROM MEMORIES WHERE OWNER_ID = ?')) {
      const ownerId = params[0] as string;
      const workspaceId = normalizedSql.includes('WORKSPACE_ID = ?')
        ? (params[1] as string)
        : undefined;
      const rows = [...this.memories.values()]
        .filter((m) => {
          if (m.owner_id !== ownerId || m.archived !== 0) return false;
          if (workspaceId !== undefined) return (m.workspace_id ?? null) === workspaceId;
          return true;
        })
        .map((m) => ({ tags: m.tags }));
      return { results: rows, success: true };
    }

    if (
      normalizedSql.includes('FROM MEMORIES') &&
      normalizedSql.includes("'' AS CONTENT") &&
      !normalizedSql.includes('SELECT * FROM MEMORIES')
    ) {
      const filtered = this.filterMemories(sql, params);

      if (normalizedSql.includes('ORDER BY IMPORTANCE DESC, UPDATED_AT DESC')) {
        const limit = params[params.length - 1] as number;
        const sorted = filtered
          .sort((a, b) => {
            const imp = (b.importance ?? 50) - (a.importance ?? 50);
            if (imp !== 0) return imp;
            return b.updated_at.localeCompare(a.updated_at);
          })
          .slice(0, limit)
          .map((row) => ({ ...row, content: '' }));
        return { results: sorted, success: true };
      }
    }

    if (
      normalizedSql.includes('FROM MEMORY_EMBEDDINGS') &&
      normalizedSql.includes('MEMORY_ID = ?') &&
      normalizedSql.includes('MODEL_ID = ?')
    ) {
      const memoryId = params[0] as string;
      const ownerId = params[1] as string;
      const modelId = params[2] as string;
      const row = [...this.memoryEmbeddings.values()].find(
        (e) => e.memory_id === memoryId && e.owner_id === ownerId && e.model_id === modelId,
      );
      return { results: row ? [row] : [], success: true };
    }

    if (
      normalizedSql.includes('FROM MEMORY_EMBEDDINGS') &&
      normalizedSql.includes('OWNER_ID = ?')
    ) {
      const ownerId = params[0] as string;
      const rows = [...this.memoryEmbeddings.values()].filter((e) => e.owner_id === ownerId);
      return { results: rows, success: true };
    }

    if (
      normalizedSql.includes('FROM MEMORIES') &&
      !normalizedSql.includes("'' AS CONTENT") &&
      !normalizedSql.includes('SELECT COUNT(*)')
    ) {
      const filtered = this.filterMemories(sql, params);

      if (normalizedSql.includes('ORDER BY IMPORTANCE DESC, UPDATED_AT DESC')) {
        const limit = params[params.length - 1] as number;
        const sorted = filtered
          .sort((a, b) => {
            const imp = (b.importance ?? 50) - (a.importance ?? 50);
            if (imp !== 0) return imp;
            return b.updated_at.localeCompare(a.updated_at);
          })
          .slice(0, limit);
        return { results: sorted, success: true };
      }

      if (
        normalizedSql.includes('ORDER BY UPDATED_AT DESC') &&
        normalizedSql.includes('EMBEDDING_ID IS NULL') &&
        !normalizedSql.includes('OFFSET')
      ) {
        const limit = params[params.length - 1] as number;
        const sorted = filtered
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
          .slice(0, limit);
        return { results: sorted, success: true };
      }

      const limit = params[params.length - 2] as number | undefined;
      const offset = params[params.length - 1] as number | undefined;

      let results = filtered;
      if (typeof limit === 'number' && typeof offset === 'number') {
        results = filtered.slice(offset, offset + limit);
      }

      results.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      return { results, success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO CLOUD_REGIONS')) {
      const row = {
        id: params[0] as string,
        code: params[1] as string,
        display_name: params[2] as string,
        cloud_provider: params[3] as string | null,
        is_active: 1,
        created_at: params[4] as string,
      };
      this.cloudRegions.set(row.id, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('FROM CLOUD_REGIONS WHERE CODE = ?')) {
      const code = params[0] as string;
      const row = [...this.cloudRegions.values()].find((r) => r.code === code);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('FROM CLOUD_REGIONS WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.cloudRegions.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (
      normalizedSql.includes('FROM CLOUD_REGIONS') &&
      normalizedSql.includes('WHERE IS_ACTIVE = 1')
    ) {
      const rows = [...this.cloudRegions.values()].filter((r) => r.is_active === 1);
      return { results: rows, success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO CLOUD_TENANT_METADATA')) {
      const row = {
        id: params[0] as string,
        organization_id: params[1] as string,
        workspace_id: params[2] as string,
        owner_id: params[3] as string,
        department_id: params[4] as string | null,
        tenant_project_id: params[5] as string | null,
        primary_region_id: params[6] as string,
        secondary_region_id: params[7] as string | null,
        status: 'active',
        created_at: params[8] as string,
        updated_at: params[9] as string,
      };
      const key = `${row.organization_id}:${row.workspace_id}`;
      this.cloudTenantMetadata.set(key, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (
      normalizedSql.includes('FROM CLOUD_TENANT_METADATA') &&
      normalizedSql.includes('ORGANIZATION_ID = ?') &&
      normalizedSql.includes('WORKSPACE_ID = ?')
    ) {
      const key = `${params[0]}:${params[1]}`;
      const row = this.cloudTenantMetadata.get(key);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.startsWith('UPDATE CLOUD_TENANT_METADATA')) {
      const key = `${params[params.length - 2]}:${params[params.length - 1]}`;
      const row = this.cloudTenantMetadata.get(key);
      if (!row) return { results: [], success: true, meta: { changes: 0 } };
      if (normalizedSql.includes('SET STATUS = ?')) {
        row.status = params[0] as string;
        row.updated_at = params[1] as string;
      } else if (normalizedSql.includes('SET PRIMARY_REGION_ID = ?')) {
        row.primary_region_id = params[0] as string;
        row.secondary_region_id = params[1] as string | null;
        row.updated_at = params[2] as string;
      } else {
        row.owner_id = params[0] as string;
        row.department_id = params[1] as string | null;
        row.tenant_project_id = params[2] as string | null;
        row.primary_region_id = params[3] as string;
        row.secondary_region_id = params[4] as string | null;
        row.status = params[5] as string;
        row.updated_at = params[6] as string;
      }
      this.cloudTenantMetadata.set(key, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO CLOUD_WORKSPACE_REGIONS')) {
      const row = {
        workspace_id: params[0] as string,
        owner_id: params[1] as string,
        primary_region_id: params[2] as string,
        secondary_region_id: params[3] as string | null,
        read_preference: params[4] as string,
        updated_at: params[5] as string,
      };
      this.cloudWorkspaceRegions.set(row.workspace_id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE CLOUD_WORKSPACE_REGIONS')) {
      const workspaceId = params[4] as string;
      const row = this.cloudWorkspaceRegions.get(workspaceId);
      if (!row) return { results: [], success: true, meta: { changes: 0 } };
      row.primary_region_id = params[0] as string;
      row.secondary_region_id = params[1] as string | null;
      row.read_preference = params[2] as string;
      row.updated_at = params[3] as string;
      this.cloudWorkspaceRegions.set(workspaceId, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('FROM CLOUD_WORKSPACE_REGIONS WHERE WORKSPACE_ID = ?')) {
      const workspaceId = params[0] as string;
      const row = this.cloudWorkspaceRegions.get(workspaceId);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO CLOUD_USAGE_RECORDS')) {
      const row = {
        id: params[0] as string,
        owner_id: params[1] as string,
        workspace_id: params[2] as string | null,
        organization_id: params[3] as string | null,
        metric_type: params[4] as string,
        quantity: params[5] as number,
        occurred_at: params[6] as string,
        correlation_id: params[7] as string | null,
        metadata: params[8] as string,
      };
      this.cloudUsageRecords.set(row.id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO CLOUD_DR_SCHEDULES')) {
      const row = {
        id: params[0] as string,
        workspace_id: params[1] as string,
        owner_id: params[2] as string,
        cron_expression: params[3] as string | null,
        enabled: 1,
        last_run_at: null,
        created_at: params[4] as string,
      };
      this.cloudDrSchedules.set(row.id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('FROM CLOUD_DR_SCHEDULES WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.cloudDrSchedules.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.startsWith('UPDATE CLOUD_DR_SCHEDULES SET LAST_RUN_AT = ?')) {
      const id = params[1] as string;
      const row = this.cloudDrSchedules.get(id);
      if (row) row.last_run_at = params[0] as string;
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('INSERT INTO PLUGIN_REGISTRY')) {
      const row = {
        id: params[0] as string,
        plugin_type: params[1] as string,
        manifest_json: params[2] as string,
        status: params[3] as string,
        registered_at: params[4] as string,
        updated_at: params[5] as string,
        enabled_at: params[6] as string | null,
      };
      this.pluginRegistry.set(row.id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('UPDATE PLUGIN_REGISTRY SET MANIFEST_JSON = ?')) {
      const id = params[3] as string;
      const row = this.pluginRegistry.get(id);
      if (row) {
        row.manifest_json = params[0] as string;
        row.plugin_type = params[1] as string;
        row.updated_at = params[2] as string;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.includes("UPDATE PLUGIN_REGISTRY SET STATUS = 'DISABLED'") && normalizedSql.includes('WHERE ID = ?')) {
      const id = params[1] as string;
      const row = this.pluginRegistry.get(id);
      if (row) {
        row.status = 'disabled';
        row.updated_at = params[0] as string;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.includes("UPDATE PLUGIN_REGISTRY SET STATUS = 'DISABLED'") && normalizedSql.includes('PLUGIN_TYPE = ?')) {
      const type = params[1] as string;
      const excludeId = params[2] as string;
      for (const [id, row] of this.pluginRegistry) {
        if (row.plugin_type === type && row.status === 'enabled' && id !== excludeId) {
          row.status = 'disabled';
          row.updated_at = params[0] as string;
        }
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes("UPDATE PLUGIN_REGISTRY SET STATUS = 'ENABLED'")) {
      const id = params[2] as string;
      const row = this.pluginRegistry.get(id);
      if (row) {
        row.status = 'enabled';
        row.enabled_at = params[0] as string;
        row.updated_at = params[1] as string;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.startsWith('UPDATE PLUGIN_REGISTRY SET STATUS = ?')) {
      const id = params[2] as string;
      const row = this.pluginRegistry.get(id);
      if (row) {
        row.status = params[0] as string;
        row.updated_at = params[1] as string;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.includes('FROM PLUGIN_REGISTRY WHERE ID = ?')) {
      const id = params[0] as string;
      const row = this.pluginRegistry.get(id);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('FROM PLUGIN_REGISTRY') && normalizedSql.includes('PLUGIN_TYPE = ?')) {
      const type = params[0] as string;
      const rows = [...this.pluginRegistry.values()].filter((r) => r.plugin_type === type);
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('FROM PLUGIN_REGISTRY ORDER BY')) {
      const rows = [...this.pluginRegistry.values()].sort((a, b) =>
        String(a.plugin_type).localeCompare(String(b.plugin_type)),
      );
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('INSERT INTO PLUGIN_ALLOW_LIST')) {
      const key = `${params[0]}:${params[1]}`;
      this.pluginAllowList.set(key, {
        organization_id: params[0] as string,
        plugin_id: params[1] as string,
        allowed: params[2] as number,
        updated_at: params[3] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('FROM PLUGIN_ALLOW_LIST') && normalizedSql.includes('ORGANIZATION_ID = ?') && normalizedSql.includes('PLUGIN_ID = ?')) {
      const key = `${params[0]}:${params[1]}`;
      const row = this.pluginAllowList.get(key);
      return { results: row ? [{ allowed: row.allowed }] : [], success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO STEWARDSHIP_RUNS')) {
      const row = {
        run_id: params[0] as string,
        owner_id: params[1] as string,
        project_id: params[2] as string | null,
        dry_run: params[3] as number,
        started_at: params[4] as string,
        finished_at: params[5] as string,
        duration_ms: params[6] as number,
        report_json: params[7] as string,
        had_errors: params[8] as number,
      };
      this.stewardshipRuns.set(row.run_id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (
      normalizedSql.includes('FROM STEWARDSHIP_RUNS') &&
      normalizedSql.includes('WHERE OWNER_ID = ?') &&
      normalizedSql.includes('ORDER BY STARTED_AT DESC')
    ) {
      const ownerId = params[0] as string;
      const limit = params[1] as number;
      const rows = [...this.stewardshipRuns.values()]
        .filter((r) => r.owner_id === ownerId)
        .sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)))
        .slice(0, limit);
      return { results: rows, success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO SEARCH_GRAPH_SYNC_RUNS')) {
      const row = {
        id: params[0] as string,
        target: params[1] as string,
        mode: params[2] as string,
        status: params[3] as string,
        owner_id: params[4] as string | null,
        stats_json: params[5] as string,
        started_at: params[6] as string,
        finished_at: null as string | null,
        error_message: null as string | null,
      };
      this.searchGraphSyncRuns.set(row.id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('UPDATE SEARCH_GRAPH_SYNC_RUNS SET STATUS = ?')) {
      const id = params[4] as string;
      const row = this.searchGraphSyncRuns.get(id);
      if (row) {
        row.status = params[0] as string;
        row.stats_json = params[1] as string;
        row.finished_at = params[2] as string;
        row.error_message = params[3] as string | null;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.includes('FROM SEARCH_GRAPH_SYNC_RUNS') && normalizedSql.includes('WHERE TARGET = ?')) {
      const target = params[0] as string;
      const rows = [...this.searchGraphSyncRuns.values()]
        .filter((r) => r.target === target)
        .sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)));
      return { results: rows.slice(0, 1), success: true };
    }

    if (normalizedSql.includes('FROM SEARCH_GRAPH_SYNC_RUNS') && normalizedSql.includes('ORDER BY STARTED_AT DESC')) {
      const rows = [...this.searchGraphSyncRuns.values()].sort((a, b) =>
        String(b.started_at).localeCompare(String(a.started_at)),
      );
      const limit = params[0] as number;
      return { results: rows.slice(0, limit), success: true };
    }

    if (normalizedSql.includes('FROM SEARCH_GRAPH_SYNC_STATE WHERE TARGET = ?')) {
      const target = params[0] as string;
      const row = this.searchGraphSyncState.get(target);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('INSERT INTO SEARCH_GRAPH_SYNC_STATE')) {
      const target = params[0] as string;
      this.searchGraphSyncState.set(target, {
        target,
        last_watermark: params[1] as string,
        last_run_id: params[2] as string | null,
        updated_at: params[3] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO CONTENT_SCALE_SYNC_RUNS')) {
      const row = {
        id: params[0] as string,
        target: params[1] as string,
        mode: params[2] as string,
        status: params[3] as string,
        owner_id: params[4] as string | null,
        stats_json: params[5] as string,
        started_at: params[6] as string,
        finished_at: null as string | null,
        error_message: null as string | null,
      };
      this.contentScaleSyncRuns.set(row.id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('UPDATE CONTENT_SCALE_SYNC_RUNS SET STATUS = ?')) {
      const id = params[4] as string;
      const row = this.contentScaleSyncRuns.get(id);
      if (row) {
        row.status = params[0] as string;
        row.stats_json = params[1] as string;
        row.finished_at = params[2] as string;
        row.error_message = params[3] as string | null;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (normalizedSql.includes('FROM CONTENT_SCALE_SYNC_RUNS') && normalizedSql.includes('WHERE TARGET = ?')) {
      const target = params[0] as string;
      const rows = [...this.contentScaleSyncRuns.values()]
        .filter((r) => r.target === target)
        .sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)));
      return { results: rows.slice(0, 1), success: true };
    }

    if (normalizedSql.includes('FROM CONTENT_SCALE_SYNC_RUNS') && normalizedSql.includes('ORDER BY STARTED_AT DESC')) {
      const rows = [...this.contentScaleSyncRuns.values()].sort((a, b) =>
        String(b.started_at).localeCompare(String(a.started_at)),
      );
      const limit = params[0] as number;
      return { results: rows.slice(0, limit), success: true };
    }

    if (normalizedSql.includes('FROM CONTENT_SCALE_SYNC_STATE WHERE TARGET = ?')) {
      const target = params[0] as string;
      const row = this.contentScaleSyncState.get(target);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('INSERT INTO CONTENT_SCALE_SYNC_STATE')) {
      const target = params[0] as string;
      this.contentScaleSyncState.set(target, {
        target,
        last_watermark: params[1] as string,
        last_run_id: params[2] as string | null,
        updated_at: params[3] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO KNOWLEDGE_FABRIC_INGEST_RUNS')) {
      const row = {
        id: params[0] as string,
        connector_id: params[1] as string,
        mode: params[2] as string,
        status: params[3] as string,
        owner_id: params[4] as string | null,
        workspace_id: params[5] as string | null,
        stats_json: params[6] as string,
        started_at: params[7] as string,
        finished_at: null as string | null,
        error_message: null as string | null,
      };
      this.knowledgeFabricIngestRuns.set(row.id as string, row);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('UPDATE KNOWLEDGE_FABRIC_INGEST_RUNS SET STATUS = ?')) {
      const id = params[4] as string;
      const row = this.knowledgeFabricIngestRuns.get(id);
      if (row) {
        row.status = params[0] as string;
        row.stats_json = params[1] as string;
        row.finished_at = params[2] as string;
        row.error_message = params[3] as string | null;
      }
      return { results: [], success: true, meta: { changes: row ? 1 : 0 } };
    }

    if (
      normalizedSql.includes('FROM KNOWLEDGE_FABRIC_INGEST_RUNS') &&
      normalizedSql.includes('WHERE CONNECTOR_ID = ?')
    ) {
      const connectorId = params[0] as string;
      const rows = [...this.knowledgeFabricIngestRuns.values()]
        .filter((r) => r.connector_id === connectorId)
        .sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)));
      return { results: rows.slice(0, 1), success: true };
    }

    if (
      normalizedSql.includes('FROM KNOWLEDGE_FABRIC_INGEST_RUNS') &&
      normalizedSql.includes('ORDER BY STARTED_AT DESC')
    ) {
      const rows = [...this.knowledgeFabricIngestRuns.values()].sort((a, b) =>
        String(b.started_at).localeCompare(String(a.started_at)),
      );
      const limit = params[0] as number;
      return { results: rows.slice(0, limit), success: true };
    }

    if (
      normalizedSql.includes('FROM KNOWLEDGE_FABRIC_EXTERNAL_REFS') &&
      normalizedSql.includes('CONNECTOR_ID = ?')
    ) {
      const connectorId = params[0] as string;
      const externalId = params[1] as string;
      const ownerId = params[2] as string;
      const workspaceId = params[3] as string | null;
      const row = [...this.knowledgeFabricExternalRefs.values()].find(
        (r) =>
          r.connector_id === connectorId &&
          r.external_id === externalId &&
          r.owner_id === ownerId &&
          (r.workspace_id ?? null) === workspaceId,
      );
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('INSERT INTO KNOWLEDGE_FABRIC_EXTERNAL_REFS')) {
      const connectorId = params[1] as string;
      const externalId = params[2] as string;
      const ownerId = params[4] as string;
      const workspaceId = params[5] as string | null;
      const key = `${connectorId}:${externalId}:${ownerId}:${workspaceId ?? ''}`;
      this.knowledgeFabricExternalRefs.set(key, {
        id: params[0] as string,
        connector_id: connectorId,
        external_id: externalId,
        memory_id: params[3] as string,
        owner_id: ownerId,
        workspace_id: workspaceId,
        external_updated_at: params[6] as string,
        updated_at: params[7] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (
      normalizedSql.includes('FROM KNOWLEDGE_FABRIC_CONNECTOR_STATE') &&
      normalizedSql.includes('CONNECTOR_ID = ?')
    ) {
      const connectorId = params[0] as string;
      const ownerId = params[1] as string;
      const workspaceId = params[2] as string | null;
      const key = `${connectorId}:${ownerId}:${workspaceId ?? ''}`;
      const row = this.knowledgeFabricConnectorState.get(key);
      return { results: row ? [row] : [], success: true };
    }

    if (normalizedSql.includes('INSERT INTO KNOWLEDGE_FABRIC_CONNECTOR_STATE')) {
      const connectorId = params[0] as string;
      const ownerId = params[1] as string;
      const workspaceId = params[2] as string | null;
      const key = `${connectorId}:${ownerId}:${workspaceId ?? ''}`;
      this.knowledgeFabricConnectorState.set(key, {
        connector_id: connectorId,
        owner_id: ownerId,
        workspace_id: workspaceId,
        last_cursor: params[3] as string,
        last_run_id: params[4] as string | null,
        updated_at: params[5] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.startsWith('INSERT INTO PLATFORM_WEBHOOK_SUBSCRIPTIONS')) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const workspaceId = params[2] as string | null;
      const key = `${ownerId}:${workspaceId ?? ''}:${id}`;
      this.platformWebhookSubscriptions.set(key, {
        id,
        owner_id: ownerId,
        workspace_id: workspaceId,
        url: params[3] as string,
        secret: params[4] as string | null,
        topics_json: params[5] as string,
        active: params[6] as number,
        created_at: params[7] as string,
        updated_at: params[8] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (
      normalizedSql.includes('FROM PLATFORM_WEBHOOK_SUBSCRIPTIONS') &&
      normalizedSql.includes('WHERE ID = ?')
    ) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const workspaceId = params[2] as string | null;
      const key = `${ownerId}:${workspaceId ?? ''}:${id}`;
      const row = this.platformWebhookSubscriptions.get(key);
      return { results: row ? [row] : [], success: true };
    }

    if (
      normalizedSql.includes('FROM PLATFORM_WEBHOOK_SUBSCRIPTIONS') &&
      normalizedSql.includes('WHERE OWNER_ID = ?') &&
      normalizedSql.includes('ACTIVE = 1')
    ) {
      const ownerId = params[0] as string;
      const rows = [...this.platformWebhookSubscriptions.values()].filter(
        (r) => r.owner_id === ownerId && r.active === 1,
      );
      return { results: rows, success: true };
    }

    if (
      normalizedSql.includes('FROM PLATFORM_WEBHOOK_SUBSCRIPTIONS') &&
      normalizedSql.includes('WHERE OWNER_ID = ?') &&
      normalizedSql.includes('ORDER BY CREATED_AT DESC')
    ) {
      const ownerId = params[0] as string;
      const workspaceId = params[1] as string | null;
      const rows = [...this.platformWebhookSubscriptions.values()]
        .filter(
          (r) => r.owner_id === ownerId && (r.workspace_id ?? null) === workspaceId,
        )
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('DELETE FROM PLATFORM_WEBHOOK_SUBSCRIPTIONS')) {
      const id = params[0] as string;
      const ownerId = params[1] as string;
      const workspaceId = params[2] as string | null;
      const key = `${ownerId}:${workspaceId ?? ''}:${id}`;
      this.platformWebhookSubscriptions.delete(key);
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('INSERT INTO INTELLIGENCE_TELEMETRY_EVENTS')) {
      const id = params[0] as string;
      this.intelligenceTelemetryEvents.set(id, {
        id,
        event_type: params[1] as string,
        owner_id: params[2] as string,
        workspace_id: params[3] as string | null,
        node_id: params[4] as string,
        envelope_json: params[5] as string,
        occurred_at: params[6] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('FROM INTELLIGENCE_TELEMETRY_EVENTS')) {
      if (normalizedSql.includes('COUNT(*)')) {
        const ownerId = params[0] as string;
        let rows = [...this.intelligenceTelemetryEvents.values()].filter((r) => r.owner_id === ownerId);
        if (normalizedSql.includes('EVENT_TYPE = ?')) {
          const type = params[3] as string;
          rows = rows.filter((r) => r.event_type === type);
          if (normalizedSql.includes('OCCURRED_AT >=')) {
            const since = params[4] as string;
            rows = rows.filter((r) => String(r.occurred_at) >= since);
          }
        } else if (normalizedSql.includes('OCCURRED_AT >=')) {
          const since = params[3] as string;
          rows = rows.filter((r) => String(r.occurred_at) >= since);
        }
        return { results: [{ count: rows.length }], success: true };
      }

      const rows = [...this.intelligenceTelemetryEvents.values()];
      return { results: [{ count: rows.length }], success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO INTELLIGENCE_SYNC_STATE')) {
      const scopeKey = params[0] as string;
      this.intelligenceSyncState.set(scopeKey, {
        scope_key: scopeKey,
        tier: params[1] as string,
        owner_id: params[2] as string,
        workspace_id: params[3] as string | null,
        last_cursor: params[4] as string | null,
        last_run_id: params[5] as string | null,
        updated_at: params[6] as string,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (normalizedSql.includes('FROM INTELLIGENCE_SYNC_STATE')) {
      const ownerId = params[0] as string;
      const workspaceId = params[1] as string | null;
      const rows = [...this.intelligenceSyncState.values()].filter(
        (r) => r.owner_id === ownerId && (r.workspace_id ?? null) === workspaceId,
      );
      return { results: rows, success: true };
    }

    if (normalizedSql.startsWith('INSERT INTO INTELLIGENCE_OFFLINE_JOURNAL')) {
      const id = params[0] as string;
      this.intelligenceOfflineJournal.set(id, {
        id,
        owner_id: params[1] as string,
        workspace_id: params[2] as string | null,
        entry_json: params[3] as string,
        status: 'pending',
        created_at: params[4] as string,
        applied_at: null,
      });
      return { results: [], success: true, meta: { changes: 1 } };
    }

    if (
      normalizedSql.includes('FROM INTELLIGENCE_OFFLINE_JOURNAL') &&
      normalizedSql.includes("STATUS = 'PENDING'")
    ) {
      const ownerId = params[0] as string;
      const workspaceId = params[1] as string | null;
      const rows = [...this.intelligenceOfflineJournal.values()]
        .filter(
          (r) =>
            r.owner_id === ownerId &&
            (r.workspace_id ?? null) === workspaceId &&
            r.status === 'pending',
        )
        .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
      return { results: rows, success: true };
    }

    if (normalizedSql.includes('UPDATE INTELLIGENCE_OFFLINE_JOURNAL')) {
      const appliedAt = params[0] as string;
      const id = params[1] as string;
      const row = this.intelligenceOfflineJournal.get(id);
      if (row) {
        row.status = 'applied';
        row.applied_at = appliedAt;
      }
      return { results: [], success: true, meta: { changes: 1 } };
    }

    return { results: [], success: true };
  }

  private filterMemories(sql: string, params: unknown[]): MemoryRow[] {
    let results = [...this.memories.values()];
    const upperSql = sql.toUpperCase();
    const queryParams = [...params];
    if (upperSql.includes('OFFSET ?') && typeof queryParams[queryParams.length - 1] === 'number') {
      queryParams.pop();
      if (typeof queryParams[queryParams.length - 1] === 'number') {
        queryParams.pop();
      }
    } else if (
      upperSql.includes('LIMIT ?') &&
      typeof queryParams[queryParams.length - 1] === 'number'
    ) {
      queryParams.pop();
    }

    let paramIndex = 0;
    const nextParam = (): unknown => queryParams[paramIndex++];

    type FilterHandler = { position: number; run: () => void };
    const handlers: FilterHandler[] = [];
    const pos = (needle: string): number => upperSql.indexOf(needle);

    if (upperSql.includes('OWNER_ID = ?')) {
      handlers.push({
        position: pos('OWNER_ID = ?'),
        run: () => {
          const ownerId = nextParam() as string;
          results = results.filter((m) => m.owner_id === ownerId);
        },
      });
    }

    if (upperSql.includes('WORKSPACE_ID = ?')) {
      handlers.push({
        position: pos('WORKSPACE_ID = ?'),
        run: () => {
          const workspaceId = nextParam() as string;
          results = results.filter((m) => (m.workspace_id ?? null) === workspaceId);
        },
      });
    }

    if (upperSql.includes('ARCHIVED = ?')) {
      handlers.push({
        position: pos('ARCHIVED = ?'),
        run: () => {
          const archived = nextParam() as number;
          results = results.filter((m) => m.archived === archived);
        },
      });
    } else if (upperSql.includes('ARCHIVED = 0')) {
      handlers.push({
        position: pos('ARCHIVED = 0'),
        run: () => {
          results = results.filter((m) => m.archived === 0);
        },
      });
    }

    if (upperSql.includes('COMPRESSION_META IS NOT NULL')) {
      handlers.push({
        position: pos('COMPRESSION_META IS NOT NULL'),
        run: () => {
          results = results.filter(
            (m) =>
              (m as Record<string, unknown>).compression_meta != null &&
              (m as Record<string, unknown>).compression_meta !== '',
          );
        },
      });
    }

    if (upperSql.includes('PROJECT_ID = ?')) {
      handlers.push({
        position: pos('PROJECT_ID = ?'),
        run: () => {
          const projectId = nextParam() as string;
          results = results.filter((m) => (m.project_id ?? '') === projectId);
        },
      });
    }

    if (upperSql.includes('LEVEL IN (')) {
      const levelMatch = upperSql.match(/LEVEL IN \(([^)]+)\)/);
      const levelClause = levelMatch?.[1] ?? '';
      if (levelClause.includes('?')) {
        const count = levelClause.split(',').length;
        handlers.push({
          position: pos('LEVEL IN ('),
          run: () => {
            const levels: string[] = [];
            for (let i = 0; i < count; i++) {
              levels.push(nextParam() as string);
            }
            results = results.filter((m) => levels.includes(m.level ?? 'note'));
          },
        });
      } else if (levelClause.includes("'NOTE'") && levelClause.includes("'RAW'")) {
        handlers.push({
          position: pos('LEVEL IN ('),
          run: () => {
            results = results.filter((m) => {
              const level = m.level ?? 'note';
              return level === 'note' || level === 'raw';
            });
          },
        });
      }
    }

    if (upperSql.includes('IMPORTANCE >= ?')) {
      handlers.push({
        position: pos('IMPORTANCE >= ?'),
        run: () => {
          const importanceMin = nextParam() as number;
          results = results.filter((m) => (m.importance ?? 50) >= importanceMin);
        },
      });
    }

    if (upperSql.includes('ACCESS_COUNT >= ?')) {
      handlers.push({
        position: pos('ACCESS_COUNT >= ?'),
        run: () => {
          const minAccess = nextParam() as number;
          results = results.filter((m) => (m.access_count ?? 0) >= minAccess);
        },
      });
    }

    if (upperSql.includes('UPDATED_AT < ?')) {
      handlers.push({
        position: pos('UPDATED_AT < ?'),
        run: () => {
          const cutoff = nextParam() as string;
          results = results.filter((m) => m.updated_at < cutoff);
        },
      });
    }

    if (upperSql.includes('SEMANTIC_HASH = ?')) {
      handlers.push({
        position: pos('SEMANTIC_HASH = ?'),
        run: () => {
          const semanticHash = nextParam() as string;
          results = results.filter((m) => (m.semantic_hash ?? '') === semanticHash);
        },
      });
    }

    if (upperSql.includes('EMBEDDING_ID IS NULL OR EMBEDDING_ID =')) {
      handlers.push({
        position: pos('EMBEDDING_ID IS NULL'),
        run: () => {
          results = results.filter(
            (m) => m.embedding_id === null || m.embedding_id === undefined || m.embedding_id === '',
          );
        },
      });
    }

    if (upperSql.includes('PROJECT = ?') && !upperSql.includes('PROJECT LIKE')) {
      handlers.push({
        position: pos('PROJECT = ?'),
        run: () => {
          const project = nextParam() as string;
          results = results.filter((m) => m.project === project);
        },
      });
    }

    if (upperSql.includes('CATEGORY = ?')) {
      handlers.push({
        position: pos('CATEGORY = ?'),
        run: () => {
          const category = nextParam() as string;
          results = results.filter((m) => (m.category ?? '') === category);
        },
      });
    }

    if (upperSql.includes('MEMORY_TYPE = ?')) {
      handlers.push({
        position: pos('MEMORY_TYPE = ?'),
        run: () => {
          const memoryType = nextParam() as string;
          results = results.filter((m) => (m.memory_type ?? 'note') === memoryType);
        },
      });
    }

    if (upperSql.includes('FAVORITE = ?')) {
      handlers.push({
        position: pos('FAVORITE = ?'),
        run: () => {
          const favorite = nextParam() as number;
          results = results.filter((m) => m.favorite === favorite);
        },
      });
    }

    if (
      upperSql.includes(
        '(TITLE LIKE ? OR CONTENT LIKE ? OR SUMMARY LIKE ? OR KEYWORDS LIKE ? OR CODENAME LIKE ?)',
      )
    ) {
      handlers.push({
        position: pos(
          '(TITLE LIKE ? OR CONTENT LIKE ? OR SUMMARY LIKE ? OR KEYWORDS LIKE ? OR CODENAME LIKE ?)',
        ),
        run: () => {
          const keyword = (nextParam() as string).slice(1, -1).toLowerCase();
          nextParam();
          nextParam();
          nextParam();
          nextParam();
          results = results.filter(
            (m) =>
              m.title.toLowerCase().includes(keyword) ||
              m.content.toLowerCase().includes(keyword) ||
              m.summary.toLowerCase().includes(keyword) ||
              (m.keywords ?? '').toLowerCase().includes(keyword) ||
              (m.codename ?? '').toLowerCase().includes(keyword),
          );
        },
      });
    } else if (upperSql.includes('(TITLE LIKE ? OR CONTENT LIKE ?')) {
      handlers.push({
        position: pos('(TITLE LIKE ? OR CONTENT LIKE ?'),
        run: () => {
          const keyword = (nextParam() as string).slice(1, -1).toLowerCase();
          nextParam();
          nextParam();
          nextParam();
          nextParam();
          nextParam();
          if (upperSql.includes('ALIASES LIKE ?')) {
            nextParam();
          }
          results = results.filter(
            (m) =>
              m.title.toLowerCase().includes(keyword) ||
              m.content.toLowerCase().includes(keyword) ||
              m.summary.toLowerCase().includes(keyword) ||
              m.project.toLowerCase().includes(keyword) ||
              (m.codename ?? '').toLowerCase().includes(keyword) ||
              (m.keywords ?? '').toLowerCase().includes(keyword) ||
              (m.aliases ?? '').toLowerCase().includes(keyword),
          );
        },
      });
    }

    if (upperSql.includes('SOURCE_PATH = ?')) {
      handlers.push({
        position: pos('SOURCE_PATH = ?'),
        run: () => {
          const sourcePath = nextParam() as string;
          results = results.filter((m) => (m.source_path ?? null) === sourcePath);
        },
      });
    }

    if (upperSql.includes('(TAGS LIKE ? OR KEYWORDS LIKE ?)')) {
      handlers.push({
        position: pos('(TAGS LIKE ? OR KEYWORDS LIKE ?)'),
        run: () => {
          const tagPattern = nextParam() as string;
          nextParam();
          const tag = tagPattern.slice(2, -2);
          results = results.filter(
            (m) =>
              m.tags.includes(`"${tag}"`) ||
              m.tags.includes(tag) ||
              (m.keywords ?? '').includes(`"${tag}"`),
          );
        },
      });
    } else if (upperSql.includes('TAGS LIKE ?')) {
      handlers.push({
        position: pos('TAGS LIKE ?'),
        run: () => {
          const tagPattern = nextParam() as string;
          const tag = tagPattern.slice(2, -2);
          results = results.filter((m) => m.tags.includes(`"${tag}"`) || m.tags.includes(tag));
        },
      });
    }

    handlers.sort((a, b) => a.position - b.position);
    for (const handler of handlers) {
      handler.run();
    }

    return results;
  }

  seed(data: MemoryRow[]): void {
    for (const row of data) {
      this.memories.set(row.id, row);
    }
  }

  clear(): void {
    this.memories.clear();
    this.relations.clear();
    this.identities.clear();
    this.identityByHash.clear();
    this.clients.clear();
    this.workspaces.clear();
    this.organizations.clear();
    this.workspaceMemberships.clear();
    this.agents.clear();
    this.settings.clear();
    this.auditLogs = [];
    this.cloudRegions.clear();
    this.cloudTenantMetadata.clear();
    this.cloudWorkspaceRegions.clear();
    this.cloudUsageRecords.clear();
    this.cloudDrSchedules.clear();
    this.pluginRegistry.clear();
    this.pluginAllowList.clear();
    this.searchGraphSyncRuns.clear();
    this.searchGraphSyncState.clear();
    this.contentScaleSyncRuns.clear();
    this.contentScaleSyncState.clear();
    this.knowledgeFabricIngestRuns.clear();
    this.knowledgeFabricConnectorState.clear();
    this.knowledgeFabricExternalRefs.clear();
    this.platformWebhookSubscriptions.clear();
  }

  getAuditLogCount(): number {
    return this.auditLogs.length;
  }

  removeWorkspaceMembership(workspaceId: string, identityId: string): void {
    for (const [key, row] of this.workspaceMemberships.entries()) {
      if (row.workspace_id === workspaceId && row.identity_id === identityId) {
        this.workspaceMemberships.delete(key);
      }
    }
  }

  getMemory(id: string): MemoryRow | undefined {
    return this.memories.get(id);
  }
}
