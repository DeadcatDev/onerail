jest.mock('../../src/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/repository/user.repository', () => ({
    __esModule: true,
    getAll: jest.fn(),
    getSingle: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
}));

import { ValidationError, NotFoundError } from '../../src/services/errors';
import * as UserService from '../../src/services/user.service';
import * as UserRepository from '../../src/repository/user.repository';

describe('services/user.service', () => {
    const past = new Date(Date.now() - 60_000);
    const user = {
        id: 'u1',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        organizationId: 'g1',
        dateCreated: past,
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll: forwards params to repository', async () => {
        (UserRepository.getAll as jest.Mock).mockResolvedValue({
            data: [],
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });
        const params = { page: 3, limit: 15 } as any;
        const res = await UserService.getAll(params);
        expect(UserRepository.getAll).toHaveBeenCalledWith(params);
        expect(res).toEqual({
            data: [],
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });
    });

    test('getSingle: returns entity when found', async () => {
        (UserRepository.getSingle as jest.Mock).mockResolvedValue(user);
        const res = await UserService.getSingle('u1');
        expect(UserRepository.getSingle).toHaveBeenCalledWith('u1');
        expect(res).toBe(user);
    });

    test('getSingle: throws NotFoundError when missing', async () => {
        (UserRepository.getSingle as jest.Mock).mockResolvedValue(undefined);
        await expect(UserService.getSingle('missing')).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test('create: validates input and calls repository on success', async () => {
        (UserRepository.create as jest.Mock).mockResolvedValue(user);
        const input = {
            firstName: 'A',
            lastName: 'B',
            email: 'a@b.com',
            organizationId: 'g1',
            dateCreated: past,
        };
        const res = await UserService.create(input as any);
        expect(UserRepository.create).toHaveBeenCalledWith(input);
        expect(res).toBe(user);
    });

    test('create: throws ValidationError for invalid input', async () => {
        const bad = {
            firstName: ' ',
            lastName: '',
            email: '',
            organizationId: '',
        } as any;
        await expect(UserService.create(bad)).rejects.toBeInstanceOf(
            ValidationError,
        );
        expect(UserRepository.create).not.toHaveBeenCalled();
    });

    test('update: validates changes and returns updated entity', async () => {
        (UserRepository.update as jest.Mock).mockResolvedValue(user);
        const res = await UserService.update('u1', { firstName: 'X' });
        expect(UserRepository.update).toHaveBeenCalledWith('u1', {
            firstName: 'X',
        });
        expect(res).toBe(user);
    });

    test('update: throws ValidationError for invalid changes', async () => {
        await expect(
            UserService.update('u1', { firstName: '   ' } as any),
        ).rejects.toBeInstanceOf(ValidationError);
        expect(UserRepository.update).not.toHaveBeenCalled();
    });

    test('update: throws NotFoundError when repository returns undefined', async () => {
        (UserRepository.update as jest.Mock).mockResolvedValue(undefined);
        await expect(
            UserService.update('missing', { firstName: 'Ok' }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('remove: delegates to repository.del', async () => {
        (UserRepository.del as jest.Mock).mockResolvedValue(undefined);
        await UserService.remove('u1');
        expect(UserRepository.del).toHaveBeenCalledWith('u1');
    });
});
