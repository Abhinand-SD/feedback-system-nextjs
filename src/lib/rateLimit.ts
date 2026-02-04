type RateLimitStore = Map<string, { count: number; expiry: number }>;

const rateLimits: RateLimitStore = new Map();

/**
 * Basic in-memory rate limiter.
 * @param identifier Unique identifier (e.g., IP address or Email)
 * @param limit Max number of requests allowed
 * @param windowMs Time window in milliseconds
 * @returns { success: boolean; reset: number }
 */
export function checkRateLimit(identifier: string, limit: number, windowMs: number) {
    const now = Date.now();
    const record = rateLimits.get(identifier);

    // Clean up expired
    if (record && now > record.expiry) {
        rateLimits.delete(identifier);
    }

    const currentRecord = rateLimits.get(identifier);

    if (!currentRecord) {
        rateLimits.set(identifier, {
            count: 1,
            expiry: now + windowMs,
        });
        return { success: true, reset: now + windowMs };
    }

    if (currentRecord.count >= limit) {
        return { success: false, reset: currentRecord.expiry };
    }

    currentRecord.count += 1;
    return { success: true, reset: currentRecord.expiry };
}
