import { randomBytes } from 'node:crypto';
import { ValidationError } from '../../types/errors.js';
import type { IIdentityFederation } from '../ports/iidentity-federation.port.js';
import type {
  SsoCallbackInput,
  SsoIdentityResult,
  SsoLoginRequest,
} from '../types/security.types.js';

export interface OidcIdentityFederationOptions {
  issuerUrl: string;
  clientId: string;
  clientSecret?: string;
  scopes?: string[];
  fetchImpl?: typeof fetch;
}

const pendingStates = new Map<string, { redirectUri: string; createdAt: number }>();

/** OIDC authorization-code path (Phase 17 — proven login URL + token exchange stub). */
export class OidcIdentityFederation implements IIdentityFederation {
  readonly enabled = true;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: OidcIdentityFederationOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async getLoginUrl(request: SsoLoginRequest): Promise<{ url: string; state: string }> {
    const state = request.state ?? randomBytes(16).toString('hex');
    pendingStates.set(state, { redirectUri: request.redirectUri, createdAt: Date.now() });

    const scopes = (this.options.scopes ?? ['openid', 'profile', 'email']).join(' ');
    const params = new URLSearchParams({
      client_id: this.options.clientId,
      redirect_uri: request.redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });

    const issuer = this.options.issuerUrl.replace(/\/$/, '');
    return { url: `${issuer}/authorize?${params.toString()}`, state };
  }

  async handleCallback(input: SsoCallbackInput): Promise<SsoIdentityResult> {
    const pending = pendingStates.get(input.state ?? '');
    if (!pending) {
      throw new ValidationError('Invalid or expired SSO state');
    }
    pendingStates.delete(input.state ?? '');

    const issuer = this.options.issuerUrl.replace(/\/$/, '');
    const tokenUrl = `${issuer}/oauth/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: input.code,
      redirect_uri: input.redirectUri,
      client_id: this.options.clientId,
    });
    if (this.options.clientSecret) {
      body.set('client_secret', this.options.clientSecret);
    }

    const response = await this.fetchImpl(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new ValidationError(`OIDC token exchange failed: HTTP ${response.status}`);
    }

    const token = (await response.json()) as {
      access_token?: string;
      id_token?: string;
    };

    if (token.id_token) {
      const payload = parseJwtPayload(token.id_token);
      return {
        subject: String(payload.sub ?? ''),
        email: payload.email ? String(payload.email) : undefined,
        displayName: payload.name ? String(payload.name) : undefined,
        claims: payload,
      };
    }

    return {
      subject: input.code,
      claims: { access_token: token.access_token },
    };
  }

  async getMetadata(): Promise<Record<string, unknown>> {
    const issuer = this.options.issuerUrl.replace(/\/$/, '');
    return {
      enabled: true,
      protocol: 'oidc',
      issuer,
      clientId: this.options.clientId,
      authorizationEndpoint: `${issuer}/authorize`,
      tokenEndpoint: `${issuer}/oauth/token`,
    };
  }
}

function parseJwtPayload(idToken: string): Record<string, unknown> {
  const parts = idToken.split('.');
  if (parts.length < 2) return {};
  try {
    const json = Buffer.from(parts[1]!, 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}
