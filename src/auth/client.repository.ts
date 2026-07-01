import type { D1Client } from '../db/d1-client.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';
import type { Client, ClientRow } from './auth.types.js';

function rowToClient(row: ClientRow): Client {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata || '{}') as Record<string, unknown>;
  } catch {
    // keep empty
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    metadata,
    createdAt: row.created_at,
    active: row.active === 1,
  };
}

export interface InsertClientData {
  id?: string;
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export class ClientRepository {
  constructor(private readonly db: D1Client) {}

  async insert(data: InsertClientData): Promise<Client> {
    const id = data.id ?? generateId();
    const now = data.createdAt ?? nowISO();

    await this.db.execute(
      `INSERT INTO clients (id, name, type, description, metadata, created_at, active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        data.name,
        data.type,
        data.description ?? '',
        JSON.stringify(data.metadata ?? {}),
        now,
      ],
    );

    const client = await this.findById(id);
    if (!client) throw new Error('Failed to retrieve inserted client');
    return client;
  }

  async findById(id: string): Promise<Client | null> {
    const rows = await this.db.query<ClientRow>('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0] ? rowToClient(rows[0]) : null;
  }
}
