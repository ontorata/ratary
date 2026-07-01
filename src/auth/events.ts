import type { AuthContext } from './auth.types.js';

export type AuthEventName =
  | 'identity.created'
  | 'identity.used'
  | 'identity.revoked'
  | 'identity.rotated'
  | 'auth.failed'
  | 'bootstrap.completed'
  | 'client.created'
  | 'client.deactivated';

export interface AuthEventPayload {
  event: AuthEventName;
  identityId?: string | null;
  ownerId?: string | null;
  clientId?: string | null;
  resource?: string | null;
  resourceId?: string | null;
  context?: AuthContext;
  metadata?: Record<string, unknown>;
}

type AuthEventHandler = (payload: AuthEventPayload) => void | Promise<void>;

export class AuthEventBus {
  private handlers: AuthEventHandler[] = [];

  subscribe(handler: AuthEventHandler): void {
    this.handlers.push(handler);
  }

  async emit(payload: AuthEventPayload): Promise<void> {
    for (const handler of this.handlers) {
      await handler(payload);
    }
  }
}

export const authEventBus = new AuthEventBus();

export function emitAuthEvent(payload: AuthEventPayload): void {
  void authEventBus.emit(payload);
}
