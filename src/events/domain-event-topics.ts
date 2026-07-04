export const DomainEventTopics = {
  MEMORY_CREATED: 'memory.created',
  MEMORY_UPDATED: 'memory.updated',
  MEMORY_DELETED: 'memory.deleted',
  MEMORY_ACCESSED: 'memory.accessed',
  MEMORY_SIGNAL_RECEIVED: 'memory.signal.received',
} as const;

export type DomainEventTopic = (typeof DomainEventTopics)[keyof typeof DomainEventTopics];
