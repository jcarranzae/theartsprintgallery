// app/flux-editor-simple/page.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useFluxContext, useImageUpload } from '@/hooks/useFluxContext';
import { FluxUtils, RESOLUTION_PRESETS, STYLE_PRESETS } from '@/types/flux-context';
import SimpleImageGallery from '@/components/ui/fluxContextEditor/SimpleImageGallery';
import {
    Upload, Download, Wand2, Settings, Image as ImageIcon,
    Loader2, Copy, RefreshCw, Monitor, Eye, EyeOff, Trash2
} from 'lucide-react';

export default function FluxEditorSimplePage() {
    const { state, actions, computed } = useFluxContext();
    const { uploadImage, isUploading, uploadProgress } = useImageUpload();
    const galleryRef = useRef<any>(null);

    // Registrar callback del historial cuando el componente se monta
    useEffect(() => {
        if (galleryRef.current?.addToHistory) {
            actions.registerHistoryCallback(galleryRef.current.addToHistory);
        }
    }, [actions]);

    // Manejar carga de archivos
    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        type: 'context' | 'mask'
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await uploadImage(file, (base64) => {
                if (type === 'context') {
                    actions.setContextImage(base64);
                } else {
                    actions.setMaskImage(base64);
                }
            });
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Error cargando imagen');
        }
    };

    // Aplicar preset de resolución
    const applyResolutionPreset = (preset: typeof RESOLUTION_PRESETS[0]) => {
        actions.updateParams({
            width: preset.width,
            height: preset.height
        });
    };

    // Aplicar preset de estilo
    const applyStylePreset = (preset: typeof STYLE_PRESETS[0]) => {
        const enhancedPrompt = state.prompt.includes(preset.prompt_suffix)
            ? state.prompt
            : `${state.prompt}${preset.prompt_suffix}`;

        actions.setPrompt(enhancedPrompt);
        actions.updateParams({
            guidance_scale: preset.guidance_scale,
            steps: preset.steps
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Wand2 className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Flux Context Editor</h1>
                                <p className="text-gray-400 text-sm">Crea y edita imágenes con IA</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                                <Monitor size={16} />
                                <span>Modelo: {computed.modelConfig.displayName}</span>
                            </div>
                            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                                <span>Tiempo estimado: {computed.estimatedTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Panel de Control */}
                    <div className="space-y-6">
                        {/* Selección de Modelo */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Wand2 className="mr-2" size={18} />
                                Modelo de IA
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => actions.setModel('flux-context-pro')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${state.selectedModel === 'flux-context-pro'
                                            ? 'border-blue-400 bg-blue-500/20 text-white'
                                            : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="font-semibold">Context Pro</div>
                                    <div className="text-sm opacity-80">Rápido y eficiente para uso diario</div>
                                    <div className="text-xs mt-1 opacity-60">~{computed.estimatedTime}</div>
                                </button>
                                <button
                                    onClick={() => actions.setModel('flux-context-max')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${state.selectedModel === 'flux-context-max'
                                            ? 'border-purple-400 bg-purple-500/20 text-white'
                                            : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="font-semibold">Context Max</div>
                                    <div className="text-sm opacity-80">Máxima calidad profesional</div>
                                    <div className="text-xs mt-1 opacity-60">~{computed.estimatedTime}</div>
                                </button>
                            </div>
                        </div>

                        {/* Prompt */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-white font-semibold">Descripción</label>
                                <button
                                    onClick={actions.copyPrompt}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Copiar prompt"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <textarea
                                value={state.prompt}
                                onChange={(e) => actions.setPrompt(e.target.value)}
                                placeholder="Describe la imagen que quieres crear o editar..."
                                className="w-full h-32 bg-gray-800/30 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
                            />
                            <div className="mt-2 text-xs text-gray-400">
                                {state.prompt.length}/1000 caracteres
                            </div>
                        </div>

                        {/* Presets de Estilo */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">Estilos Rápidos</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {STYLE_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyStylePreset(preset)}
                                        className="p-3 text-sm bg-gray-800/30 hover:bg-gray-700/50 border border-gray-600 rounded-lg text-white transition-all"
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resoluciones Predefinidas */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">Resolución</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {RESOLUTION_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyResolutionPreset(preset)}
                                        className={`p-3 text-sm border rounded-lg transition-all ${state.params.width === preset.width && state.params.height === preset.height
                                                ? 'border-blue-400 bg-blue-500/20 text-white'
                                                : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="font-medium">{preset.name}</div>
                                        <div className="text-xs opacity-70">{preset.aspectRatio}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white text-sm mb-2">Ancho</label>
                                    <input
                                        type="number"
                                        value={state.params.width}
                                        onChange={(e) => actions.updateParams({ width: parseInt(e.target.value) })}
                                        className="w-full bg-gray-800/30 border border-gray-600 rounded-lg p-2 text-white"
                                        min="512" max="2048" step="64"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white text-sm mb-2">Alto</label>
                                    <input
                                        type="number"
                                        value={state.params.height}
                                        onChange={(e) => actions.updateParams({ height: parseInt(e.target.value) })}
                                        className="w-full bg-gray-800/30 border border-gray-600 rounded-lg p-2 text-white"
                                        min="512" max="2048" step="64"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Imágenes de Referencia */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Upload className="mr-2" size={18} />
                                Imágenes de Referencia
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Imagen de Contexto
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'context')}
                                        disabled={isUploading}
                                        className="w-full bg-gray-800/30 border border-gray-600 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                                    />
                                    {state.images.context && (
                                        <div className="mt-2 relative">
                                            <img
                                                src={state.images.context}
                                                alt="Contexto"
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => actions.setContextImage(null)}
                                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Máscara de Edición
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'mask')}
                                        disabled={isUploading}
                                        className="w-full bg-gray-800/30 border border-gray-600 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50"
                                    />
                                    {state.images.mask && (
                                        <div className="mt-2 relative">
                                            <img
                                                src={state.images.mask}
                                                alt="Máscara"
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => actions.setMaskImage(null)}
                                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {(isUploading || uploadProgress > 0) && (
                                    <div className="bg-gray-800/30 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white text-sm">Subiendo imagen...</span>
                                            <span className="text-white text-sm">{Math.round(uploadProgress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Parámetros Avanzados */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <button
                                onClick={actions.toggleAdvanced}
                                className="flex items-center text-white font-semibold mb-4 hover:text-blue-400 transition-colors"
                            >
                                <Settings className="mr-2" size={18} />
                                Parámetros Avanzados
                                {state.showAdvanced ? <EyeOff className="ml-2" size={16} /> : <Eye className="ml-2" size={16} />}
                            </button>

                            {state.showAdvanced && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white text-sm mb-2">
                                            Pasos: {state.params.steps}
                                        </label>
                                        <input
                                            type="range"
                                            value={state.params.steps}
                                            onChange={(e) => actions.updateParams({ steps: parseInt(e.target.value) })}
                                            className="w-full accent-blue-500"
                                            min="10" max="50"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Rápido</span>
                                            <span>Calidad</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white text-sm mb-2">
                                            Guidance Scale: {state.params.guidance_scale}
                                        </label>
                                        <input
                                            type="range"
                                            value={state.params.guidance_scale}
                                            onChange={(e) => actions.updateParams({ guidance_scale: parseFloat(e.target.value) })}
                                            className="w-full accent-blue-500"
                                            min="1" max="20" step="0.5"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Creativo</span>
                                            <span>Preciso</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white text-sm mb-2">
                                            Fuerza: {state.params.strength}
                                        </label>
                                        <input
                                            type="range"
                                            value={state.params.strength}
                                            onChange={(e) => actions.updateParams({ strength: parseFloat(e.target.value) })}
                                            className="w-full accent-blue-500"
                                            min="0.1" max="1" step="0.1"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Sutil</span>
                                            <span>Intenso</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-white text-sm mb-2">Seed</label>
                                            <input
                                                type="number"
                                                value={state.params.seed}
                                                onChange={(e) => actions.updateParams({ seed: parseInt(e.target.value) })}
                                                className="w-full bg-gray-800/30 border border-gray-600 rounded-lg p-2 text-white"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => actions.updateParams({ seed: FluxUtils.generateRandomSeed() })}
                                                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                                                title="Generar seed aleatorio"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botones de Acción */}
                        <div className="space-y-4">
                            <button
                                onClick={actions.generate}
                                disabled={!computed.canGenerate}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
                            >
                                {state.isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2" size={20} />
                                        Generar Imagen
                                    </>
                                )}
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={actions.reset}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all"
                                >
                                    Limpiar Todo
                                </button>

                                <button
                                    onClick={actions.downloadImage}
                                    disabled={!computed.hasResult}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                                >
                                    <Download className="mr-2" size={16} />
                                    Descargar
                                </button>
                            </div>
                        </div>

                        {/* Barra de Progreso */}
                        {state.isGenerating && (
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white text-sm">Generando imagen...</span>
                                    <span className="text-white text-sm">{Math.round(state.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${state.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Resultado */}
                        {computed.hasResult && (
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center">
                                        <ImageIcon className="mr-2" size={18} />
                                        Resultado
                                    </h3>
                                </div>

                                <div className="aspect-square bg-gray-800/30 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden mb-4">
                                    <img
                                        src={state.images.generated!}
                                        alt="Imagen generada"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Información del Resultado */}
                                {state.lastResult && (
                                    <div className="p-4 bg-gray-800/30 rounded-lg border border-white/10">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">Modelo:</span>
                                                <span className="text-white ml-2">{state.lastResult.model_used}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Tiempo:</span>
                                                <span className="text-white ml-2">
                                                    {FluxUtils.formatGenerationTime(state.lastResult.generation_time)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Seed:</span>
                                                <span className="text-white ml-2">{state.lastResult.seed}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Resolución:</span>
                                                <span className="text-white ml-2">
                                                    {state.params.width}x{state.params.height}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Galería */}
                    <div>
                        <SimpleImageGallery
                            ref={galleryRef}
                            onPromptReuse={(prompt, params) => {
                                actions.setPrompt(prompt);
                                actions.updateParams(params);
                            }}
                            className="h-fit"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}