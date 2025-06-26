// types/api-responses.ts - Tipos para las respuestas de la API
export interface UnifiedApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface GenerationResponse {
    final_prompt: string;
    metadata: {
        context_data: any;
        processing_time: number;
        agents_used: string[];
        confidence_score: number;
        target_model: string;
        content_type: 'image' | 'video';
        estimated_tokens: number;
        video_specs?: {
            duration: string;
            aspect_ratio: string;
            camera_movements: string[];
            motion_elements: string[];
        };
    };
    agent_responses: Array<{
        agent_name: string;
        content: string;
        confidence: number;
        processing_time: number;
    }>;
}

export interface VariationsResponse {
    variations: GenerationResponse[];
}

export interface OptimizationResponse {
    optimized_prompt: string;
}