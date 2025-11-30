import {
    OrderInput,
    Order,
    getAll as repoGetAll,
    getSingle as repoGetSingle,
    create as repoCreate,
    update as repoUpdate,
    del as repoDelete,
} from '../repository/order.repository';
import type {
    PaginatedResult,
    PaginationParams,
} from '../repository/repository.types';
import { NotFoundError } from './errors';
import {
    OrderCreateSchema,
    OrderUpdateSchema,
    parseOrThrow,
} from './validation';

export async function getAll(
    params: PaginationParams = {},
    opts: { userId?: string; organizationId?: string } = {},
): Promise<PaginatedResult<Order>> {
    return repoGetAll(params, opts);
}

export async function getSingle(
    id: string,
    opts: {
        joinUser?: boolean;
        joinOrganization?: boolean;
    },
): Promise<Order> {
    const item = await repoGetSingle(id, opts);
    if (!item) throw new NotFoundError(`Order ${id} not found`);
    return item;
}

export async function create(input: OrderInput): Promise<Order> {
    const parsed = parseOrThrow(OrderCreateSchema, input);
    return repoCreate(parsed);
}

export async function update(
    id: string,
    changes: Partial<OrderInput>,
): Promise<Order> {
    const parsed = parseOrThrow(OrderUpdateSchema, changes ?? {});
    const updated = await repoUpdate(id, parsed);
    if (!updated) throw new NotFoundError(`Order ${id} not found`);
    return updated;
}

export async function remove(id: string): Promise<void> {
    await repoDelete(id);
}
