// lib/videoUrlUtils.ts - Utility functions for video URL handling

/**
 * Lista de dominios que necesitan proxy para evitar CORS
 */
const DOMAINS_REQUIRING_PROXY = [
    'v21-kling.klingai.com',
    'v22-kling.klingai.com',
    'v23-kling.klingai.com',
    'v24-kling.klingai.com',
    'v25-kling.klingai.com',
    'kling.klingai.com',
    'cdn.klingai.com',
    'api.aimlapi.com',
    'cdn.aimlapi.com',
    'replicate.delivery',
    'pbxt.replicate.delivery'
];

/**
 * Verifica si una URL necesita proxy para evitar problemas de CORS
 */
export function needsProxy(url: string): boolean {
    try {
        if (!url || !url.startsWith('http')) {
            return false;
        }

        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // Si es una URL local, no necesita proxy
        if (typeof window !== 'undefined' && url.startsWith(window.location.origin)) {
            return false;
        }

        // Check domains that specifically need proxy
        if (DOMAINS_REQUIRING_PROXY.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
            return true;
        }

        // Check for Kling subdomains
        if (hostname.endsWith('.klingai.com')) {
            return true;
        }

        // Check for Replicate subdomains
        if (hostname.endsWith('.replicate.delivery')) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking if URL needs proxy:', error);
        return false;
    }
}

/**
 * Convierte una URL de video a una URL proxificada si es necesario
 */
export function getProxiedVideoUrl(originalUrl: string): string {
    if (!originalUrl) {
        return originalUrl;
    }

    if (needsProxy(originalUrl)) {
        const proxiedUrl = `/api/proxy-video?url=${encodeURIComponent(originalUrl)}`;
        console.log('🔄 Using proxy for video URL:', {
            original: originalUrl,
            proxied: proxiedUrl,
            domain: new URL(originalUrl).hostname
        });
        return proxiedUrl;
    }

    console.log('✅ Direct video URL (no proxy needed):', originalUrl);
    return originalUrl;
}

/**
 * Maneja errores de carga de video y proporciona fallbacks
 */
export function handleVideoLoadError(originalUrl: string, error: Event): string | null {
    console.error('❌ Video load error:', error);
    console.error('❌ Failed URL:', originalUrl);

    const target = error.target as HTMLVideoElement;
    const currentSrc = target?.src;

    // Si ya estamos usando proxy y falló, intentar URL directa
    if (currentSrc && currentSrc.includes('/api/proxy-video')) {
        console.log('🔄 Proxy failed, trying direct URL...');
        return originalUrl;
    }

    // Si URL directa falló, intentar proxy
    if (!currentSrc?.includes('/api/proxy-video') && needsProxy(originalUrl)) {
        console.log('🔄 Direct URL failed, trying proxy...');
        return getProxiedVideoUrl(originalUrl);
    }

    console.error('❌ All video loading methods failed');
    return null;
}

/**
 * Obtiene información de debugging sobre una URL de video
 */
export function debugVideoUrl(url: string): object {
    try {
        const urlObj = new URL(url);
        return {
            url,
            hostname: urlObj.hostname,
            needsProxy: needsProxy(url),
            proxiedUrl: getProxiedVideoUrl(url),
            isKling: urlObj.hostname.includes('kling'),
            isReplicate: urlObj.hostname.includes('replicate'),
            isLocal: typeof window !== 'undefined' && url.startsWith(window.location.origin)
        };
    } catch (error) {
        return {
            url,
            error: 'Invalid URL',
            needsProxy: false
        };
    }
}

/**
 * Hook personalizado para manejar URLs de video con retry automático
 */
export function createVideoUrlWithRetry(originalUrl: string): {
    currentUrl: string;
    onError: (error: Event) => void;
    hasRetried: boolean;
} {
    let hasRetried = false;
    let currentUrl = getProxiedVideoUrl(originalUrl);

    const onError = (error: Event) => {
        if (!hasRetried) {
            hasRetried = true;
            const fallbackUrl = handleVideoLoadError(originalUrl, error);
            if (fallbackUrl && fallbackUrl !== currentUrl) {
                currentUrl = fallbackUrl;
                const target = error.target as HTMLVideoElement;
                if (target) {
                    target.src = currentUrl;
                    target.load();
                }
            }
        }
    };

    return {
        currentUrl,
        onError,
        hasRetried
    };
}