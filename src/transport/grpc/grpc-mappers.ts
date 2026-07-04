import type { Metadata } from '@grpc/grpc-js';
import type { Memory } from '../../types/memory.js';
import type { GrpcTransportMetadata } from '../shared/transport-context.types.js';

/** Wire representation of a Memory (proto `ai.brain.v1.Memory`, keepCase). */
export interface ProtoMemory {
  id: string;
  codename: string;
  slug: string;
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string[];
  keywords: string[];
  category: string;
  memory_type: string;
  importance: number;
  language: string;
  favorite: boolean;
  archived: boolean;
  owner_id: string;
  project_id: string;
  level: string;
  created_at: string;
  updated_at: string;
}

export function toProtoMemory(memory: Memory): ProtoMemory {
  return {
    id: memory.id,
    codename: memory.codename ?? '',
    slug: memory.slug ?? '',
    title: memory.title,
    project: memory.project,
    content: memory.content,
    summary: memory.summary,
    tags: memory.tags,
    keywords: memory.keywords,
    category: memory.category,
    memory_type: memory.memoryType,
    importance: memory.importance,
    language: memory.language,
    favorite: memory.favorite,
    archived: memory.archived,
    owner_id: memory.ownerId,
    project_id: memory.projectId,
    level: memory.level,
    created_at: memory.createdAt,
    updated_at: memory.updatedAt,
  };
}

function metadataValue(metadata: Metadata, key: string): string | undefined {
  const values = metadata.get(key);
  const first = values[0];
  if (typeof first === 'string') {
    const trimmed = first.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

/** Extracts scope hints from gRPC call metadata (ADR-027 Phase 10.5E). */
export function grpcMetadataToTransport(metadata: Metadata): GrpcTransportMetadata {
  return {
    requestId: metadataValue(metadata, 'request-id'),
    ownerId: metadataValue(metadata, 'owner-id'),
    workspaceId: metadataValue(metadata, 'workspace-id'),
    agentId: metadataValue(metadata, 'agent-id'),
    organizationId: metadataValue(metadata, 'organization-id'),
    projectId: metadataValue(metadata, 'project-id'),
  };
}
