import type { AuthContext } from '../auth.types.js';
import { isApiKeyFormat, isOAuthTokenFormat } from '../crypto.js';
import { extractBearerToken, isJwtFormat } from '../token-utils.js';

export interface OidcUserInfo {
  sub?: string;
  email?: string;
  name?: string;
}

export function extractOidcAccessToken(ctx: AuthContext): string | null {
  const token = extractBearerToken(ctx);
  if (!token || isApiKeyFormat(token) || isOAuthTokenFormat(token) || !isJwtFormat(token)) {
    return null;
  }
  return token;
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length < 2) return {};
  try {
    return JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

export function issuerMatches(token: string, expectedIssuer: string): boolean {
  const payload = decodeJwtPayload(token);
  const tokenIssuer = typeof payload.iss === 'string' ? payload.iss.replace(/\/$/, '') : '';
  const issuer = expectedIssuer.replace(/\/$/, '');
  return !tokenIssuer || tokenIssuer === issuer;
}

export async function fetchOidcUserInfo(
  issuer: string,
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<OidcUserInfo> {
  const userInfoUrl = `${issuer.replace(/\/$/, '')}/oidc/v1/userinfo`;
  const legacyUrl = `${issuer.replace(/\/$/, '')}/userinfo`;

  for (const url of [userInfoUrl, legacyUrl]) {
    const response = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      return (await response.json()) as OidcUserInfo;
    }
  }

  const payload = decodeJwtPayload(accessToken);
  const sub = typeof payload.sub === 'string' ? payload.sub : undefined;
  if (sub) {
    return {
      sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
    };
  }

  throw new Error('OIDC userinfo failed');
}

export function studioOidcIdentityName(subject: string): string {
  return `studio_oidc:${subject}`;
}
