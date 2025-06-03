// lib/agents/flux-specialist.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse, FluxModel } from '@/types/agents';
import { FLUX_MODELS } from '@/config/flux-models';
import { FLUX_PROMPT_PATTERNS } from '@/config/models';


export class FluxSpecialist extends BaseAgent {
  async process(input: { contextData: ContextData; basePrompt: string; targetModel?: FluxModel }): Promise<AgentResponse> {
    const { contextData, basePrompt, targetModel = 'flux-pro' } = input;
    const startTime = Date.now();
    const fluxConfig = FLUX_MODELS[targetModel];
    const promptPattern = FLUX_PROMPT_PATTERNS[targetModel];
    
    const prompt = `
ERES UN ESPECIALISTA EN MODELOS FLUX DE BLACK FOREST LABS.

PROMPT BASE: "${basePrompt}"
CONTEXTO: ${JSON.stringify(contextData, null, 2)}
MODELO FLUX OBJETIVO: ${targetModel.toUpperCase()}

CONFIGURACIÓN DEL MODELO ${targetModel.toUpperCase()}:
- Descripción: ${fluxConfig.description}
- Estilo óptimo: ${fluxConfig.optimal_prompt_style}
- Máximo tokens: ${fluxConfig.max_tokens}
- Fortalezas: ${fluxConfig.strengths.join(', ')}

DIRECTRICES ESPECÍFICAS PARA ${targetModel.toUpperCase()}:
${fluxConfig.prompt_guidelines.map((guideline: string) => `- ${guideline}`).join('\n')}

ESTRUCTURA RECOMENDADA:
${promptPattern.structure}

EJEMPLO DE REFERENCIA:
${promptPattern.example}

OPTIMIZA el prompt base para ${targetModel} siguiendo estas reglas:

1. **ADHERENCIA AL MODELO**: Ajusta el estilo de escritura al ${fluxConfig.optimal_prompt_style}
2. **LONGITUD**: Mantén el prompt dentro de ${fluxConfig.max_tokens} tokens aproximadamente
3. **FORTALEZAS**: Aprovecha las fortalezas específicas: ${fluxConfig.strengths.join(', ')}
4. **ESTRUCTURA**: Sigue la estructura recomendada para ${targetModel}
5. **CALIDAD FLUX**: Optimiza para las capacidades únicas de los modelos Flux

IMPORTANTE: 
- Los modelos Flux responden mejor a descripciones naturales que a parámetros técnicos de cámara
- Enfócate en la descripción visual, iluminación, y atmósfera
- Para Flux Pro: Máximo detalle y calidad
- Para Flux Dev: Balance entre detalle y versatilidad  
- Para Flux Schnell: Concisión y claridad

Responde solo con el prompt optimizado para ${targetModel}, sin explicaciones adicionales.
`;

    try {
      const response = await this.callLLM(prompt, 0.6);
      
      return {
        agent_name: 'FluxSpecialist',
        content: response.trim(),
        confidence: 0.9,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Flux optimization failed:', error);
      throw new Error('Failed to optimize for Flux model');
    }
  }
}

