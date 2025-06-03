import { FluxModel, FluxModelConfig } from "@/types/agents";


  export const FLUX_MODELS: Record<FluxModel, FluxModelConfig> = {
    'flux-pro': {
      name: 'FLUX.1 Pro',
      description: 'Modelo premium con máxima calidad y velocidad optimizada',
      optimal_prompt_style: 'detailed_natural_language',
      max_tokens: 500,
      strengths: [
        'Máxima calidad de imagen',
        'Mejor adherencia al prompt',
        'Detalles finos y texturas realistas',
        'Composiciones complejas',
        'Fotorrealismo excepcional'
      ],
      prompt_guidelines: [
        'Usa descripciones naturales y detalladas',
        'Incluye especificaciones de iluminación específicas',
        'Menciona texturas y materiales',
        'Describe la composición y encuadre',
        'Incluye detalles de ambiente y atmósfera',
        'Evita términos muy técnicos de cámara'
      ]
    },
    'flux-dev': {
      name: 'FLUX.1 Dev',
      description: 'Modelo balanceado para desarrollo y experimentación',
      optimal_prompt_style: 'balanced_descriptive',
      max_tokens: 400,
      strengths: [
        'Buena calidad general',
        'Versatilidad en estilos',
        'Experimentación creativa',
        'Balance costo-calidad',
        'Respuesta consistente'
      ],
      prompt_guidelines: [
        'Combina descripciones naturales con algunos términos técnicos',
        'Enfócate en el estilo artístico deseado',
        'Incluye referencias de mood y atmósfera',
        'Menciona colores y composición',
        'Describe el sujeto principal claramente',
        'Añade contexto del entorno'
      ]
    },
    'flux-schnell': {
      name: 'FLUX.1 Schnell',
      description: 'Modelo rápido para generación veloz y iteración',
      optimal_prompt_style: 'concise_focused',
      max_tokens: 250,
      strengths: [
        'Generación muy rápida',
        'Ideal para iteración',
        'Buena para conceptos simples',
        'Eficiente en recursos',
        'Prototipado rápido'
      ],
      prompt_guidelines: [
        'Mantén prompts concisos y directos',
        'Enfócate en elementos esenciales',
        'Usa palabras clave claras',
        'Evita descripciones muy largas',
        'Prioriza el sujeto principal',
        'Incluye solo detalles críticos'
      ]
    }
  };