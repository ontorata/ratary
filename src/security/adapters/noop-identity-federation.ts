import type { IIdentityFederation } from '../ports/iidentity-federation.port.js';
import type {
  SsoCallbackInput,
  SsoIdentityResult,
  SsoLoginRequest,
} from '../types/security.types.js';
import { ValidationError } from '../../types/errors.js';

export class NoOpIdentityFederation implements IIdentityFederation {
  readonly enabled = false;

  async getLoginUrl(_request: SsoLoginRequest): Promise<{ url: string; state: string }> {
    throw new ValidationError('SSO is not enabled');
  }

  async handleCallback(_input: SsoCallbackInput): Promise<SsoIdentityResult> {
    throw new ValidationError('SSO is not enabled');
  }

  async getMetadata(): Promise<Record<string, unknown>> {
    return { enabled: false };
  }
}
