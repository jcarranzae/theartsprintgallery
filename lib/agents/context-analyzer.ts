// lib/agents/context-analyzer.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse } from '@/types/agents';

export class ContextAnalyzer extends BaseAgent {
  async process(userInput: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    const prompt = `
Analiza esta solicitud de imagen y extrae metadatos estructurados en formato JSON:

INPUT: "${userInput}"

Responde SOLO con un JSON válido que contenga:
{
  "tipo_contenido": "tipo de contenido (ej: post_social, banner, avatar, etc.)",
  "industria": "industria o sector",
  "objetivo": "objetivo principal (engagement, branding, informativo, etc.)",
  "audiencia": "audiencia objetivo",
  "estilo_visual": "estilo visual preferido",
  "contexto_temporal": "contexto temporal o época",
  "trending_topics": ["array", "de", "temas", "tendencia"]
}

Sé específico y relevante para redes sociales.
`;

    try {
      const response = await this.callLLM(prompt, 0.3);
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      
      // Validar que es JSON válido
      JSON.parse(cleanResponse);
      
      return {
        agent_name: 'ContextAnalyzer',
        content: cleanResponse,
        confidence: 0.9,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Context analysis failed:', error);
      throw new Error('Failed to analyze context');
    }
  }
}

