import { describe, it, expect } from 'vitest';
import { SUMMARY_MAX_LENGTH } from '../../src/knowledge/summary.generator.js';
import { transcriptToMemories } from '../../scripts/lib/transcript-parser.js';

describe('backup import summary limits', () => {
  it('should cap transcript summary at SUMMARY_MAX_LENGTH', () => {
    const longUser = 'x'.repeat(400);
    const memories = transcriptToMemories('/tmp/chat-test/transcript.jsonl', [
      { user: longUser, assistant: 'ok' },
    ]);

    expect(memories[0]!.summary.length).toBeLessThanOrEqual(SUMMARY_MAX_LENGTH);
  });
});
