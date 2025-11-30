import {
    UserInput,
    User,
    getAll as repoGetAll,
    getSingle as repoGetSingle,
    create as repoCreate,
    update as repoUpdate,
    del as repoDelete,
} from '../repository/user.repository';
import type {
    PaginatedResult,
    PaginationParams,
} from '../repository/repository.types';
import { NotFoundError } from './errors';
import { UserCreateSchema, UserUpdateSchema, parseOrThrow } from './validation';

export async function getAll(
    params: PaginationParams = {},
): Promise<PaginatedResult<User>> {
    return repoGetAll(params);
}

export async function getSingle(id: string): Promise<User> {
    const item = await repoGetSingle(id);
    if (!item) throw new NotFoundError(`User ${id} not found`);
    return item;
}

export async function create(input: UserInput): Promise<User> {
    const parsed = parseOrThrow(UserCreateSchema, input) as UserInput;
    return repoCreate(parsed);
}

export async function update(
    id: string,
    changes: Partial<UserInput>,
): Promise<User> {
    const parsed = parseOrThrow(UserUpdateSchema, changes ?? {});
    const updated = await repoUpdate(id, parsed);
    if (!updated) throw new NotFoundError(`User ${id} not found`);
    return updated;
}

export async function remove(id: string): Promise<void> {
    await repoDelete(id);
}
