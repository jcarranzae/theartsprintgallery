// middleware/rate-limit.ts
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private readonly windowMs: number;
    private readonly maxRequests: number;

    constructor(windowMs: number = 60000, maxRequests: number = 10) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    isAllowed(identifier: string): boolean {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }

        const requestTimes = this.requests.get(identifier)!;

        // Remove old requests outside the window
        const recentRequests = requestTimes.filter(time => time > windowStart);
        this.requests.set(identifier, recentRequests);

        if (recentRequests.length >= this.maxRequests) {
            return false;
        }

        // Add current request
        recentRequests.push(now);
        return true;
    }

    getRemainingRequests(identifier: string): number {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        if (!this.requests.has(identifier)) {
            return this.maxRequests;
        }

        const requestTimes = this.requests.get(identifier)!;
        const recentRequests = requestTimes.filter(time => time > windowStart);

        return Math.max(0, this.maxRequests - recentRequests.length);
    }

    getResetTime(identifier: string): number {
        if (!this.requests.has(identifier)) {
            return 0;
        }

        const requestTimes = this.requests.get(identifier)!;
        if (requestTimes.length === 0) {
            return 0;
        }

        const oldestRequest = Math.min(...requestTimes);
        return oldestRequest + this.windowMs;
    }
}