// app/api/flux-context/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface GenerationRequest {
    prompt: string;
    model: 'flux-context-pro' | 'flux-context-max';
    width: number;
    height: number;
    steps: number;
    guidance_scale: number;
    strength: number;
    seed?: number;
    context_image?: string;
    mask_image?: string;
}

interface FluxContextResponse {
    images: string[];
    seed: number;
    model: string;
    processing_time: number;
}

// Función para convertir base64 a blob para envío a la API
async function base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return response.blob();
}

// Función principal para llamar a la API de Flux Context
async function generateWithFluxContext(params: GenerationRequest): Promise<FluxContextResponse> {
    const apiKey = process.env.NEXT_PUBLIC_BFL_API_KEY;

    if (!apiKey) {
        throw new Error('NEXT_PUBLIC_BFL_API_KEY no está configurada en las variables de entorno');
    }

    const formData = new FormData();

    // Parámetros básicos
    formData.append('prompt', params.prompt);
    formData.append('model', params.model);
    formData.append('aspect-ratio', params.width.toString());
    //formData.append('height', params.height.toString());
    //formData.append('steps', params.steps.toString());
    //formData.append('guidance_scale', params.guidance_scale.toString());
    formData.append('strength', params.strength.toString());

    if (params.seed) {
        formData.append('seed', params.seed.toString());
    }

    // Agregar imágenes si están presentes
    if (params.context_image) {
        const contextBlob = await base64ToBlob(params.context_image);
        formData.append('input_image', contextBlob, 'context.png');
    }

    if (params.mask_image) {
        const maskBlob = await base64ToBlob(params.mask_image);
        formData.append('mask_image', maskBlob, 'mask.png');
    }

    // Determinar el endpoint según el modelo
    const endpoint = params.model === 'flux-context-pro'
        ? 'https://api.us1.bfl.ai/v1/flux-kontext-pro'
        : 'https://api.us1.bfl.ai/v1/flux-kontext-max';

    const startTime = Date.now();

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'x-key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error de la API Flux: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const processingTime = (Date.now() - startTime) / 1000;

        return {
            images: result.images || [result.image],
            seed: result.seed || params.seed || Math.floor(Math.random() * 1000000),
            model: params.model,
            processing_time: processingTime
        };

    } catch (error) {
        console.error('Error en generación Flux Context:', error);
        throw error;
    }
}

// Función alternativa usando réplicas locales o endpoints alternativos
async function generateWithAlternativeAPI(params: GenerationRequest): Promise<FluxContextResponse> {
    // Esta función puede usar Replicate, Hugging Face, o cualquier otra API
    // como fallback o alternativa principal

    const startTime = Date.now();

    // Ejemplo con Replicate (necesitarías instalar replicate: npm install replicate)
    /*
    import Replicate from 'replicate';
    
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  
    const input = {
      prompt: params.prompt,
      width: params.width,
      height: params.height,
      num_inference_steps: params.steps,
      guidance_scale: params.guidance_scale,
      seed: params.seed,
    };
  
    if (params.context_image) {
      input.image = params.context_image;
    }
  
    if (params.mask_image) {
      input.mask = params.mask_image;
    }
  
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      { input }
    );
    */

    // Simulación para propósitos de desarrollo
    // REEMPLAZA ESTO con la implementación real de tu API preferida

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Imagen de ejemplo (reemplaza con la imagen real generada)
    const mockImageUrl = `data:image/svg+xml;base64,${btoa(`
    <svg width="${params.width}" height="${params.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(168,85,247);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(59,130,246);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
        Imagen generada con
      </text>
      <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="32" font-family="Arial">
        ${params.model.toUpperCase()}
      </text>
      <text x="50%" y="70%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
        ${params.prompt.substring(0, 50)}${params.prompt.length > 50 ? '...' : ''}
      </text>
    </svg>
  `)}`;

    const processingTime = (Date.now() - startTime) / 1000;

    return {
        images: [mockImageUrl],
        seed: params.seed || Math.floor(Math.random() * 1000000),
        model: params.model,
        processing_time: processingTime
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerationRequest = await request.json();

        // Validación de parámetros
        if (!body.prompt || body.prompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'El prompt es requerido' },
                { status: 400 }
            );
        }

        if (!['flux-context-pro', 'flux-context-max'].includes(body.model)) {
            return NextResponse.json(
                { error: 'Modelo no válido' },
                { status: 400 }
            );
        }

        // Validación de dimensiones
        if (body.width < 512 || body.width > 2048 || body.height < 512 || body.height > 2048) {
            return NextResponse.json(
                { error: 'Las dimensiones deben estar entre 512 y 2048 píxeles' },
                { status: 400 }
            );
        }

        // Validación de pasos
        if (body.steps < 1 || body.steps > 50) {
            return NextResponse.json(
                { error: 'Los pasos deben estar entre 1 y 50' },
                { status: 400 }
            );
        }

        console.log(`Generando imagen con ${body.model}:`, {
            prompt: body.prompt.substring(0, 100),
            dimensions: `${body.width}x${body.height}`,
            steps: body.steps,
            has_context: !!body.context_image,
            has_mask: !!body.mask_image
        });

        // Intentar generar con la API oficial de Flux
        let result: FluxContextResponse;

        try {
            // Cambia esta línea para usar la API real cuando tengas acceso
            result = await generateWithFluxContext(body);

            // Por ahora usamos la implementación alternativa/mock
            // result = await generateWithAlternativeAPI(body);

        } catch (apiError) {
            console.error('Error con API principal, intentando alternativa:', apiError);

            // Fallback a API alternativa
            result = await generateWithAlternativeAPI(body);
        }

        // Respuesta exitosa
        return NextResponse.json({
            image_url: result.images[0],
            seed: result.seed,
            model_used: result.model,
            generation_time: result.processing_time,
            additional_images: result.images.slice(1) // Si hay múltiples imágenes
        });

    } catch (error) {
        console.error('Error en generación:', error);

        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}

// Endpoint GET para verificar el estado del servicio
export async function GET() {
    return NextResponse.json({
        status: 'active',
        models: ['flux-context-pro', 'flux-context-max'],
        version: '1.0.0',
        endpoints: {
            generate: '/api/flux-context/generate'
        }
    });
}