// config/environment.ts
export const ENV_CONFIG = {
    development: {
        logLevel: 'debug',
        cacheEnabled: true,
        rateLimitEnabled: false,
        metricsEnabled: true,
        apiTimeout: 30000
    },
    production: {
        logLevel: 'info',
        cacheEnabled: true,
        rateLimitEnabled: true,
        metricsEnabled: true,
        apiTimeout: 15000
    },
    test: {
        logLevel: 'error',
        cacheEnabled: false,
        rateLimitEnabled: false,
        metricsEnabled: false,
        apiTimeout: 10000
    }
};

export function getConfig() {
    const env = process.env.NODE_ENV || 'development';
    return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
}