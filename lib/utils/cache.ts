// lib/utils/cache.ts
export class PromptCache {
    private static instance: PromptCache;
    private cache: Map<string, { result: any; timestamp: number; ttl: number }> = new Map();
    private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

    static getInstance(): PromptCache {
        if (!PromptCache.instance) {
            PromptCache.instance = new PromptCache();
        }
        return PromptCache.instance;
    }

    private generateKey(request: any): string {
        return `${request.content_type}_${request.platform}_${request.target_model}_${JSON.stringify(request.user_input)}`;
    }

    set(request: any, result: any, ttl?: number): void {
        const key = this.generateKey(request);
        const timestamp = Date.now();
        const expiry = ttl || this.defaultTTL;

        this.cache.set(key, {
            result,
            timestamp,
            ttl: expiry
        });
    }

    get(request: any): any | null {
        const key = this.generateKey(request);
        const cached = this.cache.get(key);

        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.result;
    }

    clear(): void {
        this.cache.clear();
    }

    cleanup(): void {
        const now = Date.now();
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp > cached.ttl) {
                this.cache.delete(key);
            }
        }
    }
}