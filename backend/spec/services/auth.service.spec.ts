jest.mock('../../src/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../src/repository/user.repository', () => ({
    __esModule: true,
    findByEmail: jest.fn(),
}));

jest.mock('jsonwebtoken', () => {
    const sign = jest.fn(() => 'signed.jwt.token');
    const verify = jest.fn((t: string) => ({ id: 'u1', email: 'a@b.com', t }));
    return {
        __esModule: true,
        default: { sign, verify },
        sign,
        verify,
    };
});

import { ValidationError, NotFoundError } from '../../src/services/errors';
import * as AuthService from '../../src/services/auth.service';
import * as UserRepository from '../../src/repository/user.repository';
import * as jwt from 'jsonwebtoken';

describe('services/auth.service', () => {
    const user = {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        organizationId: 'o1',
        dateCreated: new Date(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('login: success returns token and user; logs', async () => {
        (UserRepository.findByEmail as jest.Mock).mockResolvedValue(user);
        const res = await AuthService.login('a@b.com', 'onerail');
        expect(res.user).toEqual(user);
        expect(res.token).toBe('signed.jwt.token');
        expect(jwt.sign).toHaveBeenCalled();
    });

    test('login: invalid password throws ValidationError', async () => {
        await expect(
            AuthService.login('a@b.com', 'bad'),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test('login: missing email throws ValidationError', async () => {
        await expect(
            AuthService.login(undefined, 'onerail'),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test('login: user not found throws NotFoundError', async () => {
        (UserRepository.findByEmail as jest.Mock).mockResolvedValue(undefined);
        await expect(
            AuthService.login('none@b.com', 'onerail'),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('verifyToken: returns decoded payload', () => {
        const payload = AuthService.verifyToken('abc');
        expect(payload).toEqual(
            expect.objectContaining({ id: 'u1', email: 'a@b.com' }),
        );
        expect(jwt.verify).toHaveBeenCalledWith('abc', expect.any(String));
    });
});
