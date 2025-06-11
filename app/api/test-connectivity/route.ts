// app/api/test-connectivity/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as any,
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Test 1: Basic internet connectivity
  try {
    console.log('🌐 Testing basic internet connectivity...');
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    results.tests.internet = {
      name: 'Internet Connectivity',
      status: response.ok ? 'PASS' : 'FAIL',
      details: `Status: ${response.status} ${response.statusText}`,
      url: 'https://httpbin.org/get'
    };
  } catch (error) {
    results.tests.internet = {
      name: 'Internet Connectivity',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://httpbin.org/get'
    };
  }

  // Test 2: DNS resolution for Kuaishou
  try {
    console.log('🔍 Testing DNS resolution for api.kuaishou.com...');
    const response = await fetch('https://api-singapore.klingai.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });
    
    results.tests.dns = {
      name: 'DNS Resolution (api.kuaishou.com)',
      status: 'PASS',
      details: `DNS resolved, Status: ${response.status}`,
      url: 'https://api-singapore.klingai.com'
    };
  } catch (error) {
    results.tests.dns = {
      name: 'DNS Resolution (api.kuaishou.com)',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://api-singapore.klingai.com'
    };
  }

  // Test 3: SSL/TLS verification
  try {
    console.log('🔒 Testing SSL/TLS connection...');
    const response = await fetch('https://api-singapore.klingai.com/v1', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });
    
    results.tests.ssl = {
      name: 'SSL/TLS Connection',
      status: 'PASS',
      details: `SSL connection established, Status: ${response.status}`,
      url: 'https://api-singapore.klingai.com/v1'
    };
  } catch (error) {
    results.tests.ssl = {
      name: 'SSL/TLS Connection',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://api-singapore.klingai.com/v1'
    };
  }

  // Test 4: Environment variables
  results.tests.environment = {
    name: 'Environment Variables',
    status: process.env.KLING_JWT_SECRET ? 'PASS' : 'FAIL',
    details: {
      KLING_JWT_SECRET: process.env.KLING_JWT_SECRET ? 'Set' : 'Missing',
      KLING_ISSUER: process.env.KLING_ISSUER || 'Using default',
      KLING_SUBJECT: process.env.KLING_SUBJECT || 'Using default',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    }
  };

  // Test 5: JWT Generation (without API call)
  try {
    const { generateKlingJWT } = await import('@/lib/klingJwtUtils');
    const token = generateKlingJWT();
    
    results.tests.jwt = {
      name: 'JWT Generation',
      status: 'PASS',
      details: `Token generated successfully (${token.length} chars)`,
      token_preview: token.substring(0, 50) + '...'
    };
  } catch (error) {
    results.tests.jwt = {
      name: 'JWT Generation',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Calculate summary
  results.summary.total = Object.keys(results.tests).length;
  results.summary.passed = Object.values(results.tests).filter((test: any) => test.status === 'PASS').length;
  results.summary.failed = results.summary.total - results.summary.passed;

  console.log('📊 Connectivity test results:', results.summary);

  return NextResponse.json({
    success: results.summary.failed === 0,
    message: `${results.summary.passed}/${results.summary.total} tests passed`,
    ...results
  });
}