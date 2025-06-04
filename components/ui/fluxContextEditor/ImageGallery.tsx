// components/ImageGallery.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Images, Download, Trash2, Eye, Copy, Share2,
    Filter, Search, Calendar, Grid, List,
    Clock, Zap, Crown, X
} from 'lucide-react';
import { FluxGenerationResponse, FluxContextModel } from '@/types/flux-context';

interface GenerationHistory {
    id: string;
    result: FluxGenerationResponse;
    prompt: string;
    model: FluxContextModel;
    params: {
        width: number;
        height: number;
        steps: number;
        guidance_scale: number;
        strength: number;
        seed: number;
    };
    timestamp: number;
    tags?: string[];
    favorite?: boolean;
}

interface ImageGalleryProps {
    onImageSelect?: (generation: GenerationHistory) => void;
    onPromptReuse?: (prompt: string, params: any) => void;
    className?: string;
}

export default function ImageGallery({
    onImageSelect,
    onPromptReuse,
    className = ''
}: ImageGalleryProps) {
    const [history, setHistory] = useState<GenerationHistory[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<GenerationHistory[]>([]);
    const [selectedImage, setSelectedImage] = useState<GenerationHistory | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterModel, setFilterModel] = useState<FluxContextModel | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'model' | 'generation_time'>('date');
    const [showFavorites, setShowFavorites] = useState(false);

    // Cargar historial del localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('flux_generation_history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setHistory(parsed);
            } catch (error) {
                console.error('Error cargando historial:', error);
            }
        }
    }, []);

    // Filtrar y ordenar historial
    useEffect(() => {
        let filtered = [...history];

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filtrar por modelo
        if (filterModel !== 'all') {
            filtered = filtered.filter(item => item.model === filterModel);
        }

        // Filtrar favoritos
        if (showFavorites) {
            filtered = filtered.filter(item => item.favorite);
        }

        // Ordenar
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return b.timestamp - a.timestamp;
                case 'model':
                    return a.model.localeCompare(b.model);
                case 'generation_time':
                    return a.result.generation_time - b.result.generation_time;
                default:
                    return 0;
            }
        });

        setFilteredHistory(filtered);
    }, [history, searchTerm, filterModel, sortBy, showFavorites]);

    // Guardar historial
    const saveHistory = (newHistory: GenerationHistory[]) => {
        setHistory(newHistory);
        localStorage.setItem('flux_generation_history', JSON.stringify(newHistory));
    };

    // Añadir nueva generación al historial
    const addToHistory = (
        result: FluxGenerationResponse,
        prompt: string,
        model: FluxContextModel,
        params: any
    ) => {
        const newGeneration: GenerationHistory = {
            id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            result,
            prompt,
            model,
            params,
            timestamp: Date.now(),
            tags: extractTags(prompt),
            favorite: false
        };

        const newHistory = [newGeneration, ...history].slice(0, 100); // Mantener solo las últimas 100
        saveHistory(newHistory);
    };

    // Extraer tags del prompt
    const extractTags = (prompt: string): string[] => {
        const words = prompt.toLowerCase().split(/\s+/);
        const commonTags = ['portrait', 'landscape', 'anime', 'realistic', 'artistic', 'concept art'];
        return commonTags.filter(tag => words.some(word => word.includes(tag)));
    };

    // Toggle favorito
    const toggleFavorite = (id: string) => {
        const newHistory = history.map(item =>
            item.id === id ? { ...item, favorite: !item.favorite } : item
        );
        saveHistory(newHistory);
    };

    // Eliminar imagen
    const deleteImage = (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
            const newHistory = history.filter(item => item.id !== id);
            saveHistory(newHistory);
            if (selectedImage?.id === id) {
                setSelectedImage(null);
            }
        }
    };

    // Descargar imagen
    const downloadImage = (item: GenerationHistory) => {
        const link = document.createElement('a');
        link.href = item.result.image_url;
        link.download = `flux-${item.model}-${item.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Compartir imagen
    const shareImage = async (item: GenerationHistory) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Imagen generada con Flux',
                    text: item.prompt,
                    url: item.result.image_url
                });
            } catch (error) {
                console.log('Error compartiendo:', error);
            }
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(item.result.image_url);
            alert('URL copiada al portapapeles');
        }
    };

    // Copiar prompt
    const copyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        alert('Prompt copiado al portapapeles');
    };

    // Formatear fecha
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Hace unos minutos';
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

        return date.toLocaleDateString();
    };

    // Obtener icono del modelo
    const getModelIcon = (model: FluxContextModel) => {
        return model === 'flux-context-pro' ? Zap : Crown;
    };

    return (
        <div className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                        <Images className="mr-2" size={20} />
                        Galería ({filteredHistory.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                        >
                            {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                        </button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                        />
                    </div>

                    {/* Filtro por modelo */}
                    <select
                        value={filterModel}
                        onChange={(e) => setFilterModel(e.target.value as FluxContextModel | 'all')}
                        className="bg-gray-800/50 border border-gray-600 rounded-lg text-white p-2 focus:border-blue-400 focus:outline-none"
                    >
                        <option value="all">Todos los modelos</option>
                        <option value="flux-context-pro">Context Pro</option>
                        <option value="flux-context-max">Context Max</option>
                    </select>

                    {/* Ordenar por */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-gray-800/50 border border-gray-600 rounded-lg text-white p-2 focus:border-blue-400 focus:outline-none"
                    >
                        <option value="date">Más recientes</option>
                        <option value="model">Por modelo</option>
                        <option value="generation_time">Por tiempo de gen.</option>
                    </select>

                    {/* Toggle favoritos */}
                    <button
                        onClick={() => setShowFavorites(!showFavorites)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${showFavorites
                                ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300'
                                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                            }`}
                    >
                        ⭐ Favoritos
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Images size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No hay imágenes en el historial</p>
                        {searchTerm && (
                            <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
                        )}
                    </div>
                ) : (
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                            : 'space-y-4'
                    }>
                        {filteredHistory.map((item) => {
                            const ModelIcon = getModelIcon(item.model);

                            return (
                                <div
                                    key={item.id}
                                    className={`
                    group relative bg-gray-800/30 rounded-lg border border-gray-600/50 
                    hover:border-gray-500 transition-all cursor-pointer
                    ${viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'}
                  `}
                                    onClick={() => {
                                        setSelectedImage(item);
                                        onImageSelect?.(item);
                                    }}
                                >
                                    {/* Imagen */}
                                    <div className={
                                        viewMode === 'grid'
                                            ? 'aspect-square w-full overflow-hidden'
                                            : 'w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden'
                                    }>
                                        <img
                                            src={item.result.image_url}
                                            alt={item.prompt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>

                                    {/* Información */}
                                    <div className={viewMode === 'grid' ? 'p-4' : 'flex-1 ml-4'}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <ModelIcon
                                                    size={14}
                                                    className={item.model === 'flux-context-pro' ? 'text-blue-400' : 'text-purple-400'}
                                                />
                                                <span className="text-xs text-gray-400 ml-1">
                                                    {item.model === 'flux-context-pro' ? 'Pro' : 'Max'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(item.id);
                                                }}
                                                className={`text-sm ${item.favorite ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-400`}
                                            >
                                                ⭐
                                            </button>
                                        </div>

                                        <p className={`text-white text-sm mb-2 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'
                                            }`}>
                                            {item.prompt}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>{formatDate(item.timestamp)}</span>
                                            <span>{item.params.width}x{item.params.height}</span>
                                        </div>

                                        {/* Tags */}
                                        {item.tags && item.tags.length > 0 && viewMode === 'list' && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones rápidas */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadImage(item);
                                                }}
                                                className="p-1 bg-black/50 hover:bg-black/70 rounded text-white transition-colors"
                                                title="Descargar"
                                            >
                                                <Download size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    shareImage(item);
                                                }}
                                                className="p-1 bg-black/50 hover:bg-black/70 rounded text-white transition-colors"
                                                title="Compartir"
                                            >
                                                <Share2 size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteImage(item.id);
                                                }}
                                                className="p-1 bg-black/50 hover:bg-red-600 rounded text-white transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de imagen seleccionada */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h3 className="text-xl font-semibold text-white">Detalles de la imagen</h3>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {/* Imagen */}
                            <div>
                                <img
                                    src={selectedImage.result.image_url}
                                    alt={selectedImage.prompt}
                                    className="w-full rounded-lg"
                                />
                            </div>

                            {/* Información */}
                            <div className="space-y-6">
                                {/* Prompt */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-white font-semibold">Prompt</h4>
                                        <button
                                            onClick={() => copyPrompt(selectedImage.prompt)}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                                        {selectedImage.prompt}
                                    </p>
                                </div>

                                {/* Parámetros */}
                                <div>
                                    <h4 className="text-white font-semibold mb-3">Parámetros</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Modelo:</span>
                                            <span className="text-white ml-2">{selectedImage.model}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Resolución:</span>
                                            <span className="text-white ml-2">
                                                {selectedImage.params.width}x{selectedImage.params.height}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Pasos:</span>
                                            <span className="text-white ml-2">{selectedImage.params.steps}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Guidance:</span>
                                            <span className="text-white ml-2">{selectedImage.params.guidance_scale}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Fuerza:</span>
                                            <span className="text-white ml-2">{selectedImage.params.strength}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Seed:</span>
                                            <span className="text-white ml-2">{selectedImage.params.seed}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Tiempo:</span>
                                            <span className="text-white ml-2">{selectedImage.result.generation_time}s</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Fecha:</span>
                                            <span className="text-white ml-2">{formatDate(selectedImage.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            onPromptReuse?.(selectedImage.prompt, selectedImage.params);
                                            setSelectedImage(null);
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
                                    >
                                        Usar este prompt
                                    </button>

                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => downloadImage(selectedImage)}
                                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            <Download size={16} className="mr-2" />
                                            Descargar
                                        </button>
                                        <button
                                            onClick={() => shareImage(selectedImage)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            <Share2 size={16} className="mr-2" />
                                            Compartir
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteImage(selectedImage.id);
                                                setSelectedImage(null);
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return {
        // Estado
        images: filteredHistory,
        loading: false,
        error: null,

        // Acciones
        addToHistory,
        deleteImage,
        downloadImage,
        shareImage,
        copyPrompt,

        // Utilidades
        hasImages: filteredHistory.length > 0,
        isEmpty: filteredHistory.length === 0,
    };
}

// Hook personalizado para manejar el historial local
export function useLocalImageHistory() {
    const [history, setHistory] = useState<GenerationHistory[]>([]);

    // Cargar historial del localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('flux_generation_history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setHistory(parsed);
            } catch (error) {
                console.error('Error cargando historial:', error);
            }
        }
    }, []);

    // Guardar historial
    const saveHistory = (newHistory: GenerationHistory[]) => {
        setHistory(newHistory);
        localStorage.setItem('flux_generation_history', JSON.stringify(newHistory));
    };

    // Añadir nueva generación al historial
    const addToHistory = (
        result: FluxGenerationResponse,
        prompt: string,
        model: FluxContextModel,
        params: any
    ) => {
        const newGeneration: GenerationHistory = {
            id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            result,
            prompt,
            model,
            params,
            timestamp: Date.now(),
            tags: extractTags(prompt),
            favorite: false
        };

        const newHistory = [newGeneration, ...history].slice(0, 100);
        saveHistory(newHistory);
    };

    // Extraer tags del prompt
    const extractTags = (prompt: string): string[] => {
        const words = prompt.toLowerCase().split(/\s+/);
        const commonTags = ['portrait', 'landscape', 'anime', 'realistic', 'artistic', 'concept art'];
        return commonTags.filter(tag => words.some(word => word.includes(tag)));
    };

    return {
        history,
        addToHistory,
        saveHistory
    };
}