jest.mock('../../src/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/repository/organization.repository', () => ({
    __esModule: true,
    getAll: jest.fn(),
    getSingle: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
}));

import { ValidationError, NotFoundError } from '../../src/services/errors';
import * as OrgService from '../../src/services/organization.service';
import * as OrgRepository from '../../src/repository/organization.repository';

describe('services/organization.service', () => {
    const past = new Date(Date.now() - 60_000);
    const org = {
        id: 'g1',
        name: 'Acme',
        industry: 'Tech',
        dateFounded: past,
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll: forwards params to repository', async () => {
        (OrgRepository.getAll as jest.Mock).mockResolvedValue({
            data: [],
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });
        const params = { page: 2, limit: 20 } as any;
        const res = await OrgService.getAll(params);
        expect(OrgRepository.getAll).toHaveBeenCalledWith(params);
        expect(res).toEqual({
            data: [],
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });
    });

    test('getSingle: returns entity when found', async () => {
        (OrgRepository.getSingle as jest.Mock).mockResolvedValue(org);
        const res = await OrgService.getSingle('g1');
        expect(OrgRepository.getSingle).toHaveBeenCalledWith('g1');
        expect(res).toBe(org);
    });

    test('getSingle: throws NotFoundError when missing', async () => {
        (OrgRepository.getSingle as jest.Mock).mockResolvedValue(undefined);
        await expect(OrgService.getSingle('missing')).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test('create: validates input and calls repository on success', async () => {
        (OrgRepository.create as jest.Mock).mockResolvedValue(org);
        const input = { name: 'Acme', industry: 'Tech', dateFounded: past };
        const res = await OrgService.create(input as any);
        expect(OrgRepository.create).toHaveBeenCalledWith(input);
        expect(res).toBe(org);
    });

    test('create: throws ValidationError for invalid input', async () => {
        const future = new Date(Date.now() + 1000);
        const bad = { name: '   ', industry: 'X', dateFounded: future } as any;
        await expect(OrgService.create(bad)).rejects.toBeInstanceOf(
            ValidationError,
        );
        expect(OrgRepository.create).not.toHaveBeenCalled();
    });

    test('update: validates changes and returns updated entity', async () => {
        (OrgRepository.update as jest.Mock).mockResolvedValue(org);
        const res = await OrgService.update('g1', { name: 'New' });
        expect(OrgRepository.update).toHaveBeenCalledWith('g1', {
            name: 'New',
        });
        expect(res).toBe(org);
    });

    test('update: throws ValidationError for invalid changes', async () => {
        await expect(
            OrgService.update('g1', { name: '  ' } as any),
        ).rejects.toBeInstanceOf(ValidationError);
        expect(OrgRepository.update).not.toHaveBeenCalled();
    });

    test('update: throws NotFoundError when repository returns undefined', async () => {
        (OrgRepository.update as jest.Mock).mockResolvedValue(undefined);
        await expect(
            OrgService.update('missing', { name: 'Ok' }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('remove: delegates to repository.del', async () => {
        (OrgRepository.del as jest.Mock).mockResolvedValue(undefined);
        await OrgService.remove('g1');
        expect(OrgRepository.del).toHaveBeenCalledWith('g1');
    });
});
