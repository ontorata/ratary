import { generateSummary, SUMMARY_MAX_LENGTH } from '../../knowledge/summary.generator.js';
import { ValidationError } from '../../types/errors.js';
import type {
  ICompressionSummarizer,
  SummarizerContext,
} from './compression-summarizer.interface.js';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export interface OpenAICompressionSummarizerOptions {
  apiKey: string;
  modelId?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Async LLM summarizer for batch compression / enrich jobs.
 * Falls back to rule-based summary on API failure (never blocks gate).
 */
export class OpenAICompressionSummarizer implements ICompressionSummarizer {
  readonly algorithmId = 'openai_chat_v1';

  private readonly apiKey: string;
  private readonly modelId: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAICompressionSummarizerOptions) {
    if (!options.apiKey) {
      throw new ValidationError('API key is required for OpenAICompressionSummarizer');
    }
    this.apiKey = options.apiKey;
    this.modelId = options.modelId ?? DEFAULT_MODEL;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async summarize(content: string, ctx: SummarizerContext): Promise<string> {
    try {
      const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          temperature: 0.2,
          max_tokens: 120,
          messages: [
            {
              role: 'system',
              content: `Summarize the user note in one concise sentence (max ${SUMMARY_MAX_LENGTH} characters). Preserve key facts; no markdown.`,
            },
            {
              role: 'user',
              content: `Title: ${ctx.title}${ctx.project ? `\nProject: ${ctx.project}` : ''}\n\n${content.slice(0, 12_000)}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        return generateSummary(content);
      }

      const payload = (await response.json()) as ChatCompletionResponse;
      const text = payload.choices?.[0]?.message?.content?.trim();
      if (!text) {
        return generateSummary(content);
      }

      return generateSummary(text);
    } catch {
      return generateSummary(content);
    }
  }
}
