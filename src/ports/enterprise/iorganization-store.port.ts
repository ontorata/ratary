export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateOrganizationInput {
  ownerId: string;
  name: string;
  slug: string;
}

export interface IOrganizationStore {
  findById(id: string, ownerId: string): Promise<Organization | null>;
  findByOwnerAndSlug(ownerId: string, slug: string): Promise<Organization | null>;
  listByOwner(ownerId: string): Promise<Organization[]>;
  create(input: CreateOrganizationInput): Promise<Organization>;
}
