// app/api/check-kling/[id]/route.ts - Con autenticación JWT corregida
import { NextRequest, NextResponse } from 'next/server';
import { getKlingAuthHeader } from '@/lib/klingJwtUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required'
      }, { status: 400 });
    }

    console.log('🔍 Checking Kling task status:', taskId);

    // Generate JWT token for this request (usando la implementación corregida)
    let authHeader;
    try {
      authHeader = getKlingAuthHeader();
      console.log('✅ Successfully generated JWT token for task check');
    } catch (authError) {
      console.error('❌ Failed to generate JWT token:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication Error',
        details: 'Failed to generate authentication token. Check your KLING_ACCESS_KEY and KLING_SECRET_KEY environment variables.'
      }, { status: 500 });
    }

    // Make request to Kling API
    const response = await fetch(`https://api-singapore.klingai.com/v1/videos/text2video/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });

    const responseData = await response.json();

    console.log('📥 Kling Check Response Status:', response.status);
    console.log('📥 Kling Check Response Data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('❌ Kling Check API Error:', responseData);

      // Check if it's an authentication error
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'Authentication Failed',
          details: 'Invalid API credentials. Please check your KLING_ACCESS_KEY and KLING_SECRET_KEY.',
          code: responseData.code
        }, { status: 401 });
      }

      // Check if task not found
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Task Not Found',
          details: `Task ${taskId} not found. It may have been deleted or expired.`,
          code: responseData.code
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Kling API Error',
        details: responseData.message || 'Unknown error from Kling API',
        code: responseData.code
      }, { status: response.status });
    }

    if (responseData.code !== 0) {
      console.error('❌ Kling Check Response Error:', responseData);
      return NextResponse.json({
        success: false,
        error: 'Kling API Response Error',
        details: responseData.message || 'Unknown error from Kling API',
        code: responseData.code
      }, { status: 400 });
    }

    const data = responseData.data;
    const status = data.task_status;

    // Map Kling status to our standard format
    let progress = 0;
    let completed = false;
    let failed = false;

    switch (status) {
      case 'submitted':
        progress = 0.1;
        console.log(`📝 Task ${taskId} submitted and queued`);
        break;
      case 'processing':
        progress = 0.5;
        console.log(`⚙️ Task ${taskId} is being processed`);
        break;
      case 'succeed':
        progress = 1.0;
        completed = true;
        console.log(`✅ Task ${taskId} completed successfully`);
        break;
      case 'failed':
        failed = true;
        console.log(`❌ Task ${taskId} failed: ${data.task_status_msg || 'Unknown reason'}`);
        break;
      default:
        console.log(`⚠️ Task ${taskId} has unknown status: ${status}`);
        break;
    }

    console.log(`📊 Task ${taskId} Status: ${status} (${Math.round(progress * 100)}%)`);

    // Extract video data if completed
    let videoData = null;
    if (completed && data.task_result?.videos?.length > 0) {
      const video = data.task_result.videos[0]; // Get first video
      videoData = {
        id: video.id,
        url: video.url,
        duration: video.duration
      };
      console.log('🎬 Video ready for download:', video.url);
      console.log(`🎬 Video details - ID: ${video.id}, Duration: ${video.duration}s`);
    }

    const result = {
      success: true,
      task_id: data.task_id,
      status: status,
      status_message: data.task_status_msg,
      progress: progress,
      completed: completed,
      failed: failed,
      created_at: data.created_at,
      updated_at: data.updated_at,
      external_task_id: data.task_info?.external_task_id,
      videoData: videoData
    };

    console.log(`✅ Successfully retrieved task ${taskId} status:`, {
      status,
      progress: Math.round(progress * 100) + '%',
      completed,
      failed,
      hasVideo: !!videoData
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Check Kling Error:', error);

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