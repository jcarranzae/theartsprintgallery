// app/api/test-kling-simple/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKlingAuthHeader } from '@/lib/klingJwtUtils';

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Testing Kling API with correct JWT format...');

        // Generate JWT token using the Python-matching format
        let authHeader;
        try {
            authHeader = getKlingAuthHeader();
            console.log('✅ JWT Generated successfully with Python format');
        } catch (jwtError) {
            console.error('❌ JWT Generation failed:', jwtError);
            return NextResponse.json({
                success: false,
                error: 'JWT Generation Failed',
                details: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error',
                solution: 'Make sure KLING_ACCESS_KEY and KLING_SECRET_KEY are set in your .env.local'
            });
        }

        // Simple test payload
        const payload = {
            model_name: "kling-v2-master",
            prompt: "A beautiful sunset over mountains",
            duration: "5",
            aspect_ratio: "16:9",
            mode: "std"
        };

        console.log('📦 Sending payload:', payload);

        // Make request to Kling Singapore API
        const response = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeader
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000)
        });

        const responseData = await response.json();

        console.log('📥 Kling Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            data: responseData
        });

        if (response.ok && responseData.code === 0) {
            return NextResponse.json({
                success: true,
                message: '🎉 Kling API working correctly!',
                data: {
                    task_id: responseData.data?.task_id,
                    task_status: responseData.data?.task_status,
                    created_at: responseData.data?.created_at
                },
                response_info: {
                    status: response.status,
                    code: responseData.code
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Kling API Error',
                status: response.status,
                statusText: response.statusText,
                code: responseData.code,
                message: responseData.message,
                request_id: responseData.request_id,
                solution: responseData.code === 1200
                    ? 'Check your access key and secret key configuration'
                    : responseData.code === 1001
                        ? 'Authentication failed - verify your credentials'
                        : 'Check Kling API documentation for error code ' + responseData.code
            });
        }

    } catch (error) {
        console.error('❌ Test error:', error);
        return NextResponse.json({
            success: false,
            error: 'Network or Server Error',
            details: error instanceof Error ? error.message : 'Unknown error',
            solution: error instanceof Error && error.message.includes('fetch failed')
                ? 'Network connectivity issue - check firewall/VPN'
                : 'Check server logs for more details'
        });
    }
}