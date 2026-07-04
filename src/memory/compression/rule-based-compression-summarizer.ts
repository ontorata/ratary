import { generateSummary } from '../../knowledge/summary.generator.js';
import type {
  ICompressionSummarizer,
  SummarizerContext,
} from './compression-summarizer.interface.js';

/** Deterministic strip-and-truncate summarizer (Phase 2.6 default). */
export class RuleBasedCompressionSummarizer implements ICompressionSummarizer {
  readonly algorithmId = 'rule_v1';

  async summarize(content: string, _ctx: SummarizerContext): Promise<string> {
    return generateSummary(content);
  }
}
