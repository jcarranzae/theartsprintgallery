// app/api/proxy-video/route.ts - Proxy para servir videos de Kling AI
import { NextRequest, NextResponse } from 'next/server';

// Lista de dominios autorizados para videos
const AUTHORIZED_DOMAINS = [
  // Kling AI domains
  'v21-kling.klingai.com',
  'v22-kling.klingai.com',
  'v23-kling.klingai.com',
  'v24-kling.klingai.com',
  'v25-kling.klingai.com',
  'kling.klingai.com',
  'api-singapore.klingai.com',
  'cdn.klingai.com',

  // Other potential Kling domains
  'klingai.com',
  'kling-cdn.com',

  // AIML API domains (si también los usas)
  'api.aimlapi.com',
  'cdn.aimlapi.com',

  // Otros proveedores comunes
  'replicate.delivery',
  'pbxt.replicate.delivery'
];

function isAuthorizedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check exact matches
    if (AUTHORIZED_DOMAINS.includes(hostname)) {
      return true;
    }

    // Check wildcard matches for Kling subdomains
    if (hostname.endsWith('.klingai.com')) {
      return true;
    }

    // Check for replicate subdomains
    if (hostname.endsWith('.replicate.delivery')) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Invalid URL for domain check:', url);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      console.error('❌ No URL provided to proxy');
      return NextResponse.json({
        error: 'URL parameter is required'
      }, { status: 400 });
    }

    // Validate domain
    if (!isAuthorizedDomain(videoUrl)) {
      const hostname = new URL(videoUrl).hostname;
      console.error(`❌ Unauthorized domain: ${hostname}`);
      console.error(`❌ Full URL attempted: ${videoUrl}`);
      return NextResponse.json({
        error: 'Unauthorized domain',
        domain: hostname,
        allowedDomains: AUTHORIZED_DOMAINS
      }, { status: 403 });
    }

    console.log('✅ Proxying video from authorized domain:', new URL(videoUrl).hostname);
    console.log('🎬 Video URL:', videoUrl);

    // Fetch the video
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-Video-Proxy/1.0)',
        'Accept': 'video/*,*/*',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch video: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        error: 'Failed to fetch video',
        status: response.status,
        statusText: response.statusText
      }, { status: response.status });
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');

    console.log('📹 Video details:', {
      contentType,
      contentLength: contentLength ? `${Math.round(parseInt(contentLength) / 1024 / 1024)}MB` : 'unknown',
      status: response.status
    });

    // Create response with video data
    const videoBuffer = await response.arrayBuffer();

    console.log(`✅ Successfully proxied video: ${Math.round(videoBuffer.byteLength / 1024 / 1024)}MB`);

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': videoBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    });

  } catch (error) {
    console.error('❌ Video proxy error:', error);

    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return NextResponse.json({
        error: 'Invalid URL provided',
        details: 'The provided URL is not valid'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}