// app/(dashboard)/dashboard/kling/test/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function KlingTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [connectivityResult, setConnectivityResult] = useState<any>(null);
  const [prompt, setPrompt] = useState('A beautiful sunset over mountains');

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
      <div key={key} className={`p-3 rounded border ${
        isPass ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{isPass ? '✅' : '❌'}</span>
          <span className="font-semibold text-white">{test.name}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            isPass ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
        <h1 className="text-3xl font-bold text-white mb-8">
          🧪 Kling API Diagnostic Suite
        </h1>

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
                    onClick={testKlingAPI}
                    disabled={loading}
                    className="bg-[#8C1AD9] hover:bg-[#7B16C2]"
                  >
                    {loading ? '⏳ Testing...' : '🚀 Test Kling API'}
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
                    <h3 className="font-semibold text-white mb-2">Environment:</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• <strong>Network:</strong> {typeof window !== 'undefined' ? 'Browser' : 'Server'}</li>
                      <li>• <strong>Platform:</strong> {typeof navigator !== 'undefined' ? navigator.platform : 'Server'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-2">Common Issues:</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Corporate firewall</li>
                      <li>• VPN/Proxy blocking</li>
                      <li>• DNS resolution</li>
                      <li>• SSL certificate</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-yellow-500/20 pt-3">
                  <h3 className="font-semibold text-white mb-2">Troubleshooting Steps:</h3>
                  <ol className="text-gray-300 space-y-1 ml-4">
                    <li>1. Run connectivity test first</li>
                    <li>2. Check environment variables</li>
                    <li>3. Verify network access to api.kuaishou.com</li>
                    <li>4. Test from different network if needed</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Connectivity Test Results */}
            {connectivityResult && (
              <div className="bg-zinc-900 rounded-lg p-6 border border-blue-500/30">
                <h2 className="text-xl font-semibold text-blue-400 mb-4">
                  🌐 Connectivity Test Results
                </h2>
                
                <div className={`p-4 rounded-lg border mb-4 ${
                  connectivityResult.success 
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
                
                <div className={`p-4 rounded-lg border ${
                  result.success 
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