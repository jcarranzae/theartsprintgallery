// app/api/proxy-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        // Verificar que la URL es de BFL para seguridad
        if (!imageUrl.includes('delivery-us1.bfl.ai') && !imageUrl.includes('bfl.ai')) {
            return NextResponse.json(
                { error: 'Invalid image URL' },
                { status: 400 }
            );
        }

        console.log('🖼️ Proxying image from:', imageUrl);

        // Fetch de la imagen desde BFL
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            console.error('❌ Failed to fetch image:', response.status, response.statusText);
            return NextResponse.json(
                { error: `Failed to fetch image: ${response.status}` },
                { status: response.status }
            );
        }

        // Obtener contenido de la imagen
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        console.log('✅ Image fetched successfully:', imageBuffer.byteLength, 'bytes');

        // Devolver la imagen con headers apropiados
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': imageBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('❌ Image proxy error:', error);
        return NextResponse.json(
            {
                error: 'Failed to proxy image',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}