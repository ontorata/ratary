import { getEnv } from '../config/index.js';
import { DatabaseError } from '../types/errors.js';

export interface D1QueryResult<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta?: {
    changes?: number;
    last_row_id?: number;
    duration?: number;
  };
}

interface CloudflareD1Response<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: Array<{
    results: T[];
    success: boolean;
    meta?: D1QueryResult['meta'];
  }>;
}

export interface D1Client {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<D1QueryResult>;
}

class CloudflareD1Client implements D1Client {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(accountId: string, databaseId: string, apiToken: string) {
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
    this.apiToken = apiToken;
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.execute(sql, params);
    return result.results as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1QueryResult> {
    let response: Response;

    try {
      response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      });
    } catch (error) {
      throw new DatabaseError('Failed to connect to D1 database', error);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new DatabaseError(`D1 API error (${response.status}): ${text}`);
    }

    const data = (await response.json()) as CloudflareD1Response<Record<string, unknown>>;

    if (!data.success || data.errors?.length > 0) {
      const errorMsg = data.errors?.map((e) => e.message).join(', ') ?? 'Unknown D1 error';
      throw new DatabaseError(`D1 query failed: ${errorMsg}`);
    }

    const firstResult = data.result[0];
    if (!firstResult?.success) {
      throw new DatabaseError('D1 query returned unsuccessful result');
    }

    return {
      results: firstResult.results ?? [],
      success: true,
      meta: firstResult.meta,
    };
  }
}

let clientInstance: D1Client | null = null;

export function getD1Client(): D1Client {
  if (clientInstance) return clientInstance;

  const env = getEnv();
  clientInstance = new CloudflareD1Client(
    env.CLOUDFLARE_ACCOUNT_ID,
    env.D1_DATABASE_ID,
    env.D1_API_TOKEN,
  );

  return clientInstance;
}

export function setD1Client(client: D1Client): void {
  clientInstance = client;
}

export function resetD1Client(): void {
  clientInstance = null;
}

export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  favorite INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project);
CREATE INDEX IF NOT EXISTS idx_memories_favorite ON memories(favorite);
CREATE INDEX IF NOT EXISTS idx_memories_archived ON memories(archived);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
`;

export async function runMigrations(client: D1Client = getD1Client()): Promise<void> {
  const statements = MIGRATION_SQL.split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const sql of statements) {
    await client.execute(sql);
  }
}
