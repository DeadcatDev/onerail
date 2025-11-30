import { Request, Response, RequestHandler } from 'express';
import type { PaginationParams } from '../repository/repository.types';
import { ValidationError, NotFoundError } from '../services/errors';
import logger from '../logger';
import { computeETag } from '../utils/etag';
import { cacheSet } from '../utils/cache';

export function parsePagination(req: Request): PaginationParams {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    return { page, limit };
}

// Caching helpers
export const DEFAULT_CACHE_TTL_SECONDS: number =
    Number(process.env.CACHE_TTL_SECONDS || '') || 600;

export function setPublicCache(
    res: Response,
    seconds: number = DEFAULT_CACHE_TTL_SECONDS,
) {
    res.set(
        'Cache-Control',
        `public, max-age=${Math.max(0, Math.floor(seconds))}`,
    );
}

// Helpers to handle cached responses consistently
export function sendCachedPublic(
    res: Response,
    body: any,
    seconds: number = DEFAULT_CACHE_TTL_SECONDS,
) {
    setPublicCache(res, seconds);
    return res.send(body);
}

export function sendCachedWithETag(req: Request, res: Response, body: any) {
    const etag = computeETag(body);
    const noneMatch = req.headers['if-none-match'];
    if (noneMatch && noneMatch === etag) {
        res.set('ETag', etag);
        return res.status(304).end();
    }
    res.set('ETag', etag);
    return res.send(body);
}

// For cache misses: cache the body under the given key and handle ETag/304 logic
export function sendAndCacheWithETag(
    req: Request,
    res: Response,
    cacheKey: string,
    body: any,
) {
    const etag = computeETag(body);
    cacheSet(cacheKey, body);
    const noneMatch = req.headers['if-none-match'];
    if (noneMatch && noneMatch === etag) {
        res.set('ETag', etag);
        return res.status(304).end();
    }
    res.set('ETag', etag);
    return res.send(body);
}

export function handleError(err: any, res: Response): void {
    const requestId = (res as any)?.locals?.requestId as string | undefined;
    const timestamp = new Date().toISOString();

    if (err instanceof ValidationError) {
        res.status(400).json({
            error: { code: 'VALIDATION_ERROR', message: err.message },
            requestId,
            timestamp,
        });
        return;
    }
    if (err instanceof NotFoundError) {
        res.status(404).json({
            error: { code: 'NOT_FOUND', message: err.message },
            requestId,
            timestamp,
        });
        return;
    }

    logger.error('Unhandled error processing request', { requestId, err });
    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal Server Error',
        },
        requestId,
        timestamp,
    });
}
