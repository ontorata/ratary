import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../../src/memory/prompt-builder.js';

describe('PromptBuilder', () => {
  const builder = new PromptBuilder();

  it('should compose system and user prompts', () => {
    const result = builder.build({
      contextBlock: '## Relevant Memory Context',
      userTask: 'Lanjut kerja hydration fix',
      projectId: 'mangroveapps',
    });

    expect(result.system).toContain('ground truth');
    expect(result.system).toContain('mangroveapps');
    expect(result.user).toContain('hydration fix');
    expect(result.user).toContain('Relevant Memory Context');
  });
});
