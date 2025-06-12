// app/api/generate-kling/route.ts - Con autenticación JWT corregida
import { NextRequest, NextResponse } from 'next/server';
import { getKlingAuthHeader, debugKlingJWT } from '@/lib/klingJwtUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      model_name = 'kling-v2-master', // Default to latest model
      prompt,
      negative_prompt,
      cfg_scale = 0.5,
      mode = 'std', // std or pro
      camera_control,
      aspect_ratio = '16:9',
      duration = '5', // 5 or 10 seconds
      callback_url,
      external_task_id
    } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required',
        details: 'Please provide a text prompt for video generation'
      }, { status: 400 });
    }

    if (prompt.length > 2500) {
      return NextResponse.json({
        success: false,
        error: 'Prompt too long',
        details: 'Prompt cannot exceed 2500 characters'
      }, { status: 400 });
    }

    if (negative_prompt && negative_prompt.length > 2500) {
      return NextResponse.json({
        success: false,
        error: 'Negative prompt too long',
        details: 'Negative prompt cannot exceed 2500 characters'
      }, { status: 400 });
    }

    // Validate model_name
    const validModels = ['kling-v1', 'kling-v1-6', 'kling-v2-master'];
    if (!validModels.includes(model_name)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid model',
        details: `Model must be one of: ${validModels.join(', ')}`
      }, { status: 400 });
    }

    // Validate aspect_ratio
    const validAspectRatios = ['16:9', '9:16', '1:1'];
    if (!validAspectRatios.includes(aspect_ratio)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid aspect ratio',
        details: `Aspect ratio must be one of: ${validAspectRatios.join(', ')}`
      }, { status: 400 });
    }

    // Validate duration
    const validDurations = ['5', '10'];
    if (!validDurations.includes(duration)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid duration',
        details: `Duration must be one of: ${validDurations.join(', ')} seconds`
      }, { status: 400 });
    }

    // Validate cfg_scale
    if (cfg_scale < 0 || cfg_scale > 1) {
      return NextResponse.json({
        success: false,
        error: 'Invalid cfg_scale',
        details: 'cfg_scale must be between 0 and 1'
      }, { status: 400 });
    }

    // Validate camera_control if provided
    if (camera_control) {
      const validTypes = ['simple', 'down_back', 'forward_up', 'right_turn_forward', 'left_turn_forward'];
      if (!validTypes.includes(camera_control.type)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid camera control type',
          details: `Camera type must be one of: ${validTypes.join(', ')}`
        }, { status: 400 });
      }

      // If simple type, validate config
      if (camera_control.type === 'simple' && camera_control.config) {
        const { horizontal, vertical, pan, tilt, roll, zoom } = camera_control.config;
        const values = [horizontal, vertical, pan, tilt, roll, zoom].filter(v => v !== undefined && v !== null);

        // Check that only one value is non-zero
        const nonZeroValues = values.filter(v => v !== 0);
        if (nonZeroValues.length > 1) {
          return NextResponse.json({
            success: false,
            error: 'Invalid camera config',
            details: 'Only one camera movement parameter should be non-zero for simple type'
          }, { status: 400 });
        }

        // Validate range [-10, 10]
        for (const value of values) {
          if (value < -10 || value > 10) {
            return NextResponse.json({
              success: false,
              error: 'Invalid camera parameter range',
              details: 'Camera movement parameters must be between -10 and 10'
            }, { status: 400 });
          }
        }
      }

      // For non-simple types, ensure config is null or undefined
      if (camera_control.type !== 'simple') {
        camera_control.config = undefined;
      }
    }

    // Prepare request payload
    const payload: any = {
      model_name,
      prompt,
      cfg_scale,
      mode,
      aspect_ratio,
      duration
    };

    // Add optional fields only if they have valid values
    if (negative_prompt && negative_prompt.trim()) {
      payload.negative_prompt = negative_prompt.trim();
    }

    if (camera_control) {
      payload.camera_control = camera_control;
    }

    if (callback_url && callback_url.trim()) {
      payload.callback_url = callback_url.trim();
    }

    if (external_task_id && external_task_id.trim()) {
      payload.external_task_id = external_task_id.trim();
    }

    console.log('🎬 Kling API Request Summary:', {
      model_name,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      mode,
      duration: duration + 's',
      aspect_ratio,
      cfg_scale,
      has_camera_control: !!camera_control,
      camera_control_type: camera_control?.type,
      has_negative_prompt: !!negative_prompt
    });

    // Generate JWT token for this request (usando la implementación corregida)
    let authHeader;
    try {
      authHeader = getKlingAuthHeader();
      console.log('✅ Successfully generated JWT token for Kling API');
    } catch (authError) {
      console.error('❌ Failed to generate JWT token:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication Error',
        details: 'Failed to generate authentication token. Check your KLING_ACCESS_KEY and KLING_SECRET_KEY environment variables.'
      }, { status: 500 });
    }

    console.log('📦 Full payload to Kling API:', JSON.stringify(payload, null, 2));

    // Make request to Kling API
    const response = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    console.log('📥 Kling API Response Status:', response.status);
    console.log('📥 Kling API Response Data:', responseData);

    if (!response.ok) {
      console.error('❌ Kling API HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        responseData
      });

      // Check if it's an authentication error
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'Authentication Failed',
          details: 'Invalid API credentials. Please check your KLING_ACCESS_KEY and KLING_SECRET_KEY.',
          code: responseData.code,
          kling_request_id: responseData.request_id
        }, { status: 401 });
      }

      return NextResponse.json({
        success: false,
        error: 'Kling API Error',
        details: responseData.message || 'Unknown error from Kling API',
        code: responseData.code,
        kling_request_id: responseData.request_id
      }, { status: response.status });
    }

    if (responseData.code !== 0) {
      console.error('❌ Kling API Response Error:', {
        code: responseData.code,
        message: responseData.message,
        request_id: responseData.request_id
      });
      return NextResponse.json({
        success: false,
        error: 'Kling API Response Error',
        details: responseData.message || 'Unknown error from Kling API',
        code: responseData.code,
        kling_request_id: responseData.request_id
      }, { status: 400 });
    }

    console.log('✅ Kling Task Created Successfully:', responseData.data?.task_id);

    return NextResponse.json({
      success: true,
      data: {
        task_id: responseData.data.task_id,
        task_status: responseData.data.task_status,
        external_task_id: responseData.data.task_info?.external_task_id,
        created_at: responseData.data.created_at,
        updated_at: responseData.data.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Generate Kling Error:', error);

    // Check if it's a JWT generation error
    if (error instanceof Error && error.message.includes('KLING_ACCESS_KEY')) {
      return NextResponse.json({
        success: false,
        error: 'Configuration Error',
        details: 'Missing Kling API credentials. Please set KLING_ACCESS_KEY and KLING_SECRET_KEY environment variables.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}