import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  CreateOrganizationInput,
  IOrganizationStore,
  Organization,
} from '../../ports/enterprise/iorganization-store.port.js';
import {
  createOrganization as createOrganizationRecord,
  findOrganizationById,
  findOrganizationBySlug,
  listOrganizationsByOwner,
  type OrganizationRecord,
} from '../../scope/organization-store.js';

function toOrganization(record: OrganizationRecord): Organization {
  return {
    id: record.id,
    ownerId: record.ownerId,
    name: record.name,
    slug: record.slug,
    createdAt: record.createdAt,
  };
}

export class D1OrganizationStore implements IOrganizationStore {
  constructor(private readonly db: ISqlDatabase) {}

  async findById(id: string, ownerId: string): Promise<Organization | null> {
    const record = await findOrganizationById(this.db, ownerId, id);
    return record ? toOrganization(record) : null;
  }

  async findByOwnerAndSlug(ownerId: string, slug: string): Promise<Organization | null> {
    const record = await findOrganizationBySlug(this.db, ownerId, slug);
    return record ? toOrganization(record) : null;
  }

  async listByOwner(ownerId: string): Promise<Organization[]> {
    const records = await listOrganizationsByOwner(this.db, ownerId);
    return records.map(toOrganization);
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const record = await createOrganizationRecord(this.db, input.ownerId, {
      name: input.name,
      slug: input.slug,
    });
    return toOrganization(record);
  }
}
