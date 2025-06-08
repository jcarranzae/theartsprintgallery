// types/flux-context.ts

// Tipos de modelos disponibles
export type FluxContextModel = 'flux-context-pro' | 'flux-context-max';

// Parámetros de generación
export interface FluxGenerationParams {
  prompt: string;
  model: FluxContextModel;
  width: number;
  height: number;
  steps: number;
  guidance_scale: number;
  strength: number;
  seed?: number;
  context_image?: string;
  mask_image?: string;
}

// Respuesta de la API
export interface FluxGenerationResponse {
  image_url: string;
  seed: number;
  model_used: string;
  generation_time: number;
  additional_images?: string[];
}

// Error de la API
export interface FluxAPIError {
  error: string;
  details?: string;
  status?: number;
}

// Configuración de modelo
export interface ModelConfig {
  name: FluxContextModel;
  displayName: string;
  description: string;
  maxDimensions: number;
  defaultSteps: number;
  defaultGuidanceScale: number;
  supportsMask: boolean;
  supportsContext: boolean;
  color: string;
}

// Estado de la aplicación
export interface FluxContextState {
  selectedModel: FluxContextModel;
  prompt: string;
  params: {
    width: number;
    height: number;
    steps: number;
    guidance_scale: number;
    strength: number;
    seed: number;
  };
  images: {
    context: string | null;
    mask: string | null;
    generated: string | null;
  };
  isGenerating: boolean;
  progress: number;
  lastResult: FluxGenerationResponse | null;
  showAdvanced: boolean;
}

// Configuraciones predefinidas
export const MODEL_CONFIGS: Record<FluxContextModel, ModelConfig> = {
  'flux-context-pro': {
    name: 'flux-context-pro',
    displayName: 'Context Pro',
    description: 'Rápido y eficiente para generación diaria',
    maxDimensions: 1024,
    defaultSteps: 20,
    defaultGuidanceScale: 7.5,
    supportsMask: true,
    supportsContext: true,
    color: 'blue'
  },
  'flux-context-max': {
    name: 'flux-context-max',
    displayName: 'Context Max',
    description: 'Máxima calidad para resultados profesionales',
    maxDimensions: 2048,
    defaultSteps: 30,
    defaultGuidanceScale: 8.0,
    supportsMask: true,
    supportsContext: true,
    color: 'purple'
  }
};

// Presets de resolución
export interface ResolutionPreset {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { name: 'Cuadrado', width: 1024, height: 1024, aspectRatio: '1:1' },
  { name: 'Retrato', width: 768, height: 1024, aspectRatio: '3:4' },
  { name: 'Paisaje', width: 1024, height: 768, aspectRatio: '4:3' },
  { name: 'Panorama', width: 1280, height: 720, aspectRatio: '16:9' },
  { name: 'Ultra Wide', width: 1536, height: 640, aspectRatio: '12:5' },
];

// Presets de estilo
export interface StylePreset {
  name: string;
  prompt_suffix: string;
  description: string;
  guidance_scale: number;
  steps: number;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    name: 'Fotorrealista',
    prompt_suffix: ', photorealistic, high quality, detailed, 8k',
    description: 'Estilo fotográfico realista',
    guidance_scale: 7.5,
    steps: 25
  },
  {
    name: 'Artístico',
    prompt_suffix: ', artistic, painterly, expressive, creative',
    description: 'Estilo artístico y expresivo',
    guidance_scale: 8.5,
    steps: 30
  },
  {
    name: 'Anime',
    prompt_suffix: ', anime style, manga, cel shading, vibrant colors',
    description: 'Estilo anime japonés',
    guidance_scale: 8.0,
    steps: 28
  },
  {
    name: 'Conceptual',
    prompt_suffix: ', concept art, digital painting, fantasy, detailed',
    description: 'Arte conceptual detallado',
    guidance_scale: 9.0,
    steps: 35
  },
  {
    name: 'Minimalista',
    prompt_suffix: ', minimalist, clean, simple, modern',
    description: 'Diseño limpio y minimalista',
    guidance_scale: 6.5,
    steps: 20
  }
];

// Utilidades de validación
export const ValidationRules = {
  prompt: {
    minLength: 3,
    maxLength: 1000
  },
  dimensions: {
    min: 512,
    max: 2048,
    step: 64
  },
  steps: {
    min: 10,
    max: 50
  },
  guidanceScale: {
    min: 1.0,
    max: 20.0,
    step: 0.5
  },
  strength: {
    min: 0.1,
    max: 1.0,
    step: 0.1
  },
  seed: {
    min: 0,
    max: 999999999
  }
};

// Funciones de utilidad
export const FluxUtils = {
  // Validar prompt
  validatePrompt: (prompt: string): string | null => {
    if (!prompt || prompt.trim().length === 0) {
      return 'El prompt es requerido';
    }
    if (prompt.length < ValidationRules.prompt.minLength) {
      return `El prompt debe tener al menos ${ValidationRules.prompt.minLength} caracteres`;
    }
    if (prompt.length > ValidationRules.prompt.maxLength) {
      return `El prompt no puede exceder ${ValidationRules.prompt.maxLength} caracteres`;
    }
    return null;
  },

  // Validar dimensiones
  validateDimensions: (width: number, height: number): string | null => {
    const { min, max, step } = ValidationRules.dimensions;

    if (width < min || width > max || height < min || height > max) {
      return `Las dimensiones deben estar entre ${min} y ${max} píxeles`;
    }

    if (width % step !== 0 || height % step !== 0) {
      return `Las dimensiones deben ser múltiplos de ${step}`;
    }

    return null;
  },

  // Validar parámetros generales
  validateParams: (params: Partial<FluxGenerationParams>): string[] => {
    const errors: string[] = [];

    if (params.prompt) {
      const promptError = FluxUtils.validatePrompt(params.prompt);
      if (promptError) errors.push(promptError);
    }

    if (params.width && params.height) {
      const dimensionError = FluxUtils.validateDimensions(params.width, params.height);
      if (dimensionError) errors.push(dimensionError);
    }

    if (params.steps && (params.steps < ValidationRules.steps.min || params.steps > ValidationRules.steps.max)) {
      errors.push(`Los pasos deben estar entre ${ValidationRules.steps.min} y ${ValidationRules.steps.max}`);
    }

    if (params.guidance_scale && (params.guidance_scale < ValidationRules.guidanceScale.min || params.guidance_scale > ValidationRules.guidanceScale.max)) {
      errors.push(`Guidance scale debe estar entre ${ValidationRules.guidanceScale.min} y ${ValidationRules.guidanceScale.max}`);
    }

    return errors;
  },

  // Generar seed aleatorio
  generateRandomSeed: (): number => {
    return Math.floor(Math.random() * ValidationRules.seed.max);
  },

  // Formatear tiempo de generación
  formatGenerationTime: (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  },

  // Calcular precio estimado (ejemplo)
  estimatePrice: (model: FluxContextModel, width: number, height: number): number => {
    const megapixels = (width * height) / 1000000;
    const basePrice = model === 'flux-context-max' ? 0.08 : 0.04;
    return megapixels * basePrice;
  },

  // Obtener configuración de modelo
  getModelConfig: (model: FluxContextModel): ModelConfig => {
    return MODEL_CONFIGS[model];
  },

  // Convertir imagen a base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Redimensionar imagen manteniendo aspecto
  calculateAspectRatioFit: (srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) => {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
      width: Math.round(srcWidth * ratio),
      height: Math.round(srcHeight * ratio)
    };
  }
};

// Hooks personalizados (para usar con React)
export interface UseFluxContextReturn {
  state: FluxContextState;
  actions: {
    setModel: (model: FluxContextModel) => void;
    setPrompt: (prompt: string) => void;
    updateParams: (params: Partial<FluxContextState['params']>) => void;
    setContextImage: (image: string | null) => void;
    setMaskImage: (image: string | null) => void;
    generate: () => Promise<void>;
    reset: () => void;
    toggleAdvanced: () => void;
    downloadImage: () => void;
    copyPrompt: () => void;
    shareResult: () => void;
    registerHistoryCallback: (callback: (result: FluxGenerationResponse, prompt: string, model: FluxContextModel, params: any) => void) => void;
  };
  computed: {
    canGenerate: boolean;
    hasImages: boolean;
    hasResult: boolean;
    estimatedPrice: number;
    estimatedTime: string;
    modelConfig: ModelConfig;
  };
}