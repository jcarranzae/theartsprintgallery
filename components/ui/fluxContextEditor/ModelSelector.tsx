// components/ModelSelector.tsx
'use client';

import React from 'react';
import { Zap, Crown, Clock, DollarSign } from 'lucide-react';
import { FluxContextModel, MODEL_CONFIGS } from '@/types/flux-context';

interface ModelSelectorProps {
    selectedModel: FluxContextModel;
    onModelChange: (model: FluxContextModel) => void;
    estimatedTime: string;
    estimatedPrice: number;
    disabled?: boolean;
}

export default function ModelSelector({
    selectedModel,
    onModelChange,
    estimatedTime,
    estimatedPrice,
    disabled = false
}: ModelSelectorProps) {
    const models: FluxContextModel[] = ['flux-context-pro', 'flux-context-max'];

    const getModelIcon = (model: FluxContextModel) => {
        return model === 'flux-context-pro' ? Zap : Crown;
    };

    const getModelColor = (model: FluxContextModel) => {
        return model === 'flux-context-pro' ? 'blue' : 'purple';
    };

    const getModelFeatures = (model: FluxContextModel) => {
        const config = MODEL_CONFIGS[model];
        return {
            'flux-context-pro': [
                'Generación rápida',
                'Ideal para iteraciones',
                'Consumo optimizado',
                'Resolución hasta 1024px'
            ],
            'flux-context-max': [
                'Máxima calidad',
                'Detalles profesionales',
                'Resolución hasta 2048px',
                'Mejor coherencia'
            ]
        }[model];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Modelo de IA</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{estimatedTime}</span>
                    </div>
                    <div className="flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        <span>${estimatedPrice.toFixed(3)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model) => {
                    const config = MODEL_CONFIGS[model];
                    const Icon = getModelIcon(model);
                    const color = getModelColor(model);
                    const features = getModelFeatures(model);
                    const isSelected = selectedModel === model;

                    return (
                        <button
                            key={model}
                            onClick={() => onModelChange(model)}
                            disabled={disabled}
                            className={`
                relative p-6 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                                    ? `border-${color}-400 bg-${color}-500/20 text-white shadow-lg`
                                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
                        >
                            {/* Badge de modelo */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <Icon
                                        size={20}
                                        className={isSelected ? `text-${color}-400` : 'text-gray-400'}
                                    />
                                    <span className="ml-2 font-bold text-lg">
                                        {config.displayName}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    bg-${color}-500/30 text-${color}-300 border border-${color}-400/50
                  `}>
                                        Seleccionado
                                    </div>
                                )}
                            </div>

                            {/* Descripción */}
                            <p className="text-sm opacity-80 mb-4">
                                {config.description}
                            </p>

                            {/* Características */}
                            <div className="space-y-2">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center text-sm">
                                        <div className={`
                      w-1.5 h-1.5 rounded-full mr-2
                      ${isSelected ? `bg-${color}-400` : 'bg-gray-500'}
                    `} />
                                        <span className="opacity-90">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Especificaciones técnicas */}
                            <div className="mt-4 pt-4 border-t border-gray-600/50">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-400">Pasos por defecto:</span>
                                        <span className="text-white ml-1">{config.defaultSteps}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Guidance:</span>
                                        <span className="text-white ml-1">{config.defaultGuidanceScale}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Max resolución:</span>
                                        <span className="text-white ml-1">{config.maxDimensions}px</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Máscaras:</span>
                                        <span className="text-white ml-1">
                                            {config.supportsMask ? '✓' : '✗'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Indicador de carga activa */}
                            {disabled && isSelected && (
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <div className="text-white text-sm font-medium">
                                        Generando...
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Comparación rápida */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/50">
                <h4 className="text-white font-medium mb-3">Comparación Rápida</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-gray-400 mb-1">Velocidad</div>
                        <div className="space-y-1">
                            <div className={`
                h-2 rounded ${selectedModel === 'flux-context-pro' ? 'bg-blue-500' : 'bg-gray-600'}
              `} />
                            <div className={`
                h-2 rounded ${selectedModel === 'flux-context-max' ? 'bg-purple-500' : 'bg-gray-600'}
              `} />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 mb-1">Calidad</div>
                        <div className="space-y-1">
                            <div className={`
                h-2 rounded ${selectedModel === 'flux-context-pro' ? 'bg-blue-500' : 'bg-gray-600'}
              `} style={{ width: '80%' }} />
                            <div className={`
                h-2 rounded ${selectedModel === 'flux-context-max' ? 'bg-purple-500' : 'bg-gray-600'}
              `} />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 mb-1">Precio</div>
                        <div className="space-y-1">
                            <div className={`
                h-2 rounded ${selectedModel === 'flux-context-pro' ? 'bg-blue-500' : 'bg-gray-600'}
              `} style={{ width: '60%' }} />
                            <div className={`
                h-2 rounded ${selectedModel === 'flux-context-max' ? 'bg-purple-500' : 'bg-gray-600'}
              `} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Pro</span>
                    <span>Max</span>
                </div>
            </div>
        </div>
    );
}