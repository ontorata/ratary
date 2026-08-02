import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { orgMemoryReviewsPath } from './org-memory-paths.js';

export const PRODUCTION_REGISTRY_SCHEMA_VERSION = '1.0';

const OrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['internal', 'external']),
  trusted: z.boolean(),
  activeSince: z.string().min(1),
  evidencePath: z.string().min(1),
});

const WorkloadSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['internal', 'external']),
  trusted: z.boolean(),
  northStarEligible: z.boolean(),
  activeSince: z.string().min(1),
  evidencePath: z.string().min(1),
});

export const ProductionWorkloadRegistrySchema = z.object({
  schemaVersion: z.string().min(1),
  updated: z.string().min(1),
  description: z.string().optional(),
  organizations: z.array(OrganizationSchema),
  workloads: z.array(WorkloadSchema),
});

export type ProductionWorkloadRegistry = z.infer<typeof ProductionWorkloadRegistrySchema>;
export type ProductionOrganization = z.infer<typeof OrganizationSchema>;
export type ProductionWorkload = z.infer<typeof WorkloadSchema>;

export function productionRegistryPath(): string {
  return orgMemoryReviewsPath('production-workload-registry.json');
}

export async function loadProductionWorkloadRegistry(): Promise<ProductionWorkloadRegistry> {
  const raw = await readFile(productionRegistryPath(), 'utf-8');
  return ProductionWorkloadRegistrySchema.parse(JSON.parse(raw));
}

export function summarizeRegistry(registry: ProductionWorkloadRegistry): {
  productionOrganizations: number;
  productionWorkloads: number;
  internalOrganizations: number;
  externalOrganizations: number;
  internalWorkloads: number;
  externalWorkloads: number;
  trustedOrganizations: number;
  trustedWorkloads: number;
  northStarWorkloads: number;
} {
  const orgs = registry.organizations;
  const workloads = registry.workloads;

  return {
    productionOrganizations: orgs.filter((org) => org.trusted).length,
    productionWorkloads: workloads.filter((workload) => workload.trusted && workload.northStarEligible)
      .length,
    internalOrganizations: orgs.filter((org) => org.type === 'internal').length,
    externalOrganizations: orgs.filter((org) => org.type === 'external' && org.trusted).length,
    internalWorkloads: workloads.filter((workload) => workload.type === 'internal').length,
    externalWorkloads: workloads.filter(
      (workload) => workload.type === 'external' && workload.trusted && workload.northStarEligible,
    ).length,
    trustedOrganizations: orgs.filter((org) => org.trusted).length,
    trustedWorkloads: workloads.filter((workload) => workload.trusted).length,
    northStarWorkloads: workloads.filter((workload) => workload.trusted && workload.northStarEligible)
      .length,
  };
}
