import { describe, it, expect } from 'vitest';
import { Metadata, status as GrpcStatus } from '@grpc/grpc-js';
import { loadAiBrainProto } from '../../src/transport/grpc/load-proto.js';
import { toProtoMemory, grpcMetadataToTransport } from '../../src/transport/grpc/grpc-mappers.js';
import { toGrpcError } from '../../src/transport/grpc/grpc-error.js';
import { NotFoundError, ValidationError } from '../../src/types/errors.js';
import type { Memory } from '../../src/types/memory.js';

const sampleMemory: Memory = {
  id: '11111111-1111-1111-1111-111111111111',
  codename: 'AUTH-0001',
  slug: 'auth-0001',
  title: 'Sample',
  project: 'ai-brain',
  content: 'body',
  summary: 'sum',
  keywords: ['k1'],
  category: 'Development',
  memoryType: 'note',
  importance: 50,
  language: 'en',
  notes: '',
  tags: ['t1'],
  favorite: true,
  archived: false,
  ownerId: 'owner-1',
  projectId: 'proj-1',
  level: 'note',
  lastAccessed: null,
  accessCount: 0,
  embeddingId: null,
  objectKey: null,
  semanticHash: null,
  createdAt: '2026-07-04T00:00:00.000Z',
  updatedAt: '2026-07-04T00:00:00.000Z',
};

describe('gRPC transport (Phase 10.5E)', () => {
  it('loads ai.brain.v1 proto with the four v1 services', () => {
    const proto = loadAiBrainProto();

    expect(Object.keys(proto.MemoryService.service)).toEqual(
      expect.arrayContaining([
        'CreateMemory',
        'GetMemory',
        'UpdateMemory',
        'DeleteMemory',
        'ListMemories',
      ]),
    );
    expect(Object.keys(proto.SearchService.service)).toContain('Search');
    expect(Object.keys(proto.ContextService.service)).toContain('BuildContext');
    expect(Object.keys(proto.HealthService.service)).toContain('Check');
  });

  it('BuildContext is a server-streaming RPC', () => {
    const proto = loadAiBrainProto();
    const buildContext = proto.ContextService.service.BuildContext;
    expect(buildContext.responseStream).toBe(true);
    expect(buildContext.requestStream).toBe(false);
  });

  it('maps a Memory to snake_case proto fields', () => {
    const proto = toProtoMemory(sampleMemory);
    expect(proto.memory_type).toBe('note');
    expect(proto.owner_id).toBe('owner-1');
    expect(proto.project_id).toBe('proj-1');
    expect(proto.codename).toBe('AUTH-0001');
    expect(proto.tags).toEqual(['t1']);
  });

  it('maps null codename/slug to empty strings', () => {
    const proto = toProtoMemory({ ...sampleMemory, codename: null, slug: null });
    expect(proto.codename).toBe('');
    expect(proto.slug).toBe('');
  });

  it('extracts scope hints from gRPC metadata', () => {
    const metadata = new Metadata();
    metadata.set('owner-id', 'owner-42');
    metadata.set('workspace-id', 'ws-9');
    metadata.set('agent-id', 'agent-3');

    const hints = grpcMetadataToTransport(metadata);
    expect(hints.ownerId).toBe('owner-42');
    expect(hints.workspaceId).toBe('ws-9');
    expect(hints.agentId).toBe('agent-3');
    expect(hints.organizationId).toBeUndefined();
  });

  it('maps domain errors to gRPC status codes', () => {
    expect(toGrpcError(new NotFoundError('Memory', 'x')).code).toBe(GrpcStatus.NOT_FOUND);
    expect(toGrpcError(new ValidationError('bad')).code).toBe(GrpcStatus.INVALID_ARGUMENT);
    expect(toGrpcError(new Error('boom')).code).toBe(GrpcStatus.INTERNAL);
  });
});
