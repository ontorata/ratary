/**
 * Canonical re-export of the memory persistence port.
 * Implementations live in infrastructure adapters (e.g. D1 MemoryRepository).
 * @see .ai/adr/008-platform-architecture.md
 */
export type {
  IMemoryRepository,
  IMemoryReader,
  IMemoryWriter,
  RetrievalFilters,
} from '../../repositories/memory.repository.interface.js';
