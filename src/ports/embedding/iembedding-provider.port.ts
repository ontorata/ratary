/**
 * Canonical embedding inference port.
 * Adapters: OpenAI, Gemini, Voyage, Ollama, Nomic, SentenceTransformers, noop.
 * @see docs/adr/008-platform-architecture.md
 */
export type {
  IEmbeddingProvider,
  EmbeddingInput,
  EmbeddingResult,
} from '../../embedding/embedding.provider.interface.js';
