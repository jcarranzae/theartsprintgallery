// config/flux-models.ts (actualizado para compatibilidad)
export const FLUX_MODELS = {
  'flux-pro': {
    name: 'FLUX.1 Pro',
    description: 'Maximum quality and prompt adherence for professional use',
    optimal_prompt_style: 'detailed and precise',
    max_tokens: 1000,
    strengths: ['highest quality', 'precise prompt following', 'fine details', 'professional output'],
    prompt_guidelines: [
      'Use specific and detailed descriptions',
      'Include technical photography terms',
      'Specify lighting and composition clearly',
      'Add quality modifiers like "professional photography"',
      'Use precise color and texture descriptions'
    ]
  },
  'flux-dev': {
    name: 'FLUX.1 Dev',
    description: 'Perfect balance between quality and generation speed',
    optimal_prompt_style: 'balanced detail',
    max_tokens: 800,
    strengths: ['versatile output', 'good speed', 'reliable results', 'creative flexibility'],
    prompt_guidelines: [
      'Balance detail with conciseness',
      'Focus on key visual elements',
      'Use clear artistic direction',
      'Include style references when needed',
      'Optimize for creative exploration'
    ]
  },
  'flux-schnell': {
    name: 'FLUX.1 Schnell',
    description: 'Ultra-fast generation optimized for rapid iteration',
    optimal_prompt_style: 'concise and clear',
    max_tokens: 500,
    strengths: ['fastest generation', 'iteration friendly', 'concept testing', 'quick previews'],
    prompt_guidelines: [
      'Keep prompts short and focused',
      'Use essential descriptors only',
      'Avoid overly complex compositions',
      'Focus on main subject and basic style',
      'Optimize for speed over complexity'
    ]
  }
} as const;