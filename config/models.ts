// config/models.ts
export const LLM_MODELS = {
    CONTEXT_ANALYZER: 'gpt-3.5-turbo', // Económico para análisis básico
    VISUAL_GENERATOR: 'gpt-4', // Mejor para creatividad visual
    FLUX_SPECIALIST: 'gpt-4', // Especializado en modelos Flux
    PLATFORM_OPTIMIZER: 'gpt-4', // Necesita entender tendencias
    COORDINATOR: 'gpt-4' // Síntesis requiere el mejor modelo
  } as const;
  
  // Configuraciones específicas para Flux
  export const FLUX_PROMPT_PATTERNS = {
    'flux-pro': {
      structure: '[SUBJECT] [ACTION/POSE] [SETTING], [LIGHTING], [STYLE], [MOOD], [COMPOSITION], [DETAILS]',
      example: 'A confident businesswoman presenting in a modern conference room, soft natural lighting from large windows, professional photography style, inspiring and dynamic mood, rule of thirds composition, sharp focus on subject with subtle background blur'
    },
    'flux-dev': {
      structure: '[SUBJECT] [ACTION] [ENVIRONMENT], [STYLE/AESTHETIC], [LIGHTING], [COMPOSITION]',
      example: 'Young artist painting a mural on city wall, urban street art aesthetic, golden hour lighting, dynamic diagonal composition'
    },
    'flux-schnell': {
      structure: '[SUBJECT] [KEY_ACTION] [SETTING], [MAIN_STYLE], [KEY_DETAIL]',
      example: 'Chef cooking in kitchen, professional photo, steam and motion'
    }
  } as const;
  