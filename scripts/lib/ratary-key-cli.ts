import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(repoRoot, '.env'), quiet: true });

export interface KeyCliOptions {
  baseUrl: string;
  name?: string;
  id?: string;
  apiKey?: string;
  writeEnv: boolean;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success?: false;
  error?: { code?: string; message?: string };
  message?: string;
}

export interface PublicIdentity {
  id: string;
  type: string;
  name: string;
  active: boolean;
  last_used_at?: string | null;
  revoked_at?: string | null;
}

function extractErrorMessage(body: ApiError, status: number): string {
  return body.error?.message ?? body.message ?? `HTTP ${status}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as ApiSuccess<T> | ApiError) : undefined;

  if (!response.ok || !parsed || !('success' in parsed) || parsed.success !== true) {
    const message = parsed ? extractErrorMessage(parsed as ApiError, response.status) : `HTTP ${response.status}`;
    const code = (parsed as ApiError)?.error?.code;
    throw Object.assign(new Error(message), { code, status: response.status });
  }

  return parsed.data;
}

async function fetchRatary(
  baseUrl: string,
  path: string,
  init: RequestInit,
): Promise<Response> {
  const url = `${baseUrl}/api/v1${path}`;
  try {
    return await fetch(url, init);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Tidak bisa hubungi Ratary di ${baseUrl} (${reason}).\n` +
        `  • Lokal: jalankan dulu \`npm run dev\` atau \`npm start\`\n` +
        `  • Production: npm run key:create -- --url https://ratary.ontorata.com`,
    );
  }
}

function authHeaders(apiKey: string): Record<string, string> {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'X-API-Key': apiKey,
  };
}

export function resolveBaseUrl(override?: string): string {
  const raw =
    override?.trim() ||
    process.env.RATARY_BASE_URL?.trim() ||
    process.env.VITE_RATARY_BASE_URL?.trim() ||
    `http://localhost:${process.env.PORT?.trim() || '3000'}`;
  return raw.replace(/\/$/, '').replace(/\/api\/v1$/, '');
}

export function parseKeyCliArgs(argv: string[], command: 'create' | 'rotate' | 'list'): KeyCliOptions {
  let baseUrl = resolveBaseUrl();
  let name: string | undefined;
  let id: string | undefined;
  let apiKey = process.env.RATARY_API_KEY?.trim();
  let writeEnv = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { baseUrl, writeEnv, apiKey };
    if (arg === '--url' && argv[i + 1]) {
      baseUrl = resolveBaseUrl(argv[++i]);
      continue;
    }
    if (arg === '--name' && argv[i + 1]) {
      name = argv[++i];
      continue;
    }
    if (arg === '--id' && argv[i + 1]) {
      id = argv[++i];
      continue;
    }
    if (arg === '--key' && argv[i + 1]) {
      apiKey = argv[++i];
      continue;
    }
    if (arg === '--write-env') writeEnv = true;
  }

  if (command === 'create' && !name) name = 'default';

  return { baseUrl, name, id, apiKey, writeEnv };
}

export function printKeyHelp(command?: string): void {
  if (!command || command === 'create') {
    console.log(`npm run key:create — buat API key baru (aic_...)

  npm run key:create
  npm run key:create -- --url https://ratary.ontorata.com
  npm run key:create -- --url https://ratary.ontorata.com --name studio-vercel
  npm run key:create -- --url https://ratary.ontorata.com --key aic_KEY_LAMA
  npm run key:create -- --write-env
`);
  }
  if (!command || command === 'rotate') {
    console.log(`npm run key:rotate — ganti secret (key lama langsung mati)

  npm run key:list -- --url https://ratary.ontorata.com --key aic_KEY_LAMA
  npm run key:rotate -- --url https://ratary.ontorata.com --key aic_KEY_LAMA --name studio-vercel
  npm run key:rotate -- --url https://ratary.ontorata.com --key aic_KEY_LAMA --id UUID_IDENTITY
  npm run key:rotate -- --write-env
`);
  }
  if (!command || command === 'list') {
    console.log(`npm run key:list — lihat identity (tanpa secret)

  npm run key:list -- --url https://ratary.ontorata.com --key aic_KEY_LAMA
`);
  }
  console.log(`Env: RATARY_BASE_URL, RATARY_API_KEY, PORT
`);
}

export async function apiPost<T>(
  baseUrl: string,
  path: string,
  body: Record<string, unknown> | undefined,
  apiKey?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (apiKey) Object.assign(headers, authHeaders(apiKey));

  const response = await fetchRatary(baseUrl, path, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(response);
}

export async function apiGet<T>(baseUrl: string, path: string, apiKey: string): Promise<T> {
  const response = await fetchRatary(baseUrl, path, {
    method: 'GET',
    headers: authHeaders(apiKey),
  });
  return parseResponse<T>(response);
}

export async function tryBootstrap(baseUrl: string, name: string): Promise<string | null> {
  try {
    const data = await apiPost<{ apiKey: string }>(baseUrl, '/auth/bootstrap', { name });
    return data.apiKey;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'FORBIDDEN') return null;
    throw error;
  }
}

export async function createIdentity(
  baseUrl: string,
  name: string,
  existingKey: string,
): Promise<string> {
  const data = await apiPost<{ apiKey: string }>(
    baseUrl,
    '/auth/identities',
    { name, type: 'api_key', description: 'Created via npm run key:create' },
    existingKey,
  );
  return data.apiKey;
}

export async function listIdentities(baseUrl: string, apiKey: string): Promise<PublicIdentity[]> {
  return apiGet<PublicIdentity[]>(baseUrl, '/auth/identities', apiKey);
}

export async function rotateIdentity(
  baseUrl: string,
  identityId: string,
  apiKey: string,
): Promise<string> {
  const data = await apiPost<{ apiKey?: string }>(
    baseUrl,
    `/auth/identities/${identityId}/rotate`,
    {},
    apiKey,
  );
  if (!data.apiKey) throw new Error('Rotate did not return apiKey');
  return data.apiKey;
}

export function pickRotatableIdentity(
  identities: PublicIdentity[],
  opts: Pick<KeyCliOptions, 'id' | 'name'>,
): PublicIdentity {
  const candidates = identities.filter(
    (row) => row.active && !row.revoked_at && row.type === 'api_key',
  );

  if (candidates.length === 0) {
    throw new Error('Tidak ada identity api_key aktif untuk di-rotate');
  }

  if (opts.id) {
    const match = candidates.find((row) => row.id === opts.id);
    if (!match) throw new Error(`Identity id tidak ditemukan: ${opts.id}`);
    return match;
  }

  if (opts.name) {
    const match = candidates.find((row) => row.name === opts.name);
    if (!match) throw new Error(`Identity name tidak ditemukan: ${opts.name}`);
    return match;
  }

  if (candidates.length === 1) return candidates[0];

  const lines = candidates.map((row) => `  ${row.id}  ${row.name}`).join('\n');
  throw new Error(
    `Ada ${candidates.length} identity. Pilih dengan --name atau --id:\n${lines}`,
  );
}

export async function writeKeyToEnv(baseUrl: string, apiKey: string): Promise<void> {
  const envPath = resolve(repoRoot, '.env');
  let content: string;
  try {
    content = await readFile(envPath, 'utf-8');
  } catch {
    console.log('\n(Tip: --write-env skipped — .env tidak ada)');
    return;
  }

  const setLine = (key: string, value: string, text: string): string => {
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}=${value}`;
    return pattern.test(text) ? text.replace(pattern, line) : `${text.trimEnd()}\n${line}\n`;
  };

  content = setLine('RATARY_BASE_URL', baseUrl, content);
  content = setLine('RATARY_API_KEY', apiKey, content);
  await writeFile(envPath, content, 'utf-8');
  console.log('\n✓ .env di-update: RATARY_BASE_URL, RATARY_API_KEY');
}

export function printApiKeyResult(baseUrl: string, apiKey: string, note: string): void {
  console.log(`
════════════════════════════════════════
API KEY BARU (simpan sekarang — hanya sekali):

  ${apiKey}

════════════════════════════════════════
${note}

Ontorata Studio (.env atau Vercel):
  VITE_RATARY_BASE_URL=${baseUrl}
  VITE_RATARY_API_KEY=${apiKey}
`);
}
