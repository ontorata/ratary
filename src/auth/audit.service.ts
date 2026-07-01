import type { AuditRepository } from './audit.repository.js';
import { authEventBus, type AuthEventPayload } from './events.js';

export class AuditService {
  constructor(private readonly repository: AuditRepository) {
    authEventBus.subscribe((payload) => this.handleEvent(payload));
  }

  private async handleEvent(payload: AuthEventPayload): Promise<void> {
    await this.repository.append({
      event: payload.event,
      identityId: payload.identityId,
      ownerId: payload.ownerId,
      clientId: payload.clientId,
      resource: payload.resource,
      resourceId: payload.resourceId,
      requestId: payload.context?.requestId,
      ipAddress: payload.context?.ip,
      userAgent: payload.context?.userAgent,
      metadata: payload.metadata,
    });
  }
}
