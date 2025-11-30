import {
    OrganizationInput,
    Organization,
    getAll as repoGetAll,
    getSingle as repoGetSingle,
    create as repoCreate,
    update as repoUpdate,
    del as repoDelete,
} from '../repository/organization.repository';
import type {
    PaginatedResult,
    PaginationParams,
} from '../repository/repository.types';
import { NotFoundError } from './errors';
import {
    OrganizationCreateSchema,
    OrganizationUpdateSchema,
    parseOrThrow,
} from './validation';

export async function getAll(
    params: PaginationParams = {},
): Promise<PaginatedResult<Organization>> {
    return repoGetAll(params);
}

export async function getSingle(id: string): Promise<Organization> {
    const item = await repoGetSingle(id);
    if (!item) throw new NotFoundError(`Organization ${id} not found`);
    return item;
}

export async function create(input: OrganizationInput): Promise<Organization> {
    const parsed = parseOrThrow(
        OrganizationCreateSchema,
        input,
    ) as OrganizationInput;
    return repoCreate(parsed);
}

export async function update(
    id: string,
    changes: Partial<OrganizationInput>,
): Promise<Organization> {
    const parsed = parseOrThrow(OrganizationUpdateSchema, changes ?? {});
    const updated = await repoUpdate(id, parsed);
    if (!updated) throw new NotFoundError(`Organization ${id} not found`);
    return updated;
}

export async function remove(id: string): Promise<void> {
    await repoDelete(id);
}
