import { getModels, OrganizationModel } from './_client';
import { PaginatedResult, PaginationParams, normalizePagination } from './repository.types';
import logger from '../logger';

export interface OrganizationInput {
    name: string;
    industry?: string | null;
    dateFounded?: Date | null;
}

export interface Organization extends OrganizationInput {
    id: string;
}

export async function getSingle(id: string): Promise<Organization | undefined> {
    await getModels();
    const row = await OrganizationModel.findByPk(id, { raw: true });
    return (row as any) || undefined;
}

export async function getAll(params: PaginationParams = {}): Promise<PaginatedResult<Organization>> {
    await getModels();
    const { page, limit, offset } = normalizePagination(params);

    const { rows, count } = await OrganizationModel.findAndCountAll({
        offset,
        limit,
        order: [['name', 'ASC']],
        raw: true,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { data: rows as any, page, limit, total: count, totalPages };
}

export async function create(input: OrganizationInput): Promise<Organization> {
    const { OrganizationModel } = await getModels();
    const created = await OrganizationModel.create({ name: input.name, industry: input.industry ?? null, dateFounded: input.dateFounded ?? null });
    const plain = created.get({ plain: true }) as any;
    logger.info('Organization created', { id: plain.id, name: plain.name });
    return plain as Organization;
}

export async function update(id: string, changes: Partial<OrganizationInput>): Promise<Organization | undefined> {
    const { OrganizationModel } = await getModels();
    await OrganizationModel.update(
        { ...changes },
        { where: { id } },
    );
    logger.info('Organization updated', { id, changes });
    const row = await OrganizationModel.findByPk(id, { raw: true });
    return (row as any) || undefined;
}

export async function del(id: string): Promise<void> {
    const { OrganizationModel } = await getModels();
    await OrganizationModel.destroy({ where: { id } });
    logger.info('Organization deleted', { id });
}
