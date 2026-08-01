import { describe, expect, it, afterEach, vi } from 'vitest';

vi.mock('../composition/create-recall-service.js', () => ({
  createRecallService: vi.fn(() => ({})),
}));

import { createDecisionsController } from './decisions.controller.js';
import { InMemoryDecisionProvenanceStore } from '../decision-intelligence/in-memory-decision-provenance-store.js';

function mockReply() {
  const reply = {
    statusCode: 200,
    payload: undefined as unknown,
    status(code: number) {
      reply.statusCode = code;
      return reply;
    },
    send(body?: unknown) {
      reply.payload = body;
      return reply;
    },
  };
  return reply;
}

describe('DecisionsController PI-P6-D0', () => {
  const prevAllowlist = process.env.DECISION_MODEL_ALLOWLIST;

  afterEach(() => {
    if (prevAllowlist === undefined) delete process.env.DECISION_MODEL_ALLOWLIST;
    else process.env.DECISION_MODEL_ALLOWLIST = prevAllowlist;
  });

  it('listDecisionModels returns empty when allowlist unset', async () => {
    delete process.env.DECISION_MODEL_ALLOWLIST;
    const controller = createDecisionsController({
      repository: {} as never,
      env: { DECISION_PROVENANCE_ENABLED: false } as never,
    });
    const reply = mockReply();
    await controller.listDecisionModels({ user: { ownerId: 'o1' } } as never, reply as never);
    expect((reply.payload as { models: unknown[] }).models).toEqual([]);
  });

  it('listDecisionModels returns seed when allowlisted', async () => {
    process.env.DECISION_MODEL_ALLOWLIST = 'ontorata-internal-v1';
    const controller = createDecisionsController({
      repository: {} as never,
      env: { DECISION_PROVENANCE_ENABLED: false } as never,
    });
    const reply = mockReply();
    await controller.listDecisionModels({ user: { ownerId: 'o1' } } as never, reply as never);
    const body = reply.payload as { models: Array<{ id: string }> };
    expect(body.models).toHaveLength(1);
    expect(body.models[0]?.id).toBe('ontorata-internal-v1');
  });

  it('recordDecisionProvenance stores decisionModel and sandbox audit fields', async () => {
    const store = new InMemoryDecisionProvenanceStore();
    const controller = createDecisionsController({
      repository: {} as never,
      env: { DECISION_PROVENANCE_ENABLED: true } as never,
      provenanceStore: store,
    });
    const reply = mockReply();
    await controller.recordDecisionProvenance(
      {
        user: { ownerId: 'o1' },
        body: {
          briefId: 'b1',
          verdict: 'accepted',
          decisionModelId: 'ontorata-computed-scorer-v1',
          decisionModelVersion: '1.0.0',
          decisionModelPluginDigest: 'sha256:995fec358de55',
          sandboxOutcome: 'ok',
        },
      } as never,
      reply as never,
    );
    expect(reply.statusCode).toBe(201);
    const body = reply.payload as {
      record: { decisionModelId?: string; sandboxOutcome?: string };
    };
    expect(body.record.decisionModelId).toBe('ontorata-computed-scorer-v1');
    expect(body.record.sandboxOutcome).toBe('ok');
  });
});
