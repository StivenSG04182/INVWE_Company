import NodeCache from 'node-cache';

export const cache = new NodeCache({
    stdTTL: 300,
    checkperiod: 60, 
});

export const withCache = async <T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
): Promise<T> => {
    const cached = cache.get<T>(key);
    if (cached) return cached;

    const result = await fn();
    if (ttl !== undefined) {
        cache.set(key, result, ttl);
    } else {
        cache.set(key, result);
    }
    return result;
};