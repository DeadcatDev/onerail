import { getModels, UserModel } from './_client';
import { PaginatedResult, PaginationParams, normalizePagination } from './repository.types';
import logger from '../logger';

export interface UserInput {
    firstName: string;
    lastName: string;
    email: string;
    dateCreated?: Date | null;
    organizationId: string;
}

export interface User extends UserInput {
    id: string;
}

export async function getSingle(id: string): Promise<User | undefined> {
    await getModels();
    const row = await UserModel.findByPk(id, { raw: true });
    return (row as any) || undefined;
}

export async function getAll(params: PaginationParams = {}): Promise<PaginatedResult<User>> {
    await getModels();
    const { page, limit, offset } = normalizePagination(params);

    const { rows, count } = await UserModel.findAndCountAll({
        offset,
        limit,
        order: [['lastName', 'ASC'], ['firstName', 'ASC']],
        raw: true,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { data: rows as any, page, limit, total: count, totalPages };
}

export async function create(input: UserInput): Promise<User> {
    const { UserModel } = await getModels();
    const created = await UserModel.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        dateCreated: input.dateCreated ?? new Date(),
        organizationId: input.organizationId,
    });
    const plain = created.get({ plain: true }) as any;
    logger.info('User created', { id: plain.id, email: plain.email });
    return plain as User;
}

export async function update(id: string, changes: Partial<UserInput>): Promise<User | undefined> {
    const { UserModel } = await getModels();
    await UserModel.update({ ...changes }, { where: { id } });
    logger.info('User updated', { id, changes });
    const row = await UserModel.findByPk(id, { raw: true });
    return (row as any) || undefined;
}

export async function del(id: string): Promise<void> {
    const { UserModel } = await getModels();
    await UserModel.destroy({ where: { id } });
    logger.info('User deleted', { id });
}

export async function findByEmail(email: string): Promise<User | undefined> {
    await getModels();
    const row = await UserModel.findOne({ where: { email }, raw: true });
    return (row as any) || undefined;
}
