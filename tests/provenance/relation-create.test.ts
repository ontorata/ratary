/**
 * Phase 36 / ADR-069 T4 — createRelation stamps I2 evidence; supersedes requires
 * conflictKind; supersedes never deletes prior edges (I1).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { MemoryRelationService } from '../../src/services/memory-relation.service.js';
import { ValidationError } from '../../src/types/errors.js';
import { PROVENANCE_VERSION } from '../../src/types/provenance.js';

const OWNER = 'owner-rel-create';
const scope = { ownerId: OWNER };

async function seedMemory(repo: MemoryRepository, title: string) {
  const id = randomUUID();
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
    codename: title.replace(/\s+/g, '-').toLowerCase(),
    slug: `rel-${title.replace(/\s+/g, '-').toLowerCase()}`,
    favorite: false,
    ownerId: OWNER,
  });
  return id;
}

describe('MemoryRelationService provenance create (ADR-069 I1/I2)', () => {
  let db: SqliteMemoryDatabase;
  let memories: MemoryRepository;
  let relations: MemoryRelationRepository;
  let service: MemoryRelationService;
  let decisionId: string;
  let priorId: string;
  let oldDecisionId: string;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    memories = new MemoryRepository(db);
    relations = new MemoryRelationRepository(db);
    service = new MemoryRelationService(relations, memories);

    decisionId = await seedMemory(memories, 'Choose Postgres');
    priorId = await seedMemory(memories, 'Latency research');
    oldDecisionId = await seedMemory(memories, 'Choose DynamoDB');
  });

  afterAll(() => {
    db?.close();
  });

  it('stamps provenanceVersion + rule=authored on caused_by', async () => {
    const created = await service.createRelation(scope, decisionId, {
      targetMemoryId: priorId,
      relation: 'caused_by',
    });
    expect(created.metadata.provenanceVersion).toBe(PROVENANCE_VERSION);
    expect(created.metadata.rule).toBe('authored');
  });

  it('rejects supersedes without conflictKind', async () => {
    await expect(
      service.createRelation(scope, decisionId, {
        targetMemoryId: oldDecisionId,
        relation: 'supersedes',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('creates supersedes without deleting prior edges or memories (I1)', async () => {
    const priorEdge = await relations.insert({
      sourceMemoryId: oldDecisionId,
      targetMemoryId: priorId,
      relation: 'motivated_by',
      ownerId: OWNER,
      metadata: { provenanceVersion: PROVENANCE_VERSION, rule: 'authored' },
    });

    const supersedes = await service.createRelation(scope, decisionId, {
      targetMemoryId: oldDecisionId,
      relation: 'supersedes',
      metadata: { conflictKind: 'mutually_exclusive' },
    });

    expect(supersedes.metadata.conflictKind).toBe('mutually_exclusive');
    expect(await relations.findById(priorEdge.id, OWNER)).not.toBeNull();
    expect(await memories.findById(oldDecisionId, OWNER)).not.toBeNull();
    expect(await memories.findById(priorId, OWNER)).not.toBeNull();
  });

  it('leaves non-provenance relations metadata unchanged', async () => {
    const related = await service.createRelation(scope, decisionId, {
      targetMemoryId: priorId,
      relation: 'related',
      metadata: { note: 'assoc' },
    });
    expect(related.metadata).toEqual({ note: 'assoc' });
  });
});
