import { createHash } from 'node:crypto';
import {
  KnowledgeChunkSchema,
  KnowledgeDocumentSchema,
  type KnowledgeChunk,
  type KnowledgeDocument,
} from './knowledge-ingestion-contracts.js';

export type RawSourceFile = {
  sourcePath: string;
  filePath: string;
  content: string;
  metadata: {
    sizeBytes: number;
    encoding: 'utf-8';
    modifiedAt?: string;
  };
};

function shortHash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function normalizeWhitespace(input: string): string {
  const normalizedLineEndings = input.replace(/\r\n?/g, '\n');
  const lines = normalizedLineEndings.split('\n').map((line) => line.trimEnd());

  const output: string[] = [];
  let blankRun = 0;
  for (const line of lines) {
    if (line.length === 0) {
      blankRun += 1;
      if (blankRun > 2) continue;
      output.push('');
      continue;
    }
    blankRun = 0;
    output.push(line);
  }

  return output.join('\n').trim();
}

export function normalizeSourceFile(
  source: RawSourceFile,
  organizationId = 'org-ontorata',
  ingestedAt = new Date().toISOString(),
): KnowledgeDocument {
  const normalizedContent = normalizeWhitespace(source.content);
  const contentDigest = shortHash(normalizedContent);
  const sourceRef = source.filePath.replace(/\\/g, '/');
  const documentId = `doc-${shortHash(`${organizationId}:${sourceRef}`)}`;
  const version = `v-${contentDigest.slice(0, 12)}`;

  return KnowledgeDocumentSchema.parse({
    documentId,
    organizationId,
    sourceType: 'org-memory-source',
    sourceRef,
    title: sourceRef.split('/').pop() ?? sourceRef,
    content: normalizedContent,
    contentDigest,
    version,
    ingestedAt,
    metadata: {
      sourcePath: source.sourcePath,
      ...source.metadata,
    },
  });
}

export type ChunkBuildOptions = {
  maxChunkSize: number;
  overlap: number;
};

export const DEFAULT_CHUNK_OPTIONS: ChunkBuildOptions = {
  maxChunkSize: 1200,
  overlap: 120,
};

export function buildChunks(
  document: KnowledgeDocument,
  options: ChunkBuildOptions = DEFAULT_CHUNK_OPTIONS,
): KnowledgeChunk[] {
  if (options.maxChunkSize <= 0) throw new Error('maxChunkSize must be positive');
  if (options.overlap < 0) throw new Error('overlap must be non-negative');
  if (options.overlap >= options.maxChunkSize) throw new Error('overlap must be smaller than maxChunkSize');

  const content = document.content;
  if (content.length === 0) return [];

  const step = options.maxChunkSize - options.overlap;
  const output: KnowledgeChunk[] = [];

  let start = 0;
  let sequence = 0;
  while (start < content.length) {
    const end = Math.min(start + options.maxChunkSize, content.length);
    const text = content.slice(start, end).trim();
    if (text.length > 0) {
      const textDigest = shortHash(text);
      const chunkId = `chunk-${shortHash(`${document.documentId}:${document.version}:${sequence}:${textDigest}`)}`;
      output.push(
        KnowledgeChunkSchema.parse({
          chunkId,
          documentId: document.documentId,
          organizationId: document.organizationId,
          version: document.version,
          sequence,
          text,
          textDigest,
          section: `char-${start}-${end}`,
        }),
      );
      sequence += 1;
    }

    if (end >= content.length) break;
    start += step;
  }

  return output;
}
