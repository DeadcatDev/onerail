jest.mock('../../src/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/repository/order.repository', () => ({
    __esModule: true,
    getAll: jest.fn(),
    getSingle: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
}));

import { ValidationError, NotFoundError } from '../../src/services/errors';
import * as OrderService from '../../src/services/order.service';
import * as OrderRepository from '../../src/repository/order.repository';

describe('services/order.service', () => {
    const past = new Date(Date.now() - 60_000);
    const order = {
        id: 'o1',
        orderDate: past,
        totalAmount: 100,
        userId: 'u1',
        organizationId: 'g1',
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAll: forwards params and opts to repository', async () => {
        (OrderRepository.getAll as jest.Mock).mockResolvedValue({
            data: [],
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });
        const params = { page: 2, limit: 5 } as any;
        const opts = { userId: 'u1', organizationId: 'g1' };
        const res = await OrderService.getAll(params, opts);
        expect(OrderRepository.getAll).toHaveBeenCalledWith(params, opts);
        expect(res).toEqual({
            data: [],
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        });
    });

    test('getSingle: returns entity when found', async () => {
        (OrderRepository.getSingle as jest.Mock).mockResolvedValue(order);
        const res = await OrderService.getSingle('o1', {
            joinUser: true,
            joinOrganization: true,
        });
        expect(OrderRepository.getSingle).toHaveBeenCalledWith('o1', {
            joinUser: true,
            joinOrganization: true,
        });
        expect(res).toBe(order);
    });

    test('getSingle: throws NotFoundError when missing', async () => {
        (OrderRepository.getSingle as jest.Mock).mockResolvedValue(undefined);
        await expect(
            OrderService.getSingle('missing', {
                joinUser: false,
                joinOrganization: false,
            }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('create: validates input and calls repository on success', async () => {
        (OrderRepository.create as jest.Mock).mockResolvedValue(order);
        const input = {
            orderDate: past,
            totalAmount: 12.5,
            userId: 'u1',
            organizationId: 'g1',
        };
        const res = await OrderService.create(input as any);
        expect(OrderRepository.create).toHaveBeenCalledWith(input);
        expect(res).toBe(order);
    });

    test('create: throws ValidationError for invalid input', async () => {
        const future = new Date(Date.now() + 1000);
        const bad = {
            orderDate: future,
            totalAmount: -1,
            userId: '',
            organizationId: '',
        } as any;
        await expect(OrderService.create(bad)).rejects.toBeInstanceOf(
            ValidationError,
        );
        expect(OrderRepository.create).not.toHaveBeenCalled();
    });

    test('update: validates changes and returns updated entity', async () => {
        (OrderRepository.update as jest.Mock).mockResolvedValue(order);
        const res = await OrderService.update('o1', { totalAmount: 200 });
        expect(OrderRepository.update).toHaveBeenCalledWith('o1', {
            totalAmount: 200,
        });
        expect(res).toBe(order);
    });

    test('update: throws ValidationError for invalid changes', async () => {
        await expect(
            OrderService.update('o1', { totalAmount: 0 } as any),
        ).rejects.toBeInstanceOf(ValidationError);
        expect(OrderRepository.update).not.toHaveBeenCalled();
    });

    test('update: throws NotFoundError when repository returns undefined', async () => {
        (OrderRepository.update as jest.Mock).mockResolvedValue(undefined);
        await expect(
            OrderService.update('missing', { totalAmount: 10 }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('remove: delegates to repository.del', async () => {
        (OrderRepository.del as jest.Mock).mockResolvedValue(undefined);
        await OrderService.remove('o1');
        expect(OrderRepository.del).toHaveBeenCalledWith('o1');
    });
});
