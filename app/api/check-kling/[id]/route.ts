// app/api/check-kling/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKlingAuthHeader } from '@/lib/klingJwtUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required'
      }, { status: 400 });
    }

    console.log('🔍 Checking Kling task:', taskId);

    // Generate JWT token for this request
    const authHeader = getKlingAuthHeader();

    // Make request to Kling API
    const response = await fetch(`https://api-singapore.klingai.com/v1/videos/text2video/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Kling Check API Error:', responseData);
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
        break;
      case 'processing':
        progress = 0.5;
        break;
      case 'succeed':
        progress = 1.0;
        completed = true;
        break;
      case 'failed':
        failed = true;
        break;
    }

    console.log(`📊 Kling Task ${taskId} Status: ${status} (${Math.round(progress * 100)}%)`);

    // Extract video data if completed
    let videoData = null;
    if (completed && data.task_result?.videos?.length > 0) {
      const video = data.task_result.videos[0]; // Get first video
      videoData = {
        id: video.id,
        url: video.url,
        duration: video.duration
      };
      console.log('🎬 Video ready:', video.url);
    }

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('❌ Check Kling Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}