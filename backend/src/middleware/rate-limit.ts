import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || '') || 60_000;
const MAX_REQ = Number(process.env.RATE_LIMIT_MAX || '') || 30;

function getOrgKey(req: Request): string {
    const user: any = (req as any).user || {};
    const orgId: string = user.organizationId || 'unknown-org';
    return String(orgId);
}

export const rateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_REQ,
    standardHeaders: true,
    legacyHeaders: false,
    // Only for authenticated requests
    skip: (req: Request) => !(req as any).user,
    keyGenerator: (req: Request) => getOrgKey(req),
    handler: (req: Request, res: Response) => {
        const requestId = (res as any)?.locals?.requestId || null;
        const user: any = (req as any).user || {};
        const orgId = user.organizationId || user.orgId || 'unknown-org';
        return res.status(429).json({
            error: {
                code: 'RATE_LIMITED',
                message: `Too many requests for organization ${orgId}. Allowed ${MAX_REQ} per ${Math.round(
                    WINDOW_MS / 1000,
                )}s`,
            },
            requestId,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
        });
    },
});

export default rateLimiter;
