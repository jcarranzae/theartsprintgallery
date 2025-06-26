// hooks/usePromptGenerator.ts - ACTUALIZADO
import { useState, useCallback } from 'react';
import { VideoGenerationRequest, VideoPromptGenerationResult } from '@/types/kling-agents';

export function usePromptGenerator() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePrompt = useCallback(async (request: VideoGenerationRequest): Promise<VideoPromptGenerationResult | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/unified-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Generation failed');
            }

            return data.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateVariations = useCallback(async (request: VideoGenerationRequest, count: number = 3): Promise<VideoPromptGenerationResult[] | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/unified-variations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...request, count })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Variations generation failed');
            }

            return data.data.variations;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const optimizePrompt = useCallback(async (
        existingPrompt: string,
        contentType: 'image' | 'video',
        platform: string,
        targetModel: string
    ): Promise<string | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/unified-optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    existing_prompt: existingPrompt,
                    content_type: contentType,
                    platform,
                    target_model: targetModel
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Optimization failed');
            }

            return data.data.optimized_prompt;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        generatePrompt,
        generateVariations,
        optimizePrompt,
        isLoading,
        error,
        clearError: () => setError(null)
    };
}

