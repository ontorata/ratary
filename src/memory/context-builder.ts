import type { ScoredMemory } from './ranker.js';
import { DEFAULT_CONTEXT_MAX_CHARS } from './context.config.js';

export interface ContextBuildOptions {
  maxChars?: number;
  includeSummaryOnly?: boolean;
  format?: 'markdown' | 'xml';
}

export class ContextBuilder {
  build(memories: ScoredMemory[], options?: ContextBuildOptions): string {
    const maxChars = Math.min(options?.maxChars ?? DEFAULT_CONTEXT_MAX_CHARS, 24_000);
    const format = options?.format ?? 'markdown';
    const summaryOnly = options?.includeSummaryOnly ?? false;

    if (format === 'xml') {
      return this.buildXml(memories, maxChars, summaryOnly);
    }
    return this.buildMarkdown(memories, maxChars, summaryOnly);
  }

  private buildMarkdown(memories: ScoredMemory[], maxChars: number, summaryOnly: boolean): string {
    const parts: string[] = ['## Relevant Memory Context', ''];
    let used = parts.join('\n').length;

    for (const memory of memories) {
      const codename = memory.codename ?? memory.id.slice(0, 8);
      const header = `### [${codename}] ${memory.title} (importance: ${memory.importance})`;
      const summaryLine = memory.summary ? `> ${memory.summary}` : '';
      const body = summaryOnly
        ? ''
        : this.truncateContent(memory.content, maxChars - used - header.length - 50);

      const block = [header, summaryLine, body].filter(Boolean).join('\n');
      if (used + block.length + 2 > maxChars) {
        if (summaryLine) {
          const summaryBlock = `${header}\n${summaryLine}`;
          if (used + summaryBlock.length + 2 <= maxChars) {
            parts.push(summaryBlock, '');
            used += summaryBlock.length + 2;
          }
        }
        break;
      }

      parts.push(block, '');
      used += block.length + 2;
    }

    return parts.join('\n').trim();
  }

  private buildXml(memories: ScoredMemory[], maxChars: number, summaryOnly: boolean): string {
    const parts: string[] = ['<memory_context>'];
    let used = parts[0].length;

    for (const memory of memories) {
      const codename = memory.codename ?? memory.id.slice(0, 8);
      const content = summaryOnly ? '' : this.truncateContent(memory.content, 500);
      const block = `<memory codename="${codename}" importance="${memory.importance}"><title>${escapeXml(memory.title)}</title><summary>${escapeXml(memory.summary)}</summary>${summaryOnly ? '' : `<content>${escapeXml(content)}</content>`}</memory>`;

      if (used + block.length + 16 > maxChars) break;
      parts.push(block);
      used += block.length;
    }

    parts.push('</memory_context>');
    return parts.join('');
  }

  private truncateContent(content: string, max: number): string {
    if (max <= 0) return '';
    if (content.length <= max) return content;
    return `${content.slice(0, Math.max(0, max - 3))}...`;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
