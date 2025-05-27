"use client"

import { useState, useEffect, useCallback } from "react"

interface CacheOptions {
    ttl?: number // Time to live in milliseconds
    maxSize?: number // Maximum number of entries
}

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

export function useCache<T>(options: CacheOptions = {}) {
    const { ttl = 5 * 60 * 1000, maxSize = 100 } = options // Default 5 minutes TTL
    const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map())

    const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
        return Date.now() - entry.timestamp > entry.ttl
    }, [])

    const cleanExpired = useCallback(() => {
        setCache((prevCache) => {
            const newCache = new Map(prevCache)
            for (const [key, entry] of newCache.entries()) {
                if (isExpired(entry)) {
                    newCache.delete(key)
                }
            }
            return newCache
        })
    }, [isExpired])

    const get = useCallback(
        (key: string): T | null => {
            const entry = cache.get(key)
            if (!entry) return null

            if (isExpired(entry)) {
                setCache((prevCache) => {
                    const newCache = new Map(prevCache)
                    newCache.delete(key)
                    return newCache
                })
                return null
            }

            return entry.data
        },
        [cache, isExpired],
    )

    const set = useCallback(
        (key: string, data: T, customTtl?: number): void => {
            setCache((prevCache) => {
                const newCache = new Map(prevCache)

                // Remove oldest entries if cache is full
                if (newCache.size >= maxSize) {
                    const oldestKey = newCache.keys().next().value
                    newCache.delete(oldestKey)
                }

                newCache.set(key, {
                    data,
                    timestamp: Date.now(),
                    ttl: customTtl || ttl,
                })

                return newCache
            })
        },
        [maxSize, ttl],
    )

    const remove = useCallback((key: string): void => {
        setCache((prevCache) => {
            const newCache = new Map(prevCache)
            newCache.delete(key)
            return newCache
        })
    }, [])

    const clear = useCallback((): void => {
        setCache(new Map())
    }, [])

    const has = useCallback(
        (key: string): boolean => {
            const entry = cache.get(key)
            return entry ? !isExpired(entry) : false
        },
        [cache, isExpired],
    )

    const size = cache.size

    // Clean expired entries periodically
    useEffect(() => {
        const interval = setInterval(cleanExpired, 60000) // Clean every minute
        return () => clearInterval(interval)
    }, [cleanExpired])

    return {
        get,
        set,
        remove,
        clear,
        has,
        size,
        cleanExpired,
    }
}

// Hook for API data caching with automatic fetching
export function useCachedApi<T>(
    url: string,
    options: CacheOptions & {
        enabled?: boolean
        refetchInterval?: number
    } = {},
) {
    const { enabled = true, refetchInterval, ...cacheOptions } = options
    const { get, set, has } = useCache<T>(cacheOptions)
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = useCallback(
        async (force = false) => {
            if (!enabled) return

            const cacheKey = url
            const cachedData = get(cacheKey)

            if (cachedData && !force) {
                setData(cachedData)
                return cachedData
            }

            try {
                setIsLoading(true)
                setError(null)

                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json()
                set(cacheKey, result)
                setData(result)
                return result
            } catch (err) {
                const error = err instanceof Error ? err : new Error("Unknown error")
                setError(error)
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [url, enabled, get, set],
    )

    const refetch = useCallback(() => fetchData(true), [fetchData])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Set up refetch interval if specified
    useEffect(() => {
        if (!refetchInterval) return

        const interval = setInterval(() => {
            fetchData(true)
        }, refetchInterval)

        return () => clearInterval(interval)
    }, [refetchInterval, fetchData])

    return {
        data,
        isLoading,
        error,
        refetch,
        isCached: has(url),
    }
}

// Hook for optimistic updates with cache invalidation
export function useOptimisticCache<T>() {
    const { get, set, remove } = useCache<T>()

    const optimisticUpdate = useCallback(
        async (
            key: string,
            optimisticData: T,
            asyncOperation: () => Promise<any>,
            onSuccess?: (result: any) => T,
            onError?: (error: Error) => void,
        ): Promise<any> => {
            const originalData = get(key)

            // Apply optimistic update
            set(key, optimisticData)

            try {
                const result = await asyncOperation()

                // Update with real data if onSuccess provided
                if (onSuccess) {
                    set(key, onSuccess(result))
                }

                return result
            } catch (error) {
                // Revert to original data on error
                if (originalData) {
                    set(key, originalData)
                } else {
                    remove(key)
                }

                if (onError) {
                    onError(error instanceof Error ? error : new Error("Unknown error"))
                }

                throw error
            }
        },
        [get, set, remove],
    )

    return { optimisticUpdate }
}
