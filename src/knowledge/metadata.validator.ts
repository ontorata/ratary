import { z } from 'zod';
import { knowledgeMetadataSchema, memoryTypeSchema, categorySchema } from '../types/knowledge.js';
import { SUMMARY_MAX_LENGTH } from './summary.generator.js';

export const knowledgeCreateFieldsSchema = knowledgeMetadataSchema.extend({
  summary: z.string().max(SUMMARY_MAX_LENGTH).optional(),
});

export type KnowledgeCreateFields = z.infer<typeof knowledgeCreateFieldsSchema>;

export function validateKnowledgeMetadata(input: unknown): KnowledgeCreateFields {
  return knowledgeCreateFieldsSchema.parse(input);
}

export function validateMemoryType(value: string): boolean {
  return memoryTypeSchema.safeParse(value).success;
}

export function validateCategory(value: string): boolean {
  return categorySchema.safeParse(value).success;
}
