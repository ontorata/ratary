import { createHash } from 'node:crypto';
import { KnowledgeDocumentSchema, type KnowledgeDocument } from './knowledge-ingestion-contracts.js';

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
