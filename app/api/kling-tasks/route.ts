// app/api/kling-tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

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

        // Make request to Kling API
        const response = await fetch(`https://api.kuaishou.com/v1/videos/text2video?pageNum=${pageNum}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.KLING_API_KEY}`
            }
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('❌ Kling Tasks API Error:', responseData);
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
        const tasks = responseData.data.map((task: any) => {
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

            return {
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
        });

        console.log(`✅ Retrieved ${tasks.length} Kling tasks`);

        return NextResponse.json({
            success: true,
            data: tasks,
            pagination: {
                pageNum: pageNum,
                pageSize: pageSize,
                total: tasks.length
            }
        });

    } catch (error) {
        console.error('❌ List Kling Tasks Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}