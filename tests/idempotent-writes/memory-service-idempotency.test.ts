/**
 * PI-C (ADR-067) — MemoryService idempotent create contract.
 *
 * Covers the locked owner decisions at the service seam:
 * - C1/C3: same request_id twice ⇒ one row, second call replays.
 * - C7: claim-first flow — crash after claim (intent without memory) is
 *   recovered by the next retry USING THE CANONICAL ID from the ledger.
 * - Non-regression: no request_id ⇒ pre-PI-C behavior (duplicates allowed).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { createMemoryService } from '../../src/services/create-memory-service.js';
import { SqlWriteIntentStore } from '../../src/infrastructure/write-intents/sql-write-intent-store.js';
import type { MemoryService } from '../../src/services/memory.service.js';
import type { CreateMemoryInput } from '../../src/types/memory.js';

const OWNER = 'owner-idem';
const SCOPE = { ownerId: OWNER };
const REQUEST_ID = '3b241101-e2bb-4255-8caf-4136c566a962';

function input(overrides: Partial<CreateMemoryInput> = {}): CreateMemoryInput {
  return {
    title: 'Idempotency test memory',
    project: 'pi-c',
    content: 'Body of the idempotency test memory.',
    summary: '',
    tags: [],
    favorite: false,
    ...overrides,
  } as CreateMemoryInput;
}

describe('MemoryService idempotent create (PI-C)', () => {
  let db: SqliteMemoryDatabase;
  let service: MemoryService;
  let intents: SqlWriteIntentStore;

  beforeEach(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    service = createMemoryService(db);
    intents = new SqlWriteIntentStore(db);
  });

  async function countMemories(): Promise<number> {
    const rows = await db.query<{ n: number }>(
      'SELECT COUNT(*) as n FROM memories WHERE owner_id = ?',
      [OWNER],
    );
    return rows[0]?.n ?? 0;
  }

  async function countIntents(): Promise<number> {
    const rows = await db.query<{ n: number }>(
      'SELECT COUNT(*) as n FROM memory_write_intents WHERE owner_id = ?',
      [OWNER],
    );
    return rows[0]?.n ?? 0;
  }

  it('same request_id twice creates exactly one memory; second call replays it', async () => {
    const first = await service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID }));
    const second = await service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID }));

    expect(first.replayed).toBe(false);
    expect(second.replayed).toBe(true);
    expect(second.memory.id).toBe(first.memory.id);
    expect(await countMemories()).toBe(1);
    expect(await countIntents()).toBe(1);
  });

  it('intent status flips to completed after a successful create', async () => {
    await service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID }));
    const intent = await intents.getByRequestId(OWNER, REQUEST_ID);
    expect(intent?.status).toBe('completed');
    expect(intent?.resourceType).toBe('memory');
  });

  it('no request_id preserves pre-PI-C behavior: identical saves create two rows', async () => {
    const a = await service.createMemoryIdempotent(SCOPE, input());
    const b = await service.createMemoryIdempotent(SCOPE, input());

    expect(a.replayed).toBe(false);
    expect(b.replayed).toBe(false);
    expect(b.memory.id).not.toBe(a.memory.id);
    expect(await countMemories()).toBe(2);
    expect(await countIntents()).toBe(0);
  });

  it('crash after claim (intent without memory) is recovered with the canonical id (owner DoD)', async () => {
    // Simulate: a previous attempt claimed the request, then died before
    // creating the memory.
    const canonicalId = 'a1b2c3d4-0000-4000-8000-000000000001';
    await intents.claim({
      ownerId: OWNER,
      requestId: REQUEST_ID,
      operation: 'create',
      resourceType: 'memory',
      resourceId: canonicalId,
    });

    const recovered = await service.createMemoryIdempotent(
      SCOPE,
      input({ request_id: REQUEST_ID }),
    );

    // The retry MUST reuse the canonical id from the ledger, never a new one.
    expect(recovered.memory.id).toBe(canonicalId);
    expect(recovered.replayed).toBe(true);
    expect(await countMemories()).toBe(1);
    expect(await countIntents()).toBe(1);

    // Every subsequent retry replays the identical result.
    const replay = await service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID }));
    expect(replay.replayed).toBe(true);
    expect(replay.memory.id).toBe(canonicalId);
    expect(await countMemories()).toBe(1);
    expect(await countIntents()).toBe(1);
  });

  it('concurrent same-key creates resolve to one row without surfacing an error', async () => {
    const outcomes = await Promise.all([
      service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID })),
      service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID })),
      service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID })),
    ]);

    const ids = new Set(outcomes.map((o) => o.memory.id));
    expect(ids.size).toBe(1);
    expect(outcomes.filter((o) => !o.replayed).length).toBeLessThanOrEqual(1);
    expect(await countMemories()).toBe(1);
  });

  it('same request_id under different owners creates independent memories', async () => {
    const other = { ownerId: 'owner-other' };
    const a = await service.createMemoryIdempotent(SCOPE, input({ request_id: REQUEST_ID }));
    const b = await service.createMemoryIdempotent(other, input({ request_id: REQUEST_ID }));

    expect(a.replayed).toBe(false);
    expect(b.replayed).toBe(false);
    expect(b.memory.id).not.toBe(a.memory.id);
  });
});
