import type { Env } from '../../config/env.js';

const GRAPH_TOKEN_URL = 'https://login.microsoftonline.com';

export interface MicrosoftGraphCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export function parseMicrosoftGraphCredentials(env: Env): MicrosoftGraphCredentials | null {
  const tenantId = env.SHAREPOINT_TENANT_ID?.trim() ?? env.MICROSOFT_GRAPH_TENANT_ID?.trim();
  const clientId = env.SHAREPOINT_CLIENT_ID?.trim() ?? env.MICROSOFT_GRAPH_CLIENT_ID?.trim();
  const clientSecret =
    env.SHAREPOINT_CLIENT_SECRET?.trim() ?? env.MICROSOFT_GRAPH_CLIENT_SECRET?.trim();
  if (!tenantId || !clientId || !clientSecret) return null;
  return { tenantId, clientId, clientSecret };
}

export function canUseMicrosoftGraph(env: Env): boolean {
  return (
    env.CONNECTOR_SYNC_ENABLED &&
    env.KNOWLEDGE_FABRIC_ENABLED &&
    parseMicrosoftGraphCredentials(env) !== null
  );
}

/** OAuth2 client credentials for Microsoft Graph API. */
export async function fetchMicrosoftGraphAccessToken(creds: MicrosoftGraphCredentials): Promise<string> {
  const url = `${GRAPH_TOKEN_URL}/${creds.tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Microsoft Graph token ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Microsoft Graph token response missing access_token');
  }
  return data.access_token;
}
