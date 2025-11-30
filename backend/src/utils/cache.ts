import LRUCache from 'lru-cache';
import logger from '../logger';

const DEFAULT_TTL_SECONDS: number =
    Number(process.env.CACHE_TTL_SECONDS || '') || 600;

export type CacheValue<T = any> = T;

const cache = new LRUCache<string, CacheValue>({
    max: 1000,
    ttl: DEFAULT_TTL_SECONDS * 1000,
});

export function cacheGet<T = any>(key: string): T | undefined {
    const val = cache.get(key) as T | undefined;
    if (val !== undefined) {
        logger.debug?.('cache hit', { key });
    } else {
        logger.debug?.('cache miss', { key });
    }
    return val;
}

export function cacheSet<T = any>(
    key: string,
    value: T,
    ttlSeconds?: number,
): void {
    cache.set(key, value, { ttl: (ttlSeconds ?? DEFAULT_TTL_SECONDS) * 1000 });
}

export function cacheDel(key: string): void {
    cache.delete(key);
}

export function delByPrefix(prefix: string): void {
    const keys: string[] = [];
    cache.forEach((_, k) => {
        if (k.startsWith(prefix)) keys.push(k);
    });
    keys.forEach((k) => cache.delete(k));
    if (keys.length) {
        logger.info('cache invalidated by prefix', {
            prefix,
            count: keys.length,
        });
    }
}

export function makeListKey(
    entity: string,
    query: Record<string, any>,
): string {
    const q = Object.keys(query)
        .filter(
            (k) =>
                query[k] !== undefined && query[k] !== null && query[k] !== '',
        )
        .sort()
        .map(
            (k) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k]))}`,
        )
        .join('&');
    return `${entity}:list${q ? ':' + q : ''}`;
}

export function makeItemKey(entity: string, id: string): string {
    return `${entity}:item:${id}`;
}

export function invalidateList(entity: string): void {
    delByPrefix(`${entity}:list`);
}

export function invalidateItem(entity: string, id: string): void {
    cacheDel(makeItemKey(entity, id));
}

export function invalidateEntity(entity: string, id: string): void {
    invalidateList(entity);
    invalidateItem(entity, id);
}
