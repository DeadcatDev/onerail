import type { Request, Response, NextFunction } from 'express';

// Mock express-rate-limit to capture options
const rateLimitMock: any = jest.fn((opts) => {
    rateLimitMock.opts = opts;
    // return passthrough middleware by default
    return (req: Request, _res: Response, next: NextFunction) => next();
});

jest.mock('express-rate-limit', () => ({
    __esModule: true,
    default: rateLimitMock,
}));

jest.useFakeTimers();
jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));

describe('perOrganizationRateLimiter', () => {
    beforeEach(() => {
        // Clear previous captured opts
        rateLimitMock.opts = undefined;
        jest.resetModules();
    });

    test('configures skip to true when no user on request', async () => {
        await import('../../src/middleware/rate-limit');
        const opts = rateLimitMock.opts;
        expect(typeof opts.skip).toBe('function');
        const req = { } as any as Request;
        expect(opts.skip(req)).toBe(true);
        const req2 = { user: { organizationId: 'org1' } } as any as Request;
        expect(opts.skip(req2)).toBe(false);
    });

    test('keyGenerator uses organizationId when present; unknown when missing user', async () => {
        await import('../../src/middleware/rate-limit');
        const opts = rateLimitMock.opts;
        expect(typeof opts.keyGenerator).toBe('function');
        const req1 = { user: { organizationId: 'A' } } as any as Request;
        expect(opts.keyGenerator(req1)).toBe('A');
        const req3 = { } as any as Request;
        expect(opts.keyGenerator(req3)).toBe('unknown-org');
    });

    test('handler returns structured 429 response with metadata', async () => {
        await import('../../src/middleware/rate-limit');
        const opts = rateLimitMock.opts;
        const json = jest.fn();
        const res: any = {
            json,
            status: jest.fn(() => ({ json })),
            locals: { requestId: 'req-123' },
        };
        const req: any = { method: 'GET', originalUrl: '/api/x', user: { organizationId: 'org-9' } };
        // invoke handler directly
        await opts.handler(req, res);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(json).toHaveBeenCalledWith({
            error: {
                code: 'RATE_LIMITED',
                message: expect.stringContaining('organization org-9'),
            },
            requestId: 'req-123',
            timestamp: '2020-01-01T00:00:00.000Z',
            path: '/api/x',
            method: 'GET',
        });
    });
});
