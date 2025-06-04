// hooks/useFluxContext.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import {
    FluxContextModel,
    FluxContextState,
    FluxGenerationParams,
    FluxGenerationResponse,
    FluxUtils,
    UseFluxContextReturn
} from '../types/flux-context';

const initialState: FluxContextState = {
    selectedModel: 'flux-context-pro',
    prompt: '',
    params: {
        width: 1024,
        height: 1024,
        steps: 20,
        guidance_scale: 7.5,
        strength: 0.8,
        seed: FluxUtils.generateRandomSeed()
    },
    images: {
        context: null,
        mask: null,
        generated: null
    },
    isGenerating: false,
    progress: 0,
    lastResult: null,
    showAdvanced: false
};

export function useFluxContext(): UseFluxContextReturn {
    const [state, setState] = useState<FluxContextState>(initialState);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [historyCallback, setHistoryCallback] = useState<((result: FluxGenerationResponse, prompt: string, model: FluxContextModel, params: any) => void) | null>(null);

    // Función para actualizar el estado de forma inmutable
    const updateState = useCallback((updates: Partial<FluxContextState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Función para actualizar parámetros específicos
    const updateParams = useCallback((newParams: Partial<FluxContextState['params']>) => {
        setState(prev => ({
            ...prev,
            params: { ...prev.params, ...newParams }
        }));
    }, []);

    // Función para simular progreso durante la generación
    const startProgressSimulation = useCallback(() => {
        updateState({ progress: 0 });

        progressIntervalRef.current = setInterval(() => {
            setState(prev => {
                const newProgress = prev.progress + Math.random() * 8;
                if (newProgress >= 90) {
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }
                    return { ...prev, progress: 90 };
                }
                return { ...prev, progress: newProgress };
            });
        }, 500);
    }, [updateState]);

    // Función para completar el progreso
    const completeProgress = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        updateState({ progress: 100 });
        setTimeout(() => updateState({ progress: 0 }), 1000);
    }, [updateState]);

    // Cambiar modelo
    const setModel = useCallback((model: FluxContextModel) => {
        const config = FluxUtils.getModelConfig(model);
        updateState({ selectedModel: model });

        // Actualizar parámetros por defecto del modelo
        updateParams({
            steps: config.defaultSteps,
            guidance_scale: config.defaultGuidanceScale
        });
    }, [updateState, updateParams]);

    // Cambiar prompt
    const setPrompt = useCallback((prompt: string) => {
        updateState({ prompt });
    }, [updateState]);

    // Establecer imagen de contexto
    const setContextImage = useCallback((image: string | null) => {
        setState(prev => ({
            ...prev,
            images: { ...prev.images, context: image }
        }));
    }, []);

    // Establecer imagen de máscara
    const setMaskImage = useCallback((image: string | null) => {
        setState(prev => ({
            ...prev,
            images: { ...prev.images, mask: image }
        }));
    }, []);

    // Registrar callback para añadir al historial
    const registerHistoryCallback = useCallback((callback: (result: FluxGenerationResponse, prompt: string, model: FluxContextModel, params: any) => void) => {
        setHistoryCallback(() => callback);
    }, []);

    // Función principal de generación
    const generate = useCallback(async () => {
        // Validaciones
        const promptError = FluxUtils.validatePrompt(state.prompt);
        if (promptError) {
            alert(promptError);
            return;
        }

        const dimensionError = FluxUtils.validateDimensions(state.params.width, state.params.height);
        if (dimensionError) {
            alert(dimensionError);
            return;
        }

        updateState({ isGenerating: true });
        startProgressSimulation();

        try {
            const generationParams: FluxGenerationParams = {
                prompt: state.prompt,
                model: state.selectedModel,
                width: state.params.width,
                height: state.params.height,
                steps: state.params.steps,
                guidance_scale: state.params.guidance_scale,
                strength: state.params.strength,
                seed: state.params.seed,
                context_image: state.images.context || undefined,
                mask_image: state.images.mask || undefined,
            };

            const response = await fetch('/api/flux-context/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(generationParams),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            const result: FluxGenerationResponse = await response.json();

            setState(prev => ({
                ...prev,
                images: { ...prev.images, generated: result.image_url },
                lastResult: result
            }));

            // Añadir al historial si hay callback registrado
            if (historyCallback) {
                historyCallback(result, state.prompt, state.selectedModel, state.params);
            }

            completeProgress();

            // Generar nueva seed para la próxima generación
            updateParams({ seed: FluxUtils.generateRandomSeed() });

        } catch (error) {
            console.error('Error generando imagen:', error);
            alert(error instanceof Error ? error.message : 'Error desconocido al generar la imagen');

            updateState({ progress: 0 });
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        } finally {
            updateState({ isGenerating: false });
        }
    }, [state.prompt, state.selectedModel, state.params, state.images.context, state.images.mask, updateState, updateParams, startProgressSimulation, completeProgress, historyCallback]);

    // Limpiar todo
    const reset = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        setState({
            ...initialState,
            params: {
                ...initialState.params,
                seed: FluxUtils.generateRandomSeed()
            }
        });
    }, []);

    // Toggle advanced settings
    const toggleAdvanced = useCallback(() => {
        updateState({ showAdvanced: !state.showAdvanced });
    }, [state.showAdvanced, updateState]);

    // Funciones adicionales de utilidad
    const downloadImage = useCallback(() => {
        if (state.images.generated) {
            const link = document.createElement('a');
            link.href = state.images.generated;
            link.download = `flux-${state.selectedModel}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [state.images.generated, state.selectedModel]);

    const copyPrompt = useCallback(() => {
        if (state.prompt) {
            navigator.clipboard.writeText(state.prompt);
        }
    }, [state.prompt]);

    const shareResult = useCallback(() => {
        if (state.images.generated && navigator.share) {
            navigator.share({
                title: 'Imagen generada con Flux Context',
                text: state.prompt,
                url: state.images.generated
            });
        }
    }, [state.images.generated, state.prompt]);

    // Estimaciones útiles
    const estimatedPrice = FluxUtils.estimatePrice(
        state.selectedModel,
        state.params.width,
        state.params.height
    );

    const estimatedTime = state.selectedModel === 'flux-context-max'
        ? `${Math.ceil(state.params.steps * 0.3)}-${Math.ceil(state.params.steps * 0.5)}s`
        : `${Math.ceil(state.params.steps * 0.2)}-${Math.ceil(state.params.steps * 0.3)}s`;

    return {
        state,
        actions: {
            setModel,
            setPrompt,
            updateParams,
            setContextImage,
            setMaskImage,
            generate,
            reset,
            toggleAdvanced,
            downloadImage,
            copyPrompt,
            shareResult,
            registerHistoryCallback
        },
        computed: {
            canGenerate: !state.isGenerating && state.prompt.trim().length > 0,
            hasImages: !!(state.images.context || state.images.mask),
            hasResult: !!state.images.generated,
            estimatedPrice,
            estimatedTime,
            modelConfig: FluxUtils.getModelConfig(state.selectedModel)
        }
    };
}

// Hook adicional para manejo de archivos
export function useImageUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadImage = useCallback(async (
        file: File,
        onSuccess: (base64: string) => void,
        maxSize: number = 10 * 1024 * 1024 // 10MB por defecto
    ) => {
        if (file.size > maxSize) {
            throw new Error(`El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`);
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simular progreso de carga
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 20;
                });
            }, 100);

            const base64 = await FluxUtils.fileToBase64(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            onSuccess(base64);

            setTimeout(() => {
                setUploadProgress(0);
            }, 1000);

        } catch (error) {
            console.error('Error cargando imagen:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, []);

    return {
        uploadImage,
        isUploading,
        uploadProgress
    };
}

// Hook para gestión de presets
export function useFluxPresets() {
    const [savedPresets, setSavedPresets] = useState<Array<{
        id: string;
        name: string;
        params: FluxGenerationParams;
        timestamp: number;
    }>>([]);

    const savePreset = useCallback((name: string, params: FluxGenerationParams) => {
        const preset = {
            id: `preset_${Date.now()}`,
            name,
            params,
            timestamp: Date.now()
        };

        setSavedPresets(prev => [...prev, preset]);

        // Guardar en localStorage
        localStorage.setItem('flux_presets', JSON.stringify([...savedPresets, preset]));
    }, [savedPresets]);

    const loadPreset = useCallback((id: string) => {
        return savedPresets.find(preset => preset.id === id);
    }, [savedPresets]);

    const deletePreset = useCallback((id: string) => {
        const newPresets = savedPresets.filter(preset => preset.id !== id);
        setSavedPresets(newPresets);
        localStorage.setItem('flux_presets', JSON.stringify(newPresets));
    }, [savedPresets]);

    // Cargar presets al inicio
    const loadSavedPresets = useCallback(() => {
        try {
            const saved = localStorage.getItem('flux_presets');
            if (saved) {
                setSavedPresets(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error cargando presets:', error);
        }
    }, []);

    return {
        savedPresets,
        savePreset,
        loadPreset,
        deletePreset,
        loadSavedPresets
    };
}