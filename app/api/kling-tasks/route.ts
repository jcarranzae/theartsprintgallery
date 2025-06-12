// app/api/kling-tasks/route.ts - Con autenticación JWT corregida
import { NextRequest, NextResponse } from 'next/server';
import { getKlingAuthHeader } from '@/lib/klingJwtUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNum = parseInt(searchParams.get('pageNum') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '30');

    // Validate pagination parameters
    if (pageNum < 1 || pageNum > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Invalid page number',
        details: 'Page number must be between 1 and 1000'
      }, { status: 400 });
    }

    if (pageSize < 1 || pageSize > 500) {
      return NextResponse.json({
        success: false,
        error: 'Invalid page size',
        details: 'Page size must be between 1 and 500'
      }, { status: 400 });
    }

    console.log(`📋 Fetching Kling tasks - Page: ${pageNum}, Size: ${pageSize}`);

    // Generate JWT token for this request (usando la implementación corregida)
    let authHeader;
    try {
      authHeader = getKlingAuthHeader();
      console.log('✅ Successfully generated JWT token for tasks list');
    } catch (authError) {
      console.error('❌ Failed to generate JWT token:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication Error',
        details: 'Failed to generate authentication token. Check your KLING_ACCESS_KEY and KLING_SECRET_KEY environment variables.'
      }, { status: 500 });
    }

    // Make request to Kling API
    const apiUrl = `https://api-singapore.klingai.com/v1/videos/text2video?pageNum=${pageNum}&pageSize=${pageSize}`;
    console.log('🌐 Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });

    const responseData = await response.json();

    console.log('📥 Kling Tasks Response Status:', response.status);
    console.log('📥 Kling Tasks Response Data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('❌ Kling Tasks API Error:', responseData);

      // Check if it's an authentication error
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'Authentication Failed',
          details: 'Invalid API credentials. Please check your KLING_ACCESS_KEY and KLING_SECRET_KEY.',
          code: responseData.code
        }, { status: 401 });
      }

      return NextResponse.json({
        success: false,
        error: 'Kling API Error',
        details: responseData.message || 'Unknown error from Kling API',
        code: responseData.code
      }, { status: response.status });
    }

    if (responseData.code !== 0) {
      console.error('❌ Kling Tasks Response Error:', responseData);
      return NextResponse.json({
        success: false,
        error: 'Kling API Response Error',
        details: responseData.message || 'Unknown error from Kling API',
        code: responseData.code
      }, { status: 400 });
    }

    // Process and format the tasks
    const rawTasks = responseData.data || [];
    console.log(`📋 Processing ${rawTasks.length} raw tasks from API`);

    const tasks = rawTasks.map((task: any) => {
      let progress = 0;
      let completed = false;
      let failed = false;

      switch (task.task_status) {
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

      // Extract video data if available
      let videoData = null;
      if (completed && task.task_result?.videos?.length > 0) {
        const video = task.task_result.videos[0];
        videoData = {
          id: video.id,
          url: video.url,
          duration: video.duration
        };
      }

      const processedTask = {
        task_id: task.task_id,
        status: task.task_status,
        status_message: task.task_status_msg,
        progress: progress,
        completed: completed,
        failed: failed,
        created_at: task.created_at,
        updated_at: task.updated_at,
        external_task_id: task.task_info?.external_task_id,
        videoData: videoData
      };

      console.log(`📝 Processed task ${task.task_id}: ${task.task_status} (${Math.round(progress * 100)}%)`);

      return processedTask;
    });

    interface Task {
      completed: boolean;
      failed: boolean;
    }

    const completedTasks = tasks.filter((t: Task) => t.completed).length;
    const processingTasks = tasks.filter((t: Task) => !t.completed && !t.failed).length;
    const failedTasks = tasks.filter((t: Task) => t.failed).length;

    console.log(`✅ Successfully retrieved ${tasks.length} Kling tasks:`, {
      completed: completedTasks,
      processing: processingTasks,
      failed: failedTasks,
      page: pageNum,
      pageSize: pageSize
    });

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        pageNum: pageNum,
        pageSize: pageSize,
        total: tasks.length
      },
      summary: {
        total: tasks.length,
        completed: completedTasks,
        processing: processingTasks,
        failed: failedTasks
      }
    });

  } catch (error) {
    console.error('❌ List Kling Tasks Error:', error);

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