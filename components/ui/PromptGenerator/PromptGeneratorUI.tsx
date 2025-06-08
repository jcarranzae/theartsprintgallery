import React, { useState } from 'react';

// Types definitions inline
type Platform = 'instagram' | 'youtube_thumbnail' | 'tiktok' | 'twitter' | 'linkedin';
type FluxModel = 'flux-pro' | 'flux-dev' | 'flux-schnell';

interface ContextData {
  content_type: string;
  industry: string;
  objective: string;
  audience: string;
  visual_style: string;
  temporal_context: string;
  trending_topics: string[];
}

interface AgentResponse {
  agent_name: string;
  content: string;
  confidence: number;
  processing_time: number;
}

interface PromptGenerationResult {
  final_prompt: string;
  metadata: {
    context_data: ContextData;
    processing_time: number;
    agents_used: string[];
    confidence_score: number;
    flux_model: FluxModel;
    estimated_tokens: number;
  };
  agent_responses: AgentResponse[];
}

const PromptGeneratorUI: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [targetModel, setTargetModel] = useState<FluxModel>('flux-pro');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptGenerationResult | null>(null);
  const [variations, setVariations] = useState<PromptGenerationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'variations' | 'optimize'>('single');
  const [existingPrompt, setExistingPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  const platforms: { value: Platform; label: string }[] = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube_thumbnail', label: 'YouTube Thumbnail' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' }
  ];

  const models: { value: FluxModel; label: string; description: string }[] = [
    { 
      value: 'flux-pro', 
      label: 'FLUX.1 Pro', 
      description: 'Maximum quality and prompt adherence' 
    },
    { 
      value: 'flux-dev', 
      label: 'FLUX.1 Dev', 
      description: 'Perfect balance between quality and speed' 
    },
    { 
      value: 'flux-schnell', 
      label: 'FLUX.1 Schnell', 
      description: 'Ultra-fast generation for iteration' 
    }
  ];

  const generateSinglePrompt = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userInput,
          platform: platform,
          target_model: targetModel
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to generate prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVariations = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userInput,
          platform: platform,
          target_model: targetModel,
          count: 3
        })
      });

      const data = await response.json();
      if (data.success) {
        setVariations(data.data.variations);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to generate variations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const optimizePrompt = async () => {
    if (!existingPrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existing_prompt: existingPrompt,
          platform: platform,
          target_model: targetModel
        })
      });

      const data = await response.json();
      if (data.success) {
        setOptimizedPrompt(data.data.optimized_prompt);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
      }}
    >
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              ⚡ <span className="text-[#8C1AD9]">Flux Prompt</span> Agent System
            </h1>
            <p className="text-gray-300 text-lg">
              Generate optimized prompts for Flux models using specialized AI agents
            </p>
          </div>

          {/* Main Container */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.3)",
            }}
          >
            {/* Navigation Tabs */}
            <div className="border-b border-[#8C1AD9]/30">
              <nav className="flex">
                {[
                  { id: 'single', label: '🎯 Single Prompt', icon: '🎯' },
                  { id: 'variations', label: '🔄 Variations', icon: '🔄' },
                  { id: 'optimize', label: '⚡ Optimize', icon: '⚡' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-8 border-b-2 font-semibold text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'border-[#8C1AD9] text-[#8C1AD9] bg-[#8C1AD9]/10'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {/* Configuration Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                    🎯 Target Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full p-3 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all"
                  >
                    {platforms.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                    🤖 Flux Model
                  </label>
                  <select
                    value={targetModel}
                    onChange={(e) => setTargetModel(e.target.value as FluxModel)}
                    className="w-full p-3 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all"
                  >
                    {models.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} - {m.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'single' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                      ✍️ Describe the image you want to generate
                    </label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Example: A young woman doing yoga on the beach at sunrise with warm colors..."
                      rows={4}
                      className="w-full p-4 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={generateSinglePrompt}
                    disabled={isLoading || !userInput.trim()}
                    className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                    style={{
                      boxShadow: "0 0 16px 3px #8C1AD9",
                    }}
                  >
                    {isLoading ? '🔄 Generating Flux Prompt...' : '⚡ Generate Optimized Flux Prompt'}
                  </button>

                  {result && (
                    <div className="bg-zinc-800 rounded-lg p-6 border border-[#8C1AD9]/30">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-[#8C1AD9]">
                          ✨ Generated Prompt
                        </h3>
                        <button
                          onClick={() => copyToClipboard(result.final_prompt)}
                          className="px-4 py-2 bg-[#8C1AD9]/20 text-[#8C1AD9] rounded-md text-sm hover:bg-[#8C1AD9]/30 transition-colors border border-[#8C1AD9]/50"
                        >
                          📋 Copy
                        </button>
                      </div>
                      
                      <div className="bg-black p-4 rounded-lg border border-[#8C1AD9]/20 mb-4">
                        <p className="text-gray-100 leading-relaxed">{result.final_prompt}</p>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                          <div className="text-[#8C1AD9] font-semibold">⏱️ Time</div>
                          <div className="text-gray-300">{result.metadata.processing_time}ms</div>
                        </div>
                        <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                          <div className="text-[#8C1AD9] font-semibold">🤖 Agents</div>
                          <div className="text-gray-300">{result.metadata.agents_used.length}</div>
                        </div>
                        <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                          <div className="text-[#8C1AD9] font-semibold">📊 Confidence</div>
                          <div className="text-gray-300">{Math.round(result.metadata.confidence_score * 100)}%</div>
                        </div>
                        <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                          <div className="text-[#8C1AD9] font-semibold">🎯 Platform</div>
                          <div className="text-gray-300 capitalize">{platform}</div>
                        </div>
                        <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                          <div className="text-[#8C1AD9] font-semibold">⚡ Flux</div>
                          <div className="text-gray-300">{result.metadata.flux_model}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'variations' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                      ✍️ Describe the base image for variations
                    </label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Describe the base image and the system will generate 3 different variations..."
                      rows={4}
                      className="w-full p-4 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={generateVariations}
                    disabled={isLoading || !userInput.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                    style={{
                      boxShadow: "0 0 16px 3px rgba(34, 197, 94, 0.5)",
                    }}
                  >
                    {isLoading ? '🔄 Generating variations...' : '🎨 Generate 3 Variations'}
                  </button>

                  {variations.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-[#8C1AD9]">
                        🎨 Generated Variations
                      </h3>
                      {variations.map((variation, index) => (
                        <div key={index} className="bg-zinc-800 rounded-lg p-4 border border-[#8C1AD9]/30">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-200">
                              Variation {index + 1}
                            </h4>
                            <button
                              onClick={() => copyToClipboard(variation.final_prompt)}
                              className="px-3 py-1 bg-teal-600/20 text-teal-400 rounded-md text-sm hover:bg-teal-600/30 transition-colors border border-teal-400/50"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="bg-black p-3 rounded-lg border border-[#8C1AD9]/20">
                            <p className="text-gray-100 text-sm leading-relaxed">
                              {variation.final_prompt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'optimize' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                      📝 Existing prompt to optimize
                    </label>
                    <textarea
                      value={existingPrompt}
                      onChange={(e) => setExistingPrompt(e.target.value)}
                      placeholder="Paste your existing prompt here and we'll optimize it for the selected platform..."
                      rows={4}
                      className="w-full p-4 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={optimizePrompt}
                    disabled={isLoading || !existingPrompt.trim()}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                    style={{
                      boxShadow: "0 0 16px 3px rgba(251, 146, 60, 0.5)",
                    }}
                  >
                    {isLoading ? '🔄 Optimizing...' : '⚡ Optimize Prompt'}
                  </button>

                  {optimizedPrompt && (
                    <div className="space-y-4">
                      <div className="bg-zinc-800 rounded-lg p-6 border border-[#8C1AD9]/30">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-300">
                            📝 Original Prompt
                          </h3>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-600">
                          <p className="text-gray-400 leading-relaxed">{existingPrompt}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-400/30">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-orange-300">
                            ⚡ Optimized Prompt
                          </h3>
                          <button
                            onClick={() => copyToClipboard(optimizedPrompt)}
                            className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-md text-sm hover:bg-orange-600/30 transition-colors border border-orange-400/50"
                          >
                            📋 Copy
                          </button>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-orange-400/20">
                          <p className="text-gray-100 leading-relaxed">{optimizedPrompt}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGeneratorUI;