/**
 * Phase 36 / ADR-069 — T3: SQL provenance query is owner-isolated and
 * deterministic over sqlite.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { SqlProvenanceQuery } from '../../src/infrastructure/provenance/sql-provenance-query.js';
import { PROVENANCE_VERSION } from '../../src/types/provenance.js';

const OWNER_A = 'owner-prov-a';
const OWNER_B = 'owner-prov-b';

async function seed(
  repo: MemoryRepository,
  ownerId: string,
  id: string,
  title: string,
): Promise<void> {
  await repo.insert({
    id,
    title,
    project: 'ratary',
    content: `${title} body`,
    summary: '',
    tags: [],
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'en',
    notes: '',
    codename: id,
    slug: `${ownerId}-${id}`,
    favorite: false,
    ownerId,
  });
}

describe('SqlProvenanceQuery (ADR-069 D3/D5)', () => {
  let db: SqliteMemoryDatabase;
  let memories: MemoryRepository;
  let relations: MemoryRelationRepository;
  let query: SqlProvenanceQuery;
  let decisionId: string;
  let priorId: string;
  let constraintId: string;
  let outcomeId: string;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    memories = new MemoryRepository(db);
    relations = new MemoryRelationRepository(db);
    query = new SqlProvenanceQuery(db);

    decisionId = 'mem-decision';
    priorId = 'mem-prior';
    constraintId = 'mem-constraint';
    outcomeId = 'mem-outcome';

    await seed(memories, OWNER_A, decisionId, 'Decision');
    await seed(memories, OWNER_A, priorId, 'Prior');
    await seed(memories, OWNER_A, constraintId, 'Constraint');
    await seed(memories, OWNER_A, outcomeId, 'Outcome');
    const decisionB = 'mem-decision-b';
    const priorB = 'mem-other-prior';
    await seed(memories, OWNER_B, decisionB, 'Decision B');
    await seed(memories, OWNER_B, priorB, 'Other prior');

    await relations.insert({
      sourceMemoryId: decisionId,
      targetMemoryId: priorId,
      relation: 'caused_by',
      ownerId: OWNER_A,
      metadata: { provenanceVersion: PROVENANCE_VERSION, rule: 'authored' },
    });
    await relations.insert({
      sourceMemoryId: decisionId,
      targetMemoryId: constraintId,
      relation: 'motivated_by',
      ownerId: OWNER_A,
      metadata: { provenanceVersion: PROVENANCE_VERSION, rule: 'authored' },
    });
    await relations.insert({
      sourceMemoryId: decisionId,
      targetMemoryId: outcomeId,
      relation: 'resulted_in',
      ownerId: OWNER_A,
      metadata: { provenanceVersion: PROVENANCE_VERSION, rule: 'authored' },
    });
    await relations.insert({
      sourceMemoryId: decisionB,
      targetMemoryId: priorB,
      relation: 'caused_by',
      ownerId: OWNER_B,
      metadata: { provenanceVersion: PROVENANCE_VERSION, rule: 'authored' },
    });
  });

  afterAll(() => {
    db?.close();
  });

  it('whyChain returns deterministic ordered motivated_by/caused_by steps', async () => {
    const first = await query.whyChain(OWNER_A, decisionId);
    const second = await query.whyChain(OWNER_A, decisionId);
    expect(first).toEqual(second);
    expect(first.map((s) => s.memoryId).sort()).toEqual([constraintId, priorId].sort());
    expect(first.every((s) => s.relation === 'caused_by' || s.relation === 'motivated_by')).toBe(
      true,
    );
  });

  it('effectChain follows resulted_in only (among seeded edges)', async () => {
    const chain = await query.effectChain(OWNER_A, decisionId);
    expect(chain.map((s) => s.memoryId)).toEqual([outcomeId]);
    expect(chain[0]?.relation).toBe('resulted_in');
  });

  it('never leaks another owner edges', async () => {
    const chain = await query.whyChain(OWNER_A, decisionId);
    expect(chain.some((s) => s.memoryId === 'mem-other-prior')).toBe(false);
    const other = await query.whyChain(OWNER_B, 'mem-decision-b');
    expect(other.map((s) => s.memoryId)).toEqual(['mem-other-prior']);
  });
});
