export const MEMORY_LEVELS = ['raw', 'note', 'summary', 'canonical'] as const;

export type MemoryLevel = (typeof MEMORY_LEVELS)[number];

export const DEFAULT_MEMORY_LEVEL: MemoryLevel = 'note';
