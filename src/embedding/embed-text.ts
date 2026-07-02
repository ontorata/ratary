import { createHash } from 'node:crypto';
import { normalizeForHash } from '../memory/semantic-hash.js';

const CONTENT_EXCERPT_LENGTH = 500;

export function excerptContent(content: string, maxLength = CONTENT_EXCERPT_LENGTH): string {
  return content.slice(0, maxLength);
}

export function buildEmbedText(title: string, summary: string, content: string): string {
  return [normalizeForHash(title), normalizeForHash(summary), excerptContent(content)].join('\n');
}

export function computeEmbedContentHash(title: string, summary: string, content: string): string {
  return createHash('sha256')
    .update(buildEmbedText(title, summary, content))
    .digest('hex');
}
