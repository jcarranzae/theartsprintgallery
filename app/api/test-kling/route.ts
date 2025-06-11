// app/api/test-kling/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKlingAuthHeader } from '@/lib/klingJwtUtils';

export async function POST(request: NextRequest) {
  try {
    const { prompt = "A beautiful sunset over mountains" } = await request.json();

    // Minimal payload for testing
    const payload = {
      model_name: "kling-v2-master",
      prompt: prompt,
      duration: "5",
      aspect_ratio: "16:9",
      mode: "std",
      cfg_scale: 0.5
    };

    console.log('🧪 Test Kling API Request:', payload);

    // First, test DNS resolution and basic connectivity
    console.log('🔍 Testing connectivity to Kling API...');

    // Generate JWT token for this request
    let authHeader;
    try {
      authHeader = getKlingAuthHeader();
      console.log('🔐 JWT generated successfully');
    } catch (jwtError) {
      console.error('❌ JWT generation failed:', jwtError);
      return NextResponse.json({
        success: false,
        error: 'JWT Generation Error',
        details: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error',
        step: 'jwt_generation'
      }, { status: 200 });
    }

    // Test basic connectivity first
    const testUrl = 'https://api-singapore.klingai.com';
    
    try {
      console.log('🌐 Testing basic connectivity to:', testUrl);
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Kling-Test/1.0)',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('✅ Basic connectivity test:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        url: testResponse.url
      });
    } catch (connectError) {
      console.error('❌ Basic connectivity failed:', connectError);
      return NextResponse.json({
        success: false,
        error: 'Connectivity Error',
        details: connectError instanceof Error ? connectError.message : 'Unknown connectivity error',
        step: 'connectivity_test',
        target_url: testUrl,
        suggestions: [
          'Check your internet connection',
          'Verify DNS resolution for api.kuaishou.com',
          'Check if corporate firewall is blocking external requests',
          'Try using a VPN if in a restricted network'
        ]
      }, { status: 200 });
    }

    // Now try the actual API endpoint
    const apiUrl = 'https://api-singapore.klingai.com/v1/videos/text2video';
    console.log('🎯 Making request to Kling API:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Kling-Client/1.0)',
          ...authHeader
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const responseData = await response.json();

      console.log('📥 Kling API Response:', {
        status: response.status,
        ok: response.ok,
        headers: {
          'content-type': response.headers.get('content-type'),
          'server': response.headers.get('server'),
          'date': response.headers.get('date')
        },
        data: responseData
      });

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: 'Kling API Error',
          status: response.status,
          statusText: response.statusText,
          details: responseData.message || 'Unknown error from Kling API',
          code: responseData.code,
          kling_request_id: responseData.request_id,
          full_response: responseData,
          step: 'api_response_error'
        }, { status: 200 });
      }

      if (responseData.code !== 0) {
        return NextResponse.json({
          success: false,
          error: 'Kling API Response Error',
          details: responseData.message || 'Unknown error from Kling API',
          code: responseData.code,
          kling_request_id: responseData.request_id,
          full_response: responseData,
          step: 'api_business_logic_error'
        }, { status: 200 });
      }

      console.log('✅ Kling Test Success:', responseData.data?.task_id);

      return NextResponse.json({
        success: true,
        message: 'Test successful!',
        data: {
          task_id: responseData.data.task_id,
          task_status: responseData.data.task_status,
          created_at: responseData.data.created_at
        },
        step: 'success'
      });

    } catch (apiError) {
      console.error('❌ Kling API Request Error:', apiError);
      
      let errorDetails = 'Unknown API error';
      let suggestions = ['Check API endpoint URL', 'Verify request format'];
      
      if (apiError instanceof Error) {
        errorDetails = apiError.message;
        
        if (apiError.message.includes('fetch failed')) {
          suggestions = [
            'Network connectivity issue',
            'Check if api.kuaishou.com is accessible',
            'Verify firewall/proxy settings',
            'Try from a different network',
            'Check if your IP is blocked by Kling'
          ];
        } else if (apiError.message.includes('timeout')) {
          suggestions = [
            'Request timed out',
            'Kling API might be slow or down',
            'Try again in a few minutes',
            'Check Kling API status'
          ];
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'API Request Failed',
        details: errorDetails,
        step: 'api_request_error',
        target_url: apiUrl,
        suggestions: suggestions,
        error_type: apiError?.constructor?.name || 'Unknown'
      }, { status: 200 });
    }

  } catch (error) {
    console.error('❌ Test Kling Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      step: 'general_error'
    }, { status: 200 });
  }
}