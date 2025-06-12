// app/api/debug-kling-jwt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateKlingJWT } from '@/lib/klingJwtUtils';

export async function POST(request: NextRequest) {
    try {
        const { testConfig } = await request.json();

        const results = {
            timestamp: new Date().toISOString(),
            tests: [],
            jwt_analysis: {},
            recommendations: []
        } as any;

        // Test 1: Current JWT configuration
        try {
            const currentToken = generateKlingJWT();
            const payload = JSON.parse(
                Buffer.from(currentToken.split('.')[1] + '===', 'base64url').toString()
            );

            results.jwt_analysis.current = {
                token_preview: currentToken.substring(0, 50) + '...',
                payload: payload,
                length: currentToken.length,
                parts: currentToken.split('.').length
            };

            // Test with minimal payload and current JWT
            const minimalPayload = {
                model_name: "kling-v2-master",
                prompt: "A simple test",
                duration: "5",
                aspect_ratio: "16:9"
            };

            console.log('🧪 Testing with current JWT configuration...');

            const response1 = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify(minimalPayload),
                signal: AbortSignal.timeout(15000)
            });

            const responseData1 = await response1.json();

            results.tests.push({
                name: 'Current JWT Configuration',
                payload: minimalPayload,
                jwt_payload: payload,
                response: {
                    status: response1.status,
                    ok: response1.ok,
                    data: responseData1
                },
                success: response1.ok && responseData1.code === 0
            });

        } catch (error) {
            results.tests.push({
                name: 'Current JWT Configuration',
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        }

        // Test 2: Different JWT audience
        try {
            console.log('🧪 Testing with singapore endpoint as audience...');

            // Temporarily override environment for this test
            const originalAud = process.env.KLING_AUDIENCE;
            process.env.KLING_AUDIENCE = 'https://api-singapore.klingai.com';

            const singaporeToken = generateKlingJWT();
            const singaporePayload = JSON.parse(
                Buffer.from(singaporeToken.split('.')[1] + '===', 'base64url').toString()
            );

            const response2 = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${singaporeToken}`
                },
                body: JSON.stringify({
                    model_name: "kling-v2-master",
                    prompt: "Singapore endpoint test",
                    duration: "5",
                    aspect_ratio: "16:9"
                }),
                signal: AbortSignal.timeout(15000)
            });

            const responseData2 = await response2.json();

            // Restore original value
            if (originalAud) {
                process.env.KLING_AUDIENCE = originalAud;
            } else {
                delete process.env.KLING_AUDIENCE;
            }

            results.tests.push({
                name: 'Singapore Endpoint as Audience',
                jwt_payload: singaporePayload,
                response: {
                    status: response2.status,
                    ok: response2.ok,
                    data: responseData2
                },
                success: response2.ok && responseData2.code === 0
            });

        } catch (error) {
            results.tests.push({
                name: 'Singapore Endpoint as Audience',
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        }

        // Test 3: Different model versions
        const modelsToTest = ['kling-v1', 'kling-v1-6', 'kling-v2-master'];

        for (const model of modelsToTest) {
            try {
                console.log(`🧪 Testing with model: ${model}...`);

                const token = generateKlingJWT();
                const testPayload = {
                    model_name: model,
                    prompt: `Test with ${model}`,
                    duration: "5",
                    aspect_ratio: "16:9",
                    mode: "std"
                };

                const response = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(testPayload),
                    signal: AbortSignal.timeout(15000)
                });

                const responseData = await response.json();

                results.tests.push({
                    name: `Model Test: ${model}`,
                    payload: testPayload,
                    response: {
                        status: response.status,
                        ok: response.ok,
                        data: responseData
                    },
                    success: response.ok && responseData.code === 0
                });

                // If this one works, we found something!
                if (response.ok && responseData.code === 0) {
                    results.recommendations.push(`✅ Model ${model} works! Try using this model.`);
                    break; // Don't test more if we found one that works
                }

            } catch (error) {
                results.tests.push({
                    name: `Model Test: ${model}`,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    success: false
                });
            }
        }

        // Test 4: Headers analysis
        try {
            console.log('🧪 Testing headers and response analysis...');

            const token = generateKlingJWT();
            const response = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Kling-Client/1.0',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model_name: "kling-v2-master",
                    prompt: "Header test",
                    duration: "5",
                    aspect_ratio: "16:9"
                }),
                signal: AbortSignal.timeout(15000)
            });

            const responseData = await response.json();

            results.tests.push({
                name: 'Headers Analysis',
                request_headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer [TOKEN]',
                    'User-Agent': 'Kling-Client/1.0',
                    'Accept': 'application/json'
                },
                response_headers: {
                    'content-type': response.headers.get('content-type'),
                    'server': response.headers.get('server'),
                    'date': response.headers.get('date'),
                    'x-request-id': response.headers.get('x-request-id')
                },
                response: {
                    status: response.status,
                    ok: response.ok,
                    data: responseData
                },
                success: response.ok && responseData.code === 0
            });

        } catch (error) {
            results.tests.push({
                name: 'Headers Analysis',
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        }

        // Analyze results and provide recommendations
        const successfulTests = results.tests.filter((test: any) => test.success);
        const failedTests = results.tests.filter((test: any) => !test.success);

        if (successfulTests.length === 0) {
            results.recommendations.push('❌ All tests failed. Issue is likely with JWT claims or account configuration.');
            results.recommendations.push('💡 Check if your KLING_JWT_SECRET is correct');
            results.recommendations.push('💡 Verify your Kling account is active and has API access');
            results.recommendations.push('💡 Contact Kling support with request_id from any response');
        } else {
            results.recommendations.push(`✅ ${successfulTests.length}/${results.tests.length} tests passed!`);
            successfulTests.forEach((test: any) => {
                results.recommendations.push(`✅ ${test.name} worked - use this configuration`);
            });
        }

        // Common error code analysis
        const errorCodes = failedTests
            .map((test: any) => test.response?.data?.code)
            .filter((code: number | undefined) => code);

        if (errorCodes.includes(1200)) {
            results.recommendations.push('🔍 Error 1200: Usually authentication or parameter format issue');
            results.recommendations.push('💡 Try: Different issuer/subject values, verify JWT secret');
        }
        if (errorCodes.includes(1001)) {
            results.recommendations.push('🔍 Error 1001: Authentication failed - check JWT secret and claims');
        }

        return NextResponse.json({
            success: successfulTests.length > 0,
            summary: `${successfulTests.length}/${results.tests.length} tests passed`,
            ...results
        });

    } catch (error) {
        console.error('❌ Debug JWT Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Debug Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 200 });
    }
}