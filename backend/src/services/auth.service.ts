import jwt from 'jsonwebtoken';
import * as UserRepository from '../repository/user.repository';
import logger from '../logger';
import { NotFoundError, ValidationError } from './errors';
import { validationMessages } from './validation';

export interface JwtUserPayload extends UserRepository.User {}

export interface AuthResult {
    token: string;
    user: JwtUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'one-rail-jwt-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export async function login(
    email?: string,
    password?: string,
): Promise<AuthResult> {
    if (!email || typeof email !== 'string') {
        throw new ValidationError(validationMessages.emailRequired);
    }
    if (password !== 'onerail') {
        throw new ValidationError(validationMessages.invalidCredentials);
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const payload: JwtUserPayload = user;
    const token = jwt.sign(payload as any, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as any,
    } as any);

    logger.info('User logged in', { userId: user.id, email: user.email });
    return { token, user };
}

export function verifyToken(token: string): JwtUserPayload {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    return decoded;
}
