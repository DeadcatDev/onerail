import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import { ValidationError, NotFoundError } from '../services/errors';

interface JsonErrorBody {
    error: {
        code: string;
        message: string;
    };
    requestId?: string;
    timestamp: string;
    path: string;
    method: string;
}

// Helper to build a standardized error body
function buildErrorBody(req: Request, res: Response, code: string, message: string): JsonErrorBody {
    const requestId = (res as any)?.locals?.requestId as string | undefined;
    return {
        error: { code, message },
        requestId,
        timestamp: new Date().toISOString(),
        path: (req.originalUrl || req.url) as string,
        method: req.method,
    };
}

// 404
export function notFoundHandler(req: Request, res: Response) {
    const body = buildErrorBody(req, res, 'NOT_FOUND', 'Resource not found');
    res.status(404).json(body);
}


export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
    // Known service errors
    if (err instanceof ValidationError) {
        const body = buildErrorBody(req, res, 'VALIDATION_ERROR', err.message);
        return res.status(400).json(body);
    }
    if (err instanceof NotFoundError) {
        const body = buildErrorBody(req, res, 'NOT_FOUND', err.message);
        return res.status(404).json(body);
    }

    // Fallback for unhandled error
    const requestId = (res as any)?.locals?.requestId;
    logger.error('Unhandled exception', {
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        err,
    });

    const body = buildErrorBody(req, res, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
    return res.status(500).json(body);
}
