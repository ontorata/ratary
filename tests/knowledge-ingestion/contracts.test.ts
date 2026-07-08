import { describe, expect, it } from 'vitest';
import {
  IngestionRunSchema,
  KnowledgeDocumentSchema,
  PipelineStageSchema,
} from '../../scripts/lib/knowledge-ingestion-contracts.js';

describe('knowledge ingestion contracts', () => {
  it('accepts valid pipeline stage enums', () => {
    expect(PipelineStageSchema.parse('normalizer')).toBe('normalizer');
    expect(PipelineStageSchema.parse('index_update')).toBe('index_update');
  });

  it('rejects invalid pipeline stage enums', () => {
    const parsed = PipelineStageSchema.safeParse('invalid_stage');
    expect(parsed.success).toBe(false);
  });

  it('parses a valid KnowledgeDocument payload', () => {
    const parsed = KnowledgeDocumentSchema.parse({
      documentId: 'doc-1',
      organizationId: 'org-ontorata',
      sourceType: 'governance',
      sourceRef: '.ai/core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md',
      title: 'Implementation Completion Protocol',
      content: 'Implementation is incomplete until documentation is synchronized.',
      contentDigest: 'abc12345efgh6789',
      version: 'v1',
      ingestedAt: '2026-07-08T06:00:00.000Z',
    });

    expect(parsed.documentId).toBe('doc-1');
  });

  it('validates canonical ingestion run payload', () => {
    const parsed = IngestionRunSchema.parse({
      runId: '9497f0a3-8d50-470c-a3eb-18be9469454e',
      startedAt: '2026-07-08T06:00:00.000Z',
      endedAt: '2026-07-08T06:00:01.000Z',
      totalIngested: 12,
      totalFailed: 0,
      digest: '12345678abcdef90',
      sources: [
        {
          sourcePath: '.ai/core/',
          ingested: 8,
          failed: 0,
          durationMs: 10,
        },
      ],
    });

    expect(parsed.totalIngested).toBe(12);
  });
});
