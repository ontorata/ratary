/** Async summarizer for consolidation/compression jobs — never on CRUD hot path (ADR-023). */
export interface SummarizerContext {
  title: string;
  project?: string;
}

export interface ICompressionSummarizer {
  readonly algorithmId: string;
  summarize(content: string, ctx: SummarizerContext): Promise<string>;
}
