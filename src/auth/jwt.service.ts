import { createHmac, timingSafeEqual } from 'node:crypto';
import { getAuthSecret } from './crypto.js';
import { ForbiddenError, UnauthorizedError } from '../types/errors.js';

export interface JwtClaims {
  sub: string;
  owner_id: string;
  client_id: string | null;
  permissions: string[];
  type: 'jwt';
  iat: number;
  exp: number;
  jti?: string;
  aud?: string;
  iss?: string;
  organization_id?: string;
  workspace_roles?: Array<{ workspace_id: string; role: string }>;
}

export interface SignJwtInput {
  identityId: string;
  ownerId: string;
  clientId: string | null;
  permissions: string[];
  expiresInSec?: number;
  jti?: string;
  audience?: string;
  issuer?: string;
  organizationId?: string;
  workspaceRoles?: Array<{ workspaceId: string; role: string }>;
}

const DEFAULT_EXPIRES_IN_SEC = 3600;

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

function signSegment(headerB64: string, payloadB64: string): string {
  const signingInput = `${headerB64}.${payloadB64}`;
  return createHmac('sha256', getAuthSecret()).update(signingInput).digest('base64url');
}

export class JwtService {
  sign(input: SignJwtInput): string {
    const headerB64 = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const expiresInSec = input.expiresInSec ?? DEFAULT_EXPIRES_IN_SEC;
    const payload: JwtClaims = {
      sub: input.identityId,
      owner_id: input.ownerId,
      client_id: input.clientId,
      permissions: input.permissions,
      type: 'jwt',
      iat: now,
      exp: now + expiresInSec,
    };
    if (input.jti) payload.jti = input.jti;
    if (input.audience) payload.aud = input.audience;
    if (input.issuer) payload.iss = input.issuer;
    if (input.organizationId) {
      payload.organization_id = input.organizationId;
    }
    if (input.workspaceRoles?.length) {
      payload.workspace_roles = input.workspaceRoles.map((entry) => ({
        workspace_id: entry.workspaceId,
        role: entry.role,
      }));
    }
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signature = signSegment(headerB64, payloadB64);
    return `${headerB64}.${payloadB64}.${signature}`;
  }

  verify(token: string): JwtClaims {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedError('Invalid JWT format');
    }

    const [headerB64, payloadB64, signature] = parts;
    const expected = signSegment(headerB64, payloadB64);

    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      throw new UnauthorizedError('Invalid JWT signature');
    }

    let payload: JwtClaims;
    try {
      payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8')) as JwtClaims;
    } catch {
      throw new UnauthorizedError('Invalid JWT payload');
    }

    if (payload.type !== 'jwt' || !payload.sub || !payload.owner_id) {
      throw new UnauthorizedError('Invalid JWT claims');
    }

    if (payload.aud && payload.aud !== 'studio') {
      throw new UnauthorizedError('Invalid JWT audience');
    }

    if (payload.iss && payload.iss !== 'ratary') {
      throw new UnauthorizedError('Invalid JWT issuer');
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new ForbiddenError('JWT has expired');
    }

    return payload;
  }
}
