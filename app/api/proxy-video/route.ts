// app/api/proxy-video/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json({
        error: 'Missing video URL parameter'
      }, { status: 400 });
    }

    // Validate that the URL is from a trusted source (Kling)
    const allowedDomains = [
      'p1.a.kwimgs.com',
      'p2.a.kwimgs.com', 
      'p3.a.kwimgs.com',
      'kuaishou.com',
      'kwimgs.com'
    ];

    const url = new URL(videoUrl);
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname.includes(domain)
    );

    if (!isAllowedDomain) {
      console.error('❌ Unauthorized domain:', url.hostname);
      return NextResponse.json({
        error: 'Unauthorized video source'
      }, { status: 403 });
    }

    console.log('🎬 Proxying video from:', url.hostname);

    // Fetch the video with proper headers
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://kuaishou.com',
        'Accept': 'video/mp4,video/webm,video/*,*/*;q=0.9',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch video:', response.status, response.statusText);
      return NextResponse.json({
        error: `Failed to fetch video: ${response.statusText}`
      }, { status: response.status });
    }

    // Get video data
    const videoBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');

    console.log('✅ Video proxied successfully:', {
      contentType,
      size: contentLength || videoBuffer.byteLength
    });

    // Return video with proper headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': videoBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Video proxy error:', error);
    return NextResponse.json({
      error: 'Failed to proxy video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}