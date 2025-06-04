'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Wand2, Settings, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FluxContextEditorProps {
    className?: string;
}

type ModelType = 'flux-context-pro' | 'flux-context-max';

interface GenerationParams {
    prompt: string;
    model: ModelType;
    width: number;
    height: number;
    steps: number;
    guidance_scale: number;
    seed?: number;
    context_image?: string;
    mask_image?: string;
    strength: number;
}

interface GenerationResult {
    image_url: string;
    seed: number;
    model_used: string;
    generation_time: number;
}

export default function FluxContextEditor({ className = '' }: FluxContextEditorProps) {
    const [selectedModel, setSelectedModel] = useState<ModelType>('flux-context-pro');
    const [prompt, setPrompt] = useState('');
    const [contextImage, setContextImage] = useState<string | null>(null);
    const [maskImage, setMaskImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    // Parámetros avanzados
    const [params, setParams] = useState({
        width: 1024,
        height: 1024,
        steps: 20,
        guidance_scale: 7.5,
        strength: 0.8,
        seed: Math.floor(Math.random() * 1000000)
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [lastResult, setLastResult] = useState<GenerationResult | null>(null);

    const contextImageRef = useRef<HTMLInputElement>(null);
    const maskImageRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback((
        event: React.ChangeEvent<HTMLInputElement>,
        type: 'context' | 'mask'
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (type === 'context') {
                    setContextImage(result);
                } else {
                    setMaskImage(result);
                }
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const generateImage = async () => {
        if (!prompt.trim()) {
            alert('Por favor, introduce un prompt');
            return;
        }

        setIsGenerating(true);
        setProgress(0);

        // Simular progreso
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 10;
            });
        }, 500);

        try {
            const generationParams: GenerationParams = {
                prompt,
                model: selectedModel,
                width: params.width,
                height: params.height,
                steps: params.steps,
                guidance_scale: params.guidance_scale,
                strength: params.strength,
                seed: params.seed,
                context_image: contextImage || undefined,
                mask_image: maskImage || undefined,
            };

            const response = await fetch('/api/flux-context/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(generationParams),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result: GenerationResult = await response.json();

            setGeneratedImage(result.image_url);
            setLastResult(result);
            setProgress(100);

        } catch (error) {
            console.error('Error generando imagen:', error);
            alert('Error al generar la imagen. Por favor, inténtalo de nuevo.');
        } finally {
            clearInterval(progressInterval);
            setIsGenerating(false);
            setProgress(0);
        }
    };

    const downloadImage = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = `flux-context-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const clearImages = () => {
        setContextImage(null);
        setMaskImage(null);
        setGeneratedImage(null);
        setLastResult(null);
        if (contextImageRef.current) contextImageRef.current.value = '';
        if (maskImageRef.current) maskImageRef.current.value = '';
    };

    return (
        <div className= {`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 ${className}`
}>
    <div className="max-w-7xl mx-auto" >
        {/* Header */ }
        < div className = "text-center mb-8" >
            <h1 className="text-4xl font-bold text-white mb-2" >
                Flux Context Editor
                    </h1>
                    < p className = "text-gray-300" >
                        Crea y edita imágenes con IA usando Flux Context Pro y Max
                            </p>
                            </div>

                            < div className = "grid grid-cols-1 lg:grid-cols-2 gap-8" >
                                {/* Panel de Control */ }
                                < div className = "space-y-6" >
                                    {/* Selección de Modelo */ }
                                    < div className = "bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" >
                                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center" >
                                            <Wand2 className="mr-2" size = { 20} />
                                                Modelo de IA
                                                    </h3>
                                                    < div className = "grid grid-cols-2 gap-4" >
                                                        <button
                  onClick={ () => setSelectedModel('flux-context-pro') }
className = {`p-4 rounded-lg border-2 transition-all ${selectedModel === 'flux-context-pro'
        ? 'border-blue-400 bg-blue-500/20 text-white'
        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
    }`}
                >
    <div className="font-semibold" > Context Pro </div>
        < div className = "text-sm opacity-80" > Rápido y eficiente </div>
            </button>
            < button
onClick = {() => setSelectedModel('flux-context-max')}
className = {`p-4 rounded-lg border-2 transition-all ${selectedModel === 'flux-context-max'
        ? 'border-purple-400 bg-purple-500/20 text-white'
        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
    }`}
                >
    <div className="font-semibold" > Context Max </div>
        < div className = "text-sm opacity-80" > Máxima calidad </div>
            </button>
            </div>
            </div>

{/* Prompt */ }
<div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" >
    <label className="block text-white font-semibold mb-3" >
        Descripción de la imagen
            </label>
            < textarea
value = { prompt }
onChange = {(e) => setPrompt(e.target.value)}
placeholder = "Describe la imagen que quieres crear o editar..."
className = "w-full h-32 bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
    />
    </div>

{/* Upload de Imágenes */ }
<div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" >
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center" >
        <Upload className="mr-2" size = { 20} />
            Imágenes de Referencia
                </h3>

                < div className = "space-y-4" >
                    {/* Imagen de Contexto */ }
                    < div >
                    <label className="block text-white font-medium mb-2" >
                        Imagen de Contexto(opcional)
                            </label>
                            < input
ref = { contextImageRef }
type = "file"
accept = "image/*"
onChange = {(e) => handleImageUpload(e, 'context')}
className = "w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
    />
    </div>

{/* Imagen de Máscara */ }
<div>
    <label className="block text-white font-medium mb-2" >
        Máscara de Edición(opcional)
            </label>
            < input
ref = { maskImageRef }
type = "file"
accept = "image/*"
onChange = {(e) => handleImageUpload(e, 'mask')}
className = "w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
    />
    </div>
    </div>
    </div>

{/* Parámetros Avanzados */ }
<div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" >
    <button
                onClick={ () => setShowAdvanced(!showAdvanced) }
className = "flex items-center text-white font-semibold mb-4 hover:text-blue-400 transition-colors"
    >
    <Settings className="mr-2" size = { 20} />
        Parámetros Avanzados
            < span className = "ml-2 text-sm" >
                { showAdvanced? '▼': '▶' }
                </span>
                </button>

{
    showAdvanced && (
        <div className="space-y-4" >
            <div className="grid grid-cols-2 gap-4" >
                <div>
                <label className="block text-white text-sm mb-2" > Ancho </label>
                    < input
    type = "number"
    value = { params.width }
    onChange = {(e) => setParams(prev => ({ ...prev, width: parseInt(e.target.value) }))
}
className = "w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-white"
min = "512" max = "2048" step = "64"
    />
    </div>
    < div >
    <label className="block text-white text-sm mb-2" > Alto </label>
        < input
type = "number"
value = { params.height }
onChange = {(e) => setParams(prev => ({ ...prev, height: parseInt(e.target.value) }))}
className = "w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-white"
min = "512" max = "2048" step = "64"
    />
    </div>
    </div>

    < div >
    <label className="block text-white text-sm mb-2" >
        Pasos: { params.steps }
</label>
    < input
type = "range"
value = { params.steps }
onChange = {(e) => setParams(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
className = "w-full"
min = "10" max = "50"
    />
    </div>

    < div >
    <label className="block text-white text-sm mb-2" >
        Guidance Scale: { params.guidance_scale }
</label>
    < input
type = "range"
value = { params.guidance_scale }
onChange = {(e) => setParams(prev => ({ ...prev, guidance_scale: parseFloat(e.target.value) }))}
className = "w-full"
min = "1" max = "20" step = "0.5"
    />
    </div>

    < div >
    <label className="block text-white text-sm mb-2" >
        Fuerza: { params.strength }
</label>
    < input
type = "range"
value = { params.strength }
onChange = {(e) => setParams(prev => ({ ...prev, strength: parseFloat(e.target.value) }))}
className = "w-full"
min = "0.1" max = "1" step = "0.1"
    />
    </div>

    < div >
    <label className="block text-white text-sm mb-2" > Seed </label>
        < input
type = "number"
value = { params.seed }
onChange = {(e) => setParams(prev => ({ ...prev, seed: parseInt(e.target.value) }))}
className = "w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2 text-white"
    />
    </div>
    </div>
              )}
</div>

{/* Botones de Acción */ }
<div className="flex gap-4" >
    <button
                onClick={ generateImage }
disabled = { isGenerating || !prompt.trim()}
className = "flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
    >
{
    isGenerating?(
                  <>
    <Loader2 className="animate-spin mr-2" size = { 20} />
        Generando...
</>
                ) : (
    <>
    <Wand2 className= "mr-2" size = { 20} />
        Generar Imagen
            </>
                )}
</button>

    < button
onClick = { clearImages }
className = "bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
    >
    Limpiar
    </button>
    </div>

{/* Barra de Progreso */ }
{
    isGenerating && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20" >
            <div className="flex items-center justify-between mb-2" >
                <span className="text-white text-sm" > Progreso </span>
                    < span className = "text-white text-sm" > { Math.round(progress) } % </span>
                        </div>
                        < div className = "w-full bg-gray-700 rounded-full h-2" >
                            <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
    style = {{ width: `${progress}%` }
}
                  />
    </div>
    </div>
            )}
</div>

{/* Panel de Resultados */ }
<div className="space-y-6" >
    {/* Imágenes de Referencia */ }
{
    (contextImage || maskImage) && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center" >
                <ImageIcon className="mr-2" size = { 20} />
                    Imágenes de Referencia
                        </h3>
                        < div className = "grid grid-cols-2 gap-4" >
                            { contextImage && (
                                <div>
                                <p className="text-white text-sm mb-2" > Contexto </p>
                                    < img
    src = { contextImage }
    alt = "Imagen de contexto"
    className = "w-full h-48 object-cover rounded-lg border border-white/20"
        />
        </div>
                  )
}
{
    maskImage && (
        <div>
        <p className="text-white text-sm mb-2" > Máscara </p>
            < img
    src = { maskImage }
    alt = "Máscara de edición"
    className = "w-full h-48 object-cover rounded-lg border border-white/20"
        />
        </div>
                  )
}
</div>
    </div>
            )}

{/* Imagen Generada */ }
<div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" >
    <div className="flex items-center justify-between mb-4" >
        <h3 className="text-xl font-semibold text-white flex items-center" >
            <ImageIcon className="mr-2" size = { 20} />
                Resultado
                </h3>
{
    generatedImage && (
        <button
                    onClick={ downloadImage }
    className = "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
        <Download className="mr-2" size = { 16} />
            Descargar
            </button>
                )
}
</div>

    < div className = "aspect-square bg-gray-800/50 rounded-lg border border-white/20 flex items-center justify-center overflow-hidden" >
        {
            generatedImage?(
                  <img 
                    src = { generatedImage } 
                    alt = "Imagen generada" 
                    className = "w-full h-full object-cover"
                    />
                ): (
                    <div className = "text-center text-gray-400">
                    <ImageIcon size = { 64 } className = "mx-auto mb-4 opacity-50" />
        <p>La imagen generada aparecerá aquí </p>
            </div>
                )}
</div>

{/* Información del Resultado */ }
{
    lastResult && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-white/20" >
            <div className="grid grid-cols-2 gap-4 text-sm" >
                <div>
                <span className="text-gray-400" > Modelo: </span>
                    < span className = "text-white ml-2" > { lastResult.model_used } </span>
                        </div>
                        < div >
                        <span className="text-gray-400" > Tiempo: </span>
                            < span className = "text-white ml-2" > { lastResult.generation_time }s </span>
                                </div>
                                < div >
                                <span className="text-gray-400" > Seed: </span>
                                    < span className = "text-white ml-2" > { lastResult.seed } </span>
                                        </div>
                                        </div>
                                        </div>
              )
}
</div>
    </div>
    </div>
    </div>
    </div>
  );
}