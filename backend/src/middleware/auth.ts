import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtUserPayload } from '../services/auth.service';
import logger from '../logger';

// Excludes aka allowlist
const EXCLUDED_PATHS = [
    /^\/(?:api\/)?health$/,
    /^\/(?:api\/)?readiness$/,
    /^\/(?:api\/)?swagger(?:\/.*)?$/,
    /^\/(?:api\/)?swagger\.json$/,
    /^\/(?:api\/)?seed$/,
    /^\/api\/auth\/login$/,
];

export function authGuard(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    if (EXCLUDED_PATHS.some((re) => re.test(path))) {
        return next();
    }

    const hdr = req.header('authorization') || req.header('Authorization');
    if (!hdr || !hdr.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
            requestId: (req as any).requestId || null,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
        });
    }

    const token = hdr.substring(7).trim();
    try {
        const user = verifyToken(token) as JwtUserPayload;
        (req as any).user = user;
        return next();
    } catch (err) {
        logger.debug('JWT verification failed', { err });
        return res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
            requestId: (req as any).requestId || null,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
        });
    }
}
