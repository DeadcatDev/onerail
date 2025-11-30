jest.mock('../../src/logger', () => ({
    __esModule: true,
    default: {
        debug: jest.fn(),
        info: jest.fn(),
    },
}));

describe('utils/cache', () => {
    const apiCacheModule = require('../../src/utils/cache');
    test('makeItemKey builds namespaced item key', () => {
        expect(apiCacheModule.makeItemKey('user', '123')).toBe('user:item:123');
    });

    test('makeListKey sorts and encodes query params, omits empty', () => {
        const cacheModule = require('../../src/utils/cache');
        const key = apiCacheModule.makeListKey('order', {
            page: 2,
            limit: 10,
            q: 'a b',
            empty: '',
            undef: undefined,
            nil: null,
        });
        expect(key).toBe('order:list:limit=10&page=2&q=a%20b');
    });

    test('set/get/del roundtrip and debug logs are called', () => {
        apiCacheModule.cacheSet('k1', { v: 1 }, 1); // short ttl
        expect(apiCacheModule.cacheGet('k1')).toEqual({ v: 1 });
        // delete and verify missing
        apiCacheModule.cacheDel('k1');
        expect(apiCacheModule.cacheGet('k1')).toBeUndefined();
        const logger = require('../../src/logger').default;
        expect(logger.debug).toHaveBeenCalled();
    });

    test('delByPrefix removes matching keys and logs info', () => {
        apiCacheModule.cacheSet('user:item:1', 1);
        apiCacheModule.cacheSet('user:item:2', 2);
        apiCacheModule.cacheSet('org:item:1', 3);
        apiCacheModule.delByPrefix('user:item:');
        expect(apiCacheModule.cacheGet('user:item:1')).toBeUndefined();
        expect(apiCacheModule.cacheGet('user:item:2')).toBeUndefined();
        expect(apiCacheModule.cacheGet('org:item:1')).toBe(3);
        const logger = require('../../src/logger').default;
        expect(logger.info).toHaveBeenCalledWith(
            'cache invalidated by prefix',
            { prefix: 'user:item:', count: 2 },
        );
    });
});
