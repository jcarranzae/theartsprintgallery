import React, { useState } from 'react';

// Types definitions inline
type Platform = 'instagram' | 'youtube_thumbnail' | 'tiktok' | 'twitter' | 'linkedin';
type FluxModel = 'flux-pro' | 'flux-dev' | 'flux-schnell';

interface ContextData {
  tipo_contenido: string;
  industria: string;
  objetivo: string;
  audiencia: string;
  estilo_visual: string;
  contexto_temporal: string;
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
      description: 'Máxima calidad y adherencia al prompt' 
    },
    { 
      value: 'flux-dev', 
      label: 'FLUX.1 Dev', 
      description: 'Balance perfecto entre calidad y velocidad' 
    },
    { 
      value: 'flux-schnell', 
      label: 'FLUX.1 Schnell', 
      description: 'Generación ultrarrápida para iteración' 
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            ⚡ Sistema de Agentes para Prompts Flux
          </h1>
          <p className="text-indigo-100">
            Genera prompts optimizados para modelos Flux de Black Forest Labs usando agentes especializados
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'single', label: '🎯 Prompt Único', icon: '🎯' },
              { id: 'variations', label: '🔄 Variaciones', icon: '🔄' },
              { id: 'optimize', label: '⚡ Optimizar', icon: '⚡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Configuration Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Plataforma de Destino
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {platforms.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🤖 Modelo Flux
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value as FluxModel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✍️ Describe la imagen que quieres generar
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ejemplo: Una mujer joven haciendo yoga en la playa al amanecer con colores cálidos..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              
              <button
                onClick={generateSinglePrompt}
                disabled={isLoading || !userInput.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                {isLoading ? '🔄 Generando prompt Flux...' : '⚡ Generar Prompt Optimizado para Flux'}
              </button>

              {result && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      ✨ Prompt Generado
                    </h3>
                    <button
                      onClick={() => copyToClipboard(result.final_prompt)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200 transition-colors"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <p className="text-gray-800 leading-relaxed">{result.final_prompt}</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-purple-600 font-semibold">⏱️ Tiempo</div>
                      <div className="text-gray-600">{result.metadata.processing_time}ms</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-blue-600 font-semibold">🤖 Agentes</div>
                      <div className="text-gray-600">{result.metadata.agents_used.length}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-green-600 font-semibold">📊 Confianza</div>
                      <div className="text-gray-600">{Math.round(result.metadata.confidence_score * 100)}%</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-orange-600 font-semibold">🎯 Plataforma</div>
                      <div className="text-gray-600 capitalize">{platform}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-indigo-600 font-semibold">⚡ Flux</div>
                      <div className="text-gray-600">{result.metadata.flux_model}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'variations' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✍️ Describe la imagen base para variaciones
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe la imagen base y el sistema generará 3 variaciones diferentes..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              
              <button
                onClick={generateVariations}
                disabled={isLoading || !userInput.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-teal-700 transition-all duration-200"
              >
                {isLoading ? '🔄 Generando variaciones...' : '🎨 Generar 3 Variaciones'}
              </button>

              {variations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    🎨 Variaciones Generadas
                  </h3>
                  {variations.map((variation, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700">
                          Variación {index + 1}
                        </h4>
                        <button
                          onClick={() => copyToClipboard(variation.final_prompt)}
                          className="px-3 py-1 bg-teal-100 text-teal-700 rounded-md text-sm hover:bg-teal-200 transition-colors"
                        >
                          📋 Copiar
                        </button>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-800 text-sm leading-relaxed">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Prompt existente para optimizar
                </label>
                <textarea
                  value={existingPrompt}
                  onChange={(e) => setExistingPrompt(e.target.value)}
                  placeholder="Pega aquí tu prompt existente y lo optimizaremos para la plataforma seleccionada..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              
              <button
                onClick={optimizePrompt}
                disabled={isLoading || !existingPrompt.trim()}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-700 hover:to-red-700 transition-all duration-200"
              >
                {isLoading ? '🔄 Optimizando...' : '⚡ Optimizar Prompt'}
              </button>

              {optimizedPrompt && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        📝 Prompt Original
                      </h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-600 leading-relaxed">{existingPrompt}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        ⚡ Prompt Optimizado
                      </h3>
                      <button
                        onClick={() => copyToClipboard(optimizedPrompt)}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm hover:bg-orange-200 transition-colors"
                      >
                        📋 Copiar
                      </button>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <p className="text-gray-800 leading-relaxed">{optimizedPrompt}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptGeneratorUI;