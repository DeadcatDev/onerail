import { Request, Response, NextFunction } from 'express';
import { logger, sanitizeHeaders } from '../logger';
import { v4 as uuid } from 'uuid';

export function requestLogging(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuid();
    (res as any).locals = (res as any).locals || {};
    (res as any).locals.requestId = requestId;

    logger.debug('HTTP %s %s headers', req.method, req.originalUrl || req.url, {
        requestId,
        headers: sanitizeHeaders(req.headers as any),
        query: req.query,
    });

    next();
}

export default requestLogging;
