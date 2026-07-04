import type {
  SsoCallbackInput,
  SsoIdentityResult,
  SsoLoginRequest,
} from '../types/security.types.js';

export interface IIdentityFederation {
  readonly enabled: boolean;
  getLoginUrl(request: SsoLoginRequest): Promise<{ url: string; state: string }>;
  handleCallback(input: SsoCallbackInput): Promise<SsoIdentityResult>;
  getMetadata(): Promise<Record<string, unknown>>;
}
