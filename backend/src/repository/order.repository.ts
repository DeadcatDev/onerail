import { getModels, OrderModel } from './_client';
import {
    PaginatedResult,
    PaginationParams,
    normalizePagination,
} from './repository.types';
import logger from '../logger';
import type { User } from './user.repository';
import type { Organization } from './organization.repository';

export interface OrderInput {
    orderDate: Date;
    totalAmount: number;
    userId: string;
    organizationId: string;
}

export interface Order extends OrderInput {
    id: string;
}

export type OrderWithJoins = Order & {
    user?: User;
    organization?: Organization;
};

export async function getSingle(
    id: string,
    opts: { joinUser?: boolean; joinOrganization?: boolean } = {},
): Promise<OrderWithJoins | undefined> {
    const { OrderModel, UserModel, OrganizationModel } = await getModels();

    const include: any[] = [];
    if (opts.joinUser) include.push({ model: UserModel, required: false });
    if (opts.joinOrganization)
        include.push({ model: OrganizationModel, required: false });

    if (include.length === 0) {
        const row = await OrderModel.findByPk(id, { raw: true });
        return (row as any) || undefined;
    }

    const row = await OrderModel.findByPk(id, {
        include,
        raw: false,
    });
    if (!row) return undefined;
    const plain: any = row.get({ plain: true });
    const user = (plain as any).UserModel as User | undefined;
    const organization = (plain as any).OrganizationModel as
        | Organization
        | undefined;
    delete plain.UserModel;
    delete plain.OrganizationModel;
    const result: OrderWithJoins = {
        ...(plain as any),
        ...(user ? { user } : {}),
        ...(organization ? { organization } : {}),
    };
    return result;
}

export async function getAll(
    params: PaginationParams = {},
    opts: { userId?: string; organizationId?: string } = {},
): Promise<PaginatedResult<Order>> {
    await getModels();
    const { page, limit, offset } = normalizePagination(params);

    const where: any = {};
    if (opts.userId) {
        where.userId = opts.userId;
    }
    if (opts.organizationId) {
        where.organizationId = opts.organizationId;
    }

    const { rows, count } = await OrderModel.findAndCountAll({
        offset,
        limit,
        where,
        order: [['orderDate', 'DESC']],
        raw: true,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { data: rows as any, page, limit, total: count, totalPages };
}

export async function create(input: OrderInput): Promise<Order> {
    const { OrderModel } = await getModels();
    const created = await OrderModel.create({
        orderDate: input.orderDate,
        totalAmount: input.totalAmount,
        userId: input.userId,
        organizationId: input.organizationId,
    });
    const plain = created.get({ plain: true }) as any;
    logger.info('Order created', {
        id: plain.id,
        userId: plain.userId,
        organizationId: plain.organizationId,
        totalAmount: plain.totalAmount,
    });
    return plain as Order;
}

export async function update(
    id: string,
    changes: Partial<OrderInput>,
): Promise<Order | undefined> {
    const { OrderModel } = await getModels();
    await OrderModel.update({ ...changes }, { where: { id } });
    logger.info('Order updated', { id, changes });
    const row = await OrderModel.findByPk(id, { raw: true });
    return (row as any) || undefined;
}

export async function del(id: string): Promise<void> {
    const { OrderModel } = await getModels();
    await OrderModel.destroy({ where: { id } });
    logger.info('Order deleted', { id });
}
