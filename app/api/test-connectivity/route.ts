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

  // Test 2: DNS resolution for Kling Singapore
  try {
    console.log('🔍 Testing DNS resolution for api-singapore.klingai.com...');
    const response = await fetch('https://api-singapore.klingai.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });

    results.tests.dns = {
      name: 'DNS Resolution (api-singapore.klingai.com)',
      status: 'PASS',
      details: `DNS resolved, Status: ${response.status}`,
      url: 'https://api-singapore.klingai.com'
    };
  } catch (error) {
    results.tests.dns = {
      name: 'DNS Resolution (api-singapore.klingai.com)',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://api-singapore.klingai.com'
    };
  }

  // Test 3: SSL/TLS verification for Kling Singapore
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

  // Test 4: Environment variables (updated for correct Kling format)
  results.tests.environment = {
    name: 'Environment Variables',
    status: (process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY) ? 'PASS' : 'FAIL',
    details: {
      KLING_ACCESS_KEY: process.env.KLING_ACCESS_KEY ? 'Set' : 'Missing',
      KLING_SECRET_KEY: process.env.KLING_SECRET_KEY ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      note: 'Kling uses Access Key + Secret Key (not JWT_SECRET)'
    }
  };

  // Test 5: JWT Generation (without API call) - Updated for Kling format
  try {
    const { generateKlingJWT } = await import('@/lib/klingJwtUtils');
    const token = generateKlingJWT();

    results.tests.jwt = {
      name: 'JWT Generation (Kling Format)',
      status: 'PASS',
      details: `Token generated successfully (${token.length} chars)`,
      token_preview: token.substring(0, 50) + '...',
      format: 'Uses iss (access key), exp, nbf - matches Python implementation'
    };
  } catch (error) {
    results.tests.jwt = {
      name: 'JWT Generation (Kling Format)',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure KLING_ACCESS_KEY and KLING_SECRET_KEY are set'
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