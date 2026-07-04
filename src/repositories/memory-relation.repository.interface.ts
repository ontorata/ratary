import type {
  CreateRelationInput,
  MemoryRelation,
  RelationType,
  SourceType,
} from '../types/knowledge.js';

/**
 * Port interface for memory relations persistence.
 * Allows swappable storage adapters for future graph engines.
 */
export interface IMemoryRelationRepository {
  /**
   * Insert a new memory relation.
   */
  insert(data: {
    sourceMemoryId: string;
    targetMemoryId: string;
    relation: RelationType;
    ownerId: string;
    weight?: number;
    confidence?: number;
    createdBy?: string | null;
    sourceType?: SourceType;
    metadata?: Record<string, unknown>;
  }): Promise<MemoryRelation>;

  /**
   * Find a relation by ID with owner scope.
   */
  findById(id: string, ownerId: string): Promise<MemoryRelation | null>;

  /**
   * Find all relations for a memory (as source or target) with owner scope.
   */
  findByMemoryId(
    memoryId: string,
    ownerId: string,
    workspaceId?: string,
  ): Promise<MemoryRelation[]>;

  /**
   * Check if a relation exists with owner scope.
   */
  exists(
    sourceMemoryId: string,
    targetMemoryId: string,
    relation: RelationType,
    ownerId: string,
  ): Promise<boolean>;

  /**
   * Delete a relation by ID with owner scope.
   */
  delete(id: string, ownerId: string): Promise<boolean>;

  /**
   * Create a relation from CreateRelationInput with owner scope.
   */
  createFromInput(
    sourceMemoryId: string,
    ownerId: string,
    input: CreateRelationInput,
    createdBy?: string | null,
  ): Promise<MemoryRelation>;

  /**
   * Upsert an inferred relation — never overwrites manual edges.
   */
  upsertInferred(data: {
    sourceMemoryId: string;
    targetMemoryId: string;
    relation: RelationType;
    ownerId: string;
    weight: number;
    confidence: number;
    metadata?: Record<string, unknown>;
  }): Promise<'created' | 'updated' | 'skipped_manual'>;
}
