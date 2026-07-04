import { generateId, nowISO } from '../../utils/memory-mapper.js';
import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { IWebhookSubscriptionStore } from '../../ai-brain-platform/ports/iwebhook-subscription-store.port.js';
import type {
  CreateWebhookSubscriptionInput,
  UpdateWebhookSubscriptionInput,
  WebhookSubscription,
} from '../../ai-brain-platform/types/platform.types.js';
import { NotFoundError } from '../../types/errors.js';

interface WebhookRow {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  url: string;
  secret: string | null;
  topics_json: string;
  active: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: WebhookRow): WebhookSubscription {
  return {
    id: row.id,
    ownerId: row.owner_id,
    workspaceId: row.workspace_id ?? undefined,
    url: row.url,
    secret: row.secret ?? undefined,
    topics: JSON.parse(row.topics_json) as string[],
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function scopeKey(scope: MemoryScope): { ownerId: string; workspaceId: string | null } {
  return { ownerId: scope.ownerId, workspaceId: scope.workspaceId ?? null };
}

/** SQL-backed webhook subscription store (Phase 24). */
export class SqlWebhookSubscriptionStore implements IWebhookSubscriptionStore {
  constructor(private readonly sql: ISqlDatabase) {}

  async create(
    scope: MemoryScope,
    input: CreateWebhookSubscriptionInput,
  ): Promise<WebhookSubscription> {
    const id = generateId();
    const now = nowISO();
    const { ownerId, workspaceId } = scopeKey(scope);

    await this.sql.execute(
      `INSERT INTO platform_webhook_subscriptions
       (id, owner_id, workspace_id, url, secret, topics_json, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ownerId,
        workspaceId,
        input.url,
        input.secret ?? null,
        JSON.stringify(input.topics),
        input.active === false ? 0 : 1,
        now,
        now,
      ],
    );

    return {
      id,
      ownerId,
      workspaceId: workspaceId ?? undefined,
      url: input.url,
      secret: input.secret,
      topics: input.topics,
      active: input.active !== false,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(
    scope: MemoryScope,
    id: string,
    input: UpdateWebhookSubscriptionInput,
  ): Promise<WebhookSubscription> {
    const existing = await this.getById(scope, id);
    if (!existing) throw new NotFoundError('Webhook subscription not found');

    const updated: WebhookSubscription = {
      ...existing,
      url: input.url ?? existing.url,
      secret: input.secret !== undefined ? input.secret : existing.secret,
      topics: input.topics ?? existing.topics,
      active: input.active !== undefined ? input.active : existing.active,
      updatedAt: nowISO(),
    };

    await this.sql.execute(
      `UPDATE platform_webhook_subscriptions
       SET url = ?, secret = ?, topics_json = ?, active = ?, updated_at = ?
       WHERE id = ? AND owner_id = ? AND workspace_id IS ?`,
      [
        updated.url,
        updated.secret ?? null,
        JSON.stringify(updated.topics),
        updated.active ? 1 : 0,
        updated.updatedAt,
        id,
        scope.ownerId,
        scope.workspaceId ?? null,
      ],
    );

    return updated;
  }

  async delete(scope: MemoryScope, id: string): Promise<void> {
    const { ownerId, workspaceId } = scopeKey(scope);
    await this.sql.execute(
      `DELETE FROM platform_webhook_subscriptions
       WHERE id = ? AND owner_id = ? AND workspace_id IS ?`,
      [id, ownerId, workspaceId],
    );
  }

  async list(scope: MemoryScope): Promise<WebhookSubscription[]> {
    const { ownerId, workspaceId } = scopeKey(scope);
    const rows = await this.sql.query<WebhookRow>(
      `SELECT id, owner_id, workspace_id, url, secret, topics_json, active, created_at, updated_at
       FROM platform_webhook_subscriptions
       WHERE owner_id = ? AND workspace_id IS ?
       ORDER BY created_at DESC`,
      [ownerId, workspaceId],
    );
    return rows.map(mapRow);
  }

  async findActiveByTopic(topic: string, ownerId: string): Promise<WebhookSubscription[]> {
    const rows = await this.sql.query<WebhookRow>(
      `SELECT id, owner_id, workspace_id, url, secret, topics_json, active, created_at, updated_at
       FROM platform_webhook_subscriptions
       WHERE owner_id = ? AND active = 1`,
      [ownerId],
    );
    return rows.map(mapRow).filter((sub) => sub.topics.includes(topic));
  }

  async countActive(scope: MemoryScope): Promise<number> {
    const subs = await this.list(scope);
    return subs.filter((s) => s.active).length;
  }

  private async getById(scope: MemoryScope, id: string): Promise<WebhookSubscription | null> {
    const { ownerId, workspaceId } = scopeKey(scope);
    const rows = await this.sql.query<WebhookRow>(
      `SELECT id, owner_id, workspace_id, url, secret, topics_json, active, created_at, updated_at
       FROM platform_webhook_subscriptions
       WHERE id = ? AND owner_id = ? AND workspace_id IS ?`,
      [id, ownerId, workspaceId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }
}

export class InMemoryWebhookSubscriptionStore implements IWebhookSubscriptionStore {
  private readonly subs = new Map<string, WebhookSubscription>();

  private key(scope: MemoryScope, id: string): string {
    return `${scope.ownerId}:${scope.workspaceId ?? ''}:${id}`;
  }

  async create(
    scope: MemoryScope,
    input: CreateWebhookSubscriptionInput,
  ): Promise<WebhookSubscription> {
    const id = generateId();
    const now = nowISO();
    const sub: WebhookSubscription = {
      id,
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      url: input.url,
      secret: input.secret,
      topics: input.topics,
      active: input.active !== false,
      createdAt: now,
      updatedAt: now,
    };
    this.subs.set(this.key(scope, id), sub);
    return sub;
  }

  async update(
    scope: MemoryScope,
    id: string,
    input: UpdateWebhookSubscriptionInput,
  ): Promise<WebhookSubscription> {
    const existing = this.subs.get(this.key(scope, id));
    if (!existing) throw new NotFoundError('Webhook subscription not found');
    const updated = {
      ...existing,
      url: input.url ?? existing.url,
      secret: input.secret !== undefined ? input.secret : existing.secret,
      topics: input.topics ?? existing.topics,
      active: input.active !== undefined ? input.active : existing.active,
      updatedAt: nowISO(),
    };
    this.subs.set(this.key(scope, id), updated);
    return updated;
  }

  async delete(scope: MemoryScope, id: string): Promise<void> {
    this.subs.delete(this.key(scope, id));
  }

  async list(scope: MemoryScope): Promise<WebhookSubscription[]> {
    const prefix = `${scope.ownerId}:${scope.workspaceId ?? ''}:`;
    return [...this.subs.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .map(([, v]) => v)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findActiveByTopic(topic: string, ownerId: string): Promise<WebhookSubscription[]> {
    return [...this.subs.values()].filter(
      (s) => s.ownerId === ownerId && s.active && s.topics.includes(topic),
    );
  }

  async countActive(scope: MemoryScope): Promise<number> {
    return (await this.list(scope)).filter((s) => s.active).length;
  }
}

export class NoOpWebhookSubscriptionStore implements IWebhookSubscriptionStore {
  async create(): Promise<WebhookSubscription> {
    throw new Error('AI Brain platform disabled');
  }

  async update(): Promise<WebhookSubscription> {
    throw new Error('AI Brain platform disabled');
  }

  async delete(): Promise<void> {
    // intentionally empty
  }

  async list(): Promise<WebhookSubscription[]> {
    return [];
  }

  async findActiveByTopic(): Promise<WebhookSubscription[]> {
    return [];
  }

  async countActive(): Promise<number> {
    return 0;
  }
}
