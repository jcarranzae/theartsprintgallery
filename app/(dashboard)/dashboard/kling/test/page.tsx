// app/(dashboard)/dashboard/kling/test/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function KlingTestPage() {
  const [loading, setLoading] = useState(false);
  const [jwtDebugResult, setJwtDebugResult] = useState<any>(null);
  const [connectivityResult, setConnectivityResult] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [prompt, setPrompt] = useState('');

  const testJWTDebug = async () => {
    setLoading(true);
    setJwtDebugResult(null);

    try {
      const response = await fetch('/api/debug-kling-jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testConfig: 'comprehensive' })
      });

      const data = await response.json();
      setJwtDebugResult(data);
    } catch (error) {
      setJwtDebugResult({
        success: false,
        error: 'Network Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const testConnectivity = async () => {
    setLoading(true);
    setConnectivityResult(null);

    try {
      const response = await fetch('/api/test-connectivity');
      const data = await response.json();
      setConnectivityResult(data);
    } catch (error) {
      setConnectivityResult({
        success: false,
        error: 'Network Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const testKlingSimple = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-kling-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const testKlingAPI = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-kling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setLoading(false);
  };

  const renderConnectivityTest = (test: any, key: string) => {
    const isPass = test.status === 'PASS';
    return (
      <div key={key} className={`p-3 rounded border ${isPass ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'
        }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{isPass ? '✅' : '❌'}</span>
          <span className="font-semibold text-white">{test.name}</span>
          <span className={`text-xs px-2 py-1 rounded ${isPass ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {test.status}
          </span>
        </div>
        <div className="text-sm text-gray-300">
          {typeof test.details === 'object' ? (
            <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
              {JSON.stringify(test.details, null, 2)}
            </pre>
          ) : (
            <p>{test.details}</p>
          )}
        </div>
        {test.url && (
          <p className="text-xs text-gray-400 mt-1">Target: {test.url}</p>
        )}
        {test.token_preview && (
          <p className="text-xs text-blue-300 mt-1">Token: {test.token_preview}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8"
      style={{
        background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          🧪 Kling API Diagnostic Suite
        </h1>

        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <h2 className="text-xl font-semibold text-green-300">JWT Format Fixed!</h2>
          </div>
          <p className="text-green-200 text-sm">
            Updated to match Python implementation: Uses <strong>Access Key + Secret Key</strong> instead of custom JWT claims.
            Try <strong>"Test Kling (Python Format)"</strong> - it should work now!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Tests */}
          <div className="space-y-6">
            {/* Test Configuration */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-[#8C1AD9]/30">
              <h2 className="text-xl font-semibold text-[#8C1AD9] mb-4">🔧 Test Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Test Prompt:</label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-600 focus:border-[#8C1AD9] outline-none"
                    placeholder="Enter test prompt..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={testConnectivity}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? '⏳ Testing...' : '🌐 Test Connectivity'}
                  </Button>

                  <Button
                    onClick={testKlingSimple}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? '⏳ Testing...' : '✅ Test Kling (Python Format)'}
                  </Button>

                  <Button
                    onClick={testJWTDebug}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? '⏳ Testing...' : '🔐 Debug JWT & Auth'}
                  </Button>

                  <Button
                    onClick={testKlingAPI}
                    disabled={loading}
                    className="bg-[#8C1AD9] hover:bg-[#7B16C2]"
                  >
                    {loading ? '⏳ Testing...' : '🚀 Test Kling API (Old)'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Diagnostics */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-yellow-500/30">
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">🔍 Quick Diagnostics</h2>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Required Variables:</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• <strong>KLING_ACCESS_KEY:</strong> Your access key (ak)</li>
                      <li>• <strong>KLING_SECRET_KEY:</strong> Your secret key (sk)</li>
                      <li>• <strong>Endpoint:</strong> api-singapore.klingai.com</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">JWT Format:</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• <strong>iss:</strong> Access Key</li>
                      <li>• <strong>exp:</strong> +30 minutes</li>
                      <li>• <strong>nbf:</strong> -5 seconds</li>
                      <li>• <strong>No:</strong> sub, aud, jti</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-yellow-500/20 pt-3">
                  <h3 className="font-semibold text-white mb-2">Updated Troubleshooting Steps:</h3>
                  <ol className="text-gray-300 space-y-1 ml-4">
                    <li>1. ✅ <strong>Test Kling (Python Format)</strong> - Should work now!</li>
                    <li>2. Check Access Key and Secret Key are correct</li>
                    <li>3. Run connectivity test if network issues</li>
                    <li>4. Use Debug JWT for detailed analysis</li>
                    <li>5. Old API test should still fail (wrong format)</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* JWT Debug Results */}
            {jwtDebugResult && (
              <div className="bg-zinc-900 rounded-lg p-6 border border-purple-500/30">
                <h2 className="text-xl font-semibold text-purple-400 mb-4">
                  🔐 JWT Debug Results
                </h2>

                <div className={`p-4 rounded-lg border mb-4 ${jwtDebugResult.success
                  ? 'bg-green-900/20 border-green-500/30 text-green-200'
                  : 'bg-red-900/20 border-red-500/30 text-red-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {jwtDebugResult.success ? '✅' : '❌'}
                    </span>
                    <span className="font-semibold">
                      {jwtDebugResult.summary || (jwtDebugResult.success ? 'SUCCESS' : 'FAILED')}
                    </span>
                  </div>
                </div>

                {jwtDebugResult.recommendations && (
                  <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h3 className="font-semibold text-blue-300 mb-2">💡 Recommendations:</h3>
                    <ul className="text-sm text-blue-200 space-y-1">
                      {jwtDebugResult.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {jwtDebugResult.jwt_analysis && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-purple-300 mb-2">🔍 JWT Analysis:</h3>
                    <div className="bg-black/30 p-3 rounded text-xs">
                      <pre>{JSON.stringify(jwtDebugResult.jwt_analysis, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {jwtDebugResult.tests && jwtDebugResult.tests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-purple-300">🧪 Individual Tests:</h3>
                    {jwtDebugResult.tests.map((test: any, index: number) => (
                      <div key={index} className={`p-3 rounded border ${test.success ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{test.success ? '✅' : '❌'}</span>
                          <span className="font-semibold text-white">{test.name}</span>
                        </div>

                        {test.response && (
                          <div className="text-sm text-gray-300 mb-2">
                            Status: {test.response.status} |
                            Code: {test.response.data?.code || 'N/A'} |
                            Message: {test.response.data?.message || 'N/A'}
                          </div>
                        )}

                        {test.error && (
                          <div className="text-sm text-red-300 mb-2">
                            Error: {test.error}
                          </div>
                        )}

                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-400">
                            Show Details
                          </summary>
                          <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto mt-1">
                            {JSON.stringify(test, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {connectivityResult && (
              <div className="bg-zinc-900 rounded-lg p-6 border border-blue-500/30">
                <h2 className="text-xl font-semibold text-blue-400 mb-4">
                  🌐 Connectivity Test Results
                </h2>

                <div className={`p-4 rounded-lg border mb-4 ${connectivityResult.success
                  ? 'bg-green-900/20 border-green-500/30 text-green-200'
                  : 'bg-red-900/20 border-red-500/30 text-red-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {connectivityResult.success ? '✅' : '❌'}
                    </span>
                    <span className="font-semibold">
                      {connectivityResult.message}
                    </span>
                  </div>

                  {connectivityResult.summary && (
                    <div className="text-sm">
                      Passed: {connectivityResult.summary.passed} |
                      Failed: {connectivityResult.summary.failed} |
                      Total: {connectivityResult.summary.total}
                    </div>
                  )}
                </div>

                {connectivityResult.tests && (
                  <div className="space-y-3">
                    {Object.entries(connectivityResult.tests).map(([key, test]) =>
                      renderConnectivityTest(test, key)
                    )}
                  </div>
                )}
              </div>
            )}

            {/* API Test Results */}
            {result && (
              <div className="bg-zinc-900 rounded-lg p-6 border border-[#8C1AD9]/30">
                <h2 className="text-xl font-semibold text-[#8C1AD9] mb-4">
                  🚀 Kling API Test Results
                </h2>

                <div className={`p-4 rounded-lg border ${result.success
                  ? 'bg-green-900/20 border-green-500/30 text-green-200'
                  : 'bg-red-900/20 border-red-500/30 text-red-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-semibold">
                      {result.success ? 'SUCCESS' : 'ERROR'}
                    </span>
                    {result.step && (
                      <span className="text-xs opacity-70">({result.step})</span>
                    )}
                  </div>

                  {result.suggestions && (
                    <div className="mb-3">
                      <p className="font-semibold mb-1">💡 Suggestions:</p>
                      <ul className="text-sm space-y-1">
                        {result.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold">
                      Show Full Response
                    </summary>
                    <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto mt-2">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}