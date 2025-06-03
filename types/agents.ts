// types/agents.ts
export interface ContextData {
    tipo_contenido: string;
    industria: string;
    objetivo: string;
    audiencia: string;
    estilo_visual: string;
    contexto_temporal: string;
    trending_topics: string[];
  }
  
  export interface PlatformConfig {
    aspect_ratio: string;
    style_trends: string[];
    engagement_factors: string[];
    optimal_colors: string[];
    technical_specs: string[];
  }
  
  export interface AgentResponse {
    agent_name: string;
    content: string;
    confidence: number;
    processing_time: number;
  }
  
  export interface PromptGenerationRequest {
    user_input: string;
    platform: Platform;
    style_preference?: string;
    target_model?: FluxModel;
  }
  
  export type Platform = 'instagram' | 'youtube_thumbnail' | 'tiktok' | 'twitter' | 'linkedin';
  export type FluxModel = 'flux-pro' | 'flux-dev' | 'flux-schnell';
  
  export interface FluxModelConfig {
    name: string;
    description: string;
    optimal_prompt_style: string;
    max_tokens: number;
    strengths: string[];
    prompt_guidelines: string[];
  }
  
  