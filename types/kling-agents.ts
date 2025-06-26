// types/kling-agents.ts
import { ContextData, FluxModel, AgentResponse } from './agents';

export type KlingModel = 'kling-1-0' | 'kling-1-5' | 'kling-1-6' | 'kling-2-0' | 'kling-2-1';
export type ContentType = 'image' | 'video';
export type Platform = 'instagram' | 'youtube_shorts' | 'youtube_thumbnail' | 'tiktok' | 'twitter' | 'linkedin';

export interface VideoContextData extends ContextData {
    video_style: string;
    motion_type: string;
    camera_movement: string;
    duration_preference: string;
    narrative_structure: string;
}

export interface KlingModelConfig {
    name: string;
    description: string;
    optimal_prompt_style: string;
    max_tokens: number;
    max_duration: string;
    resolution: string;
    strengths: string[];
    prompt_guidelines: string[];
}

export interface VideoGenerationRequest {
    user_input: string;
    platform: Platform;
    content_type: ContentType;
    target_model: FluxModel | KlingModel;
    style_preference?: string;
}

export interface VideoPromptGenerationResult {
    final_prompt: string;
    metadata: {
        context_data: VideoContextData;
        processing_time: number;
        agents_used: string[];
        confidence_score: number;
        target_model: FluxModel | KlingModel;
        content_type: ContentType;
        estimated_tokens: number;
        video_specs?: {
            duration: string;
            aspect_ratio: string;
            camera_movements: string[];
            motion_elements: string[];
        };
    };
    agent_responses: AgentResponse[];
}