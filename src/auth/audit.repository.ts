import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';

export interface AuditLogInput {
  event: string;
  identityId?: string | null;
  ownerId?: string | null;
  clientId?: string | null;
  resource?: string | null;
  resourceId?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export class AuditRepository {
  constructor(private readonly db: ISqlDatabase) {}

  async append(input: AuditLogInput): Promise<void> {
    await this.db.execute(
      `INSERT INTO audit_logs (
        id, event, identity_id, owner_id, client_id, resource, resource_id,
        request_id, ip_address, user_agent, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        input.event,
        input.identityId ?? null,
        input.ownerId ?? null,
        input.clientId ?? null,
        input.resource ?? null,
        input.resourceId ?? null,
        input.requestId ?? null,
        input.ipAddress ?? null,
        input.userAgent ?? null,
        JSON.stringify(input.metadata ?? {}),
        nowISO(),
      ],
    );
  }
}
