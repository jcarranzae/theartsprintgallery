export interface BaseImageRequest {
  prompt: string;
  image_prompt: string | null;
  output_format: string;
  safety_tolerance: number;
}

export interface KlingAiRequest {
  prompt: string;
  duration: number;
  ratio: '16:9' |'9:16' | '1:1';      
  image_url: string;
}

export interface FluxProRequest extends BaseImageRequest {
  width: number;
  height: number;
  steps: number;
  prompt_upsampling: boolean;
  seed: number;
  guidance: number;
}

export interface FluxProUltraRequest extends BaseImageRequest {
  seed: number;
  aspect_ratio: string;
  raw: boolean;
  image_prompt_strength: number;
}

export const MODELS = {
  FLUX_PRO: 'flux-pro',
  FLUX_PRO_ULTRA: 'flux-pro-ultra',
  KLING_AI_16PRO: "kling-video/v1.6/pro/image-to-video"
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];

export interface GenerateImageRequest {
  prompt: string;
  image_prompt: string | null;
  width: number;
  height: number;
  steps: number;
  prompt_upsampling: boolean;
  seed: number;
  guidance: number;
  safety_tolerance: number;
  output_format: string;
}

export interface GenerateImageResponse {
  id: string;
  status: 'pending' | 'ready' | 'error';
}

export interface ImageResult {
  id: string;
  progress: number | null;
  status: string;  // Cambiado para aceptar "Ready" en lugar de "ready"
  url?: string;  // Agregamos url como opcional
  result?: {
    duration: number;
    end_time: number;
    prompt: string;
    sample: string;
    seed: number;
    start_time: number;
  };
} 