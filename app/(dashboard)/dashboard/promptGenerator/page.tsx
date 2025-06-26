// app/(dashboard)/dashboard/promptGenerator/page.tsx - ACTUALIZADO
'use client';

import UnifiedPromptGeneratorUI from '@/components/ui/UnifiedPromptGenerator/UnifiedPromptGeneratorUI';

export default function PromptGenerator() {
  return (
    <section
      style={{
        background: 'linear-gradient(120deg, #060826 0%, #1C228C 50%, #2C2A59 100%)',
        minHeight: '100vh',
        padding: '48px 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-extrabold mb-6"
            style={{
              background: 'linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px #8C1AD9',
              letterSpacing: '0.02em',
            }}
          >
            🚀 Unified AI Prompt Studio
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Advanced multi-agent system for generating optimized prompts for both{' '}
            <span className="text-[#8C1AD9] font-semibold">image generation (Flux)</span> and{' '}
            <span className="text-[#8C1AD9] font-semibold">video generation (Kling)</span>
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#8C1AD9]/30">
              <div className="text-3xl mb-3">🖼️</div>
              <h3 className="text-lg font-semibold text-[#8C1AD9] mb-2">Image Generation</h3>
              <p className="text-gray-400 text-sm">
                Flux-optimized prompts with specialized agents for Flux Pro, Dev, and Schnell models
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#8C1AD9]/30">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="text-lg font-semibold text-[#8C1AD9] mb-2">Video Generation</h3>
              <p className="text-gray-400 text-sm">
                Kling-optimized prompts with motion, cinematography, and narrative specialists
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#8C1AD9]/30">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-[#8C1AD9] mb-2">Platform Optimization</h3>
              <p className="text-gray-400 text-sm">
                Tailored for Instagram, TikTok, YouTube, Twitter, and LinkedIn engagement
              </p>
            </div>
          </div>
        </div>

        <UnifiedPromptGeneratorUI />

        {/* Technical details */}
        <div className="mt-16 bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#8C1AD9]/20">
          <h2 className="text-2xl font-bold text-[#8C1AD9] mb-6 text-center">
            🤖 Multi-Agent Architecture
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Generation Pipeline */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🖼️ Image Generation Pipeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#8C1AD9] rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Context Analyzer:</strong> Extracts visual metadata</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#8C1AD9] rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Visual Generator:</strong> Creates base image prompt</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#8C1AD9] rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Flux Specialist:</strong> Optimizes for Flux models</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#8C1AD9] rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Platform Optimizer:</strong> Social media optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#8C1AD9] rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Coordinator:</strong> Final synthesis and optimization</span>
                </div>
              </div>
            </div>

            {/* Video Generation Pipeline */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🎬 Video Generation Pipeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Video Context Analyzer:</strong> Extracts motion metadata</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Visual Generator:</strong> Creates base visual prompt</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Motion Agent:</strong> Adds cinematography and movement</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Kling Specialist:</strong> Optimizes for Kling models</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Video Platform Optimizer:</strong> Video platform optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm"><strong>Video Coordinator:</strong> Final video prompt synthesis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Models */}
          <div className="mt-8 pt-8 border-t border-[#8C1AD9]/20">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">🎯 Supported Models</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <h4 className="text-[#8C1AD9] font-semibold mb-2">🖼️ Flux Models</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>• Flux Pro - Maximum quality</div>
                  <div>• Flux Dev - Balanced performance</div>
                  <div>• Flux Schnell - Ultra-fast generation</div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-green-400 font-semibold mb-2">🎬 Kling Models</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>• Kling 1.0 - Basic video (5s)</div>
                  <div>• Kling 1.5 - Motion Brush (5-10s)</div>
                  <div>• Kling 1.6 - Elements feature (10s)</div>
                  <div>• Kling 2.0 - Extended duration (2-3 min)</div>
                  <div>• Kling 2.1 - Latest tiered system (3 min)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
