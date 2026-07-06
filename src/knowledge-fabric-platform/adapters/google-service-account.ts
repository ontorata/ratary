import { createSign } from 'node:crypto';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface GoogleServiceAccountCredentials {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

export function parseGoogleServiceAccountCredentials(raw: string): GoogleServiceAccountCredentials {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error('GOOGLE_DRIVE_CREDENTIALS_JSON is not valid JSON');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('GOOGLE_DRIVE_CREDENTIALS_JSON must be a JSON object');
  }
  const creds = parsed as Record<string, unknown>;
  const clientEmail = creds.client_email;
  const privateKey = creds.private_key;
  if (typeof clientEmail !== 'string' || !clientEmail.trim()) {
    throw new Error('GOOGLE_DRIVE_CREDENTIALS_JSON missing client_email');
  }
  if (typeof privateKey !== 'string' || !privateKey.includes('BEGIN')) {
    throw new Error('GOOGLE_DRIVE_CREDENTIALS_JSON missing private_key');
  }
  return {
    client_email: clientEmail.trim(),
    private_key: privateKey,
    token_uri:
      typeof creds.token_uri === 'string' && creds.token_uri.trim()
        ? creds.token_uri.trim()
        : GOOGLE_TOKEN_URL,
  };
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signJwtRs256(unsigned: string, privateKeyPem: string): string {
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  return signer.sign(privateKeyPem).toString('base64url');
}

/** Exchange service-account JWT for a short-lived access token (Google OAuth2). */
export async function fetchGoogleServiceAccountAccessToken(
  credentialsJson: string,
  scopes: string[],
): Promise<string> {
  const creds = parseGoogleServiceAccountCredentials(credentialsJson);
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: creds.client_email,
      scope: scopes.join(' '),
      aud: creds.token_uri ?? GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signature = signJwtRs256(unsigned, creds.private_key);
  const assertion = `${unsigned}.${signature}`;

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetch(creds.token_uri ?? GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Google token response missing access_token');
  }
  return data.access_token;
}
