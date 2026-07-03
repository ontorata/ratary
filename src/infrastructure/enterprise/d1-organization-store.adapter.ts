import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  CreateOrganizationInput,
  IOrganizationStore,
  Organization,
} from '../../ports/enterprise/iorganization-store.port.js';
import { generateId } from '../../utils/memory-mapper.js';
import { nowISO } from '../../utils/memory-mapper.js';
import { ValidationError } from '../../types/errors.js';

interface OrganizationRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
}

function rowToOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  };
}

export class D1OrganizationStore implements IOrganizationStore {
  constructor(private readonly db: ISqlDatabase) {}

  async findById(id: string, ownerId: string): Promise<Organization | null> {
    const rows = await this.db.query<OrganizationRow>(
      'SELECT id, owner_id, name, slug, created_at FROM organizations WHERE id = ? AND owner_id = ?',
      [id, ownerId],
    );
    return rows[0] ? rowToOrganization(rows[0]) : null;
  }

  async findByOwnerAndSlug(ownerId: string, slug: string): Promise<Organization | null> {
    const rows = await this.db.query<OrganizationRow>(
      'SELECT id, owner_id, name, slug, created_at FROM organizations WHERE owner_id = ? AND slug = ?',
      [ownerId, slug],
    );
    return rows[0] ? rowToOrganization(rows[0]) : null;
  }

  async listByOwner(ownerId: string): Promise<Organization[]> {
    const rows = await this.db.query<OrganizationRow>(
      'SELECT id, owner_id, name, slug, created_at FROM organizations WHERE owner_id = ? ORDER BY created_at ASC',
      [ownerId],
    );
    return rows.map(rowToOrganization);
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const existing = await this.findByOwnerAndSlug(input.ownerId, input.slug);
    if (existing) {
      throw new ValidationError(`Organization slug already exists: ${input.slug}`);
    }

    const id = generateId();
    const createdAt = nowISO();
    await this.db.execute(
      `INSERT INTO organizations (id, owner_id, name, slug, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, input.ownerId, input.name, input.slug, createdAt],
    );

    return {
      id,
      ownerId: input.ownerId,
      name: input.name,
      slug: input.slug,
      createdAt,
    };
  }
}
