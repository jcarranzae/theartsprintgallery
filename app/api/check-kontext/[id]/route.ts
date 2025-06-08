// app/api/check-kontext/[id]/route.ts (ARREGLADO)
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    console.log(`🔍 Checking status for task: ${id}`);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Obtener configuración del environment
    const baseUrl = process.env.BFL_BASE_URL;
    const apiKey = process.env.BFL_API_KEY;
    
    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'BFL API configuration not found' },
        { status: 500 }
      );
    }

    // Consultar estado del task en BFL API usando query parameter
    const bflUrl = `${baseUrl}/v1/get_result?id=${id}`;
    console.log(`🎯 Polling BFL at: ${bflUrl}`);
    
    const response = await fetch(bflUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Key': apiKey
      }
    });

    console.log(`📊 BFL polling response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ BFL polling error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to check task status',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Obtener respuesta como texto para debug
    const responseText = await response.text();
    console.log(`📄 Raw BFL polling response: ${responseText}`);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse polling response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from BFL polling' },
        { status: 500 }
      );
    }

    console.log(`📊 Task ${id} parsed result:`, JSON.stringify(result, null, 2));

    // Determinar si la tarea está completa según el formato de BFL
    const isCompleted = result.status === 'Ready';
    const isPending = result.status === 'Pending';
    const isModerated = result.status === 'Request Moderated' || result.status === 'Content Moderated';
    const notFound = result.status === 'Task not found';

    // CLAVE: Extraer la imagen correctamente
    let imageData = null;
    if (isCompleted && result.result) {
      console.log('🖼️ Processing image result...');
      console.log('Result object keys:', Object.keys(result.result));
      console.log('Result object:', JSON.stringify(result.result, null, 2));
      
      // BFL puede devolver la imagen en diferentes formatos
      if (result.result.sample) {
        imageData = result.result.sample;
        console.log('✅ Found image in result.sample');
      } else if (result.result.url) {
        imageData = result.result.url;
        console.log('✅ Found image URL in result.url');
      } else if (result.result.image) {
        imageData = result.result.image;
        console.log('✅ Found image in result.image');
      } else if (typeof result.result === 'string') {
        imageData = result.result;
        console.log('✅ Found image as direct string');
      } else {
        console.log('⚠️ No image data found in result');
        console.log('Available keys in result:', Object.keys(result.result));
      }
    }

    const responseData = {
      success: true,
      completed: isCompleted,
      pending: isPending,
      moderated: isModerated,
      notFound: notFound,
      status: result.status,
      progress: result.progress || 0,
      imageData: imageData, // ← CLAVE: Incluir datos de imagen
      result: result.result,
      details: result.details || {},
      data: result
    };

    console.log('📤 Sending response to frontend:', JSON.stringify({
      ...responseData,
      result: '...[truncated]...',
      data: '...[truncated]...'
    }, null, 2));

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Polling API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}