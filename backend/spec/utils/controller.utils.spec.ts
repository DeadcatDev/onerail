import { Request, Response } from 'express';
import {
    parsePagination,
    setPublicCache,
    sendCachedPublic,
    sendCachedWithETag,
    sendAndCacheWithETag,
    handleError,
} from '../../src/controllers/controller.utils';
import { ValidationError, NotFoundError } from '../../src/services/errors';

jest.useFakeTimers();
jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));

jest.mock('../../src/utils/etag', () => ({
    computeETag: jest.fn(() => '"etag123"'),
}));

const cacheSetMock = jest.fn();
jest.mock('../../src/utils/cache', () => ({
    __esModule: true,
    set: (key: string, value: any) => cacheSetMock(key, value),
    cacheSet: (key: string, value: any) => cacheSetMock(key, value),
    default: {
        set: (key: string, value: any) => cacheSetMock(key, value),
    },
}));

describe('controller.utils', () => {
    afterEach(() => {
        cacheSetMock.mockClear();
    });

    test('parsePagination parses numeric page and limit and omits missing', () => {
        const req = {
            query: { page: '2', limit: '50' },
        } as unknown as Request;
        const result = parsePagination(req);
        expect(result).toEqual({ page: 2, limit: 50 });

        const req2 = { query: {} } as unknown as Request;
        const result2 = parsePagination(req2);
        expect(result2).toEqual({ page: undefined, limit: undefined });
    });

    test('setPublicCache sets public Cache-Control header', () => {
        const set = jest.fn();
        const res = { set } as unknown as Response;
        setPublicCache(res, 123);
        expect(set).toHaveBeenCalledWith(
            'Cache-Control',
            'public, max-age=123',
        );
    });

    test('sendCachedPublic sets cache header and sends body', () => {
        const set = jest.fn();
        const send = jest.fn();
        const res = { set, send } as any as Response;
        const body = { ok: true };
        sendCachedPublic(res, body, 5);
        expect(set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=5');
        expect(send).toHaveBeenCalledWith(body);
    });

    test('sendCachedWithETag sends 200 with ETag when no If-None-Match', () => {
        const res = {
            set: jest.fn(),
            send: jest.fn(),
            status: jest.fn(() => res),
            end: jest.fn(),
        } as any as Response;
        const req = { headers: {} } as any as Request;
        const body = { hello: 'world' };
        sendCachedWithETag(req, res, body);
        expect(res.set).toHaveBeenCalledWith('ETag', '"etag123"');
        expect(res.send).toHaveBeenCalledWith(body);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('sendCachedWithETag returns 304 when If-None-Match matches', () => {
        const res = {
            set: jest.fn(),
            send: jest.fn(),
            status: jest.fn(() => res),
            end: jest.fn(),
        } as any as Response;
        const req = {
            headers: { 'if-none-match': '"etag123"' },
        } as any as Request;
        const body = { any: 'thing' };
        sendCachedWithETag(req, res, body);
        expect(res.set).toHaveBeenCalledWith('ETag', '"etag123"');
        expect(res.status).toHaveBeenCalledWith(304);
        expect(res.end).toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });

    test('sendAndCacheWithETag caches body and respects 200 flow', () => {
        const res = {
            set: jest.fn(),
            send: jest.fn(),
            status: jest.fn(() => res),
            end: jest.fn(),
        } as any as Response;
        const req = { headers: {} } as any as Request;
        const body = { payload: 1 };
        sendAndCacheWithETag(req, res, 'cache:key', body);
        expect(cacheSetMock).toHaveBeenCalledWith('cache:key', body);
        expect(res.set).toHaveBeenCalledWith('ETag', '"etag123"');
        expect(res.send).toHaveBeenCalledWith(body);
    });

    test('sendAndCacheWithETag caches body and returns 304 when header matches', () => {
        const res = {
            set: jest.fn(),
            send: jest.fn(),
            status: jest.fn(() => res),
            end: jest.fn(),
        } as any as Response;
        const req = {
            headers: { 'if-none-match': '"etag123"' },
        } as any as Request;
        const body = { payload: 2 };
        sendAndCacheWithETag(req, res, 'cache:key2', body);
        expect(cacheSetMock).toHaveBeenCalledWith('cache:key2', body);
        expect(res.set).toHaveBeenCalledWith('ETag', '"etag123"');
        expect(res.status).toHaveBeenCalledWith(304);
        expect(res.end).toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });

    describe('handleError', () => {
        function makeRes() {
            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const res: any = { status, locals: { requestId: 'req-1' } };
            return { res, status, json };
        }

        test('maps ValidationError to 400 with structured body', () => {
            const { res, status, json } = makeRes();
            handleError(new ValidationError('bad input'), res as any);
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({
                error: { code: 'VALIDATION_ERROR', message: 'bad input' },
                requestId: 'req-1',
                timestamp: '2020-01-01T00:00:00.000Z',
            });
        });

        test('maps NotFoundError to 404 with structured body', () => {
            const { res, status, json } = makeRes();
            handleError(new NotFoundError('not here'), res as any);
            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({
                error: { code: 'NOT_FOUND', message: 'not here' },
                requestId: 'req-1',
                timestamp: '2020-01-01T00:00:00.000Z',
            });
        });

        test('maps unknown error to 500 and hides message', () => {
            const { res, status, json } = makeRes();
            handleError(new Error('boom'), res as any);
            expect(status).toHaveBeenCalledWith(500);
            expect(json).toHaveBeenCalledWith({
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal Server Error',
                },
                requestId: 'req-1',
                timestamp: '2020-01-01T00:00:00.000Z',
            });
        });
    });
});
