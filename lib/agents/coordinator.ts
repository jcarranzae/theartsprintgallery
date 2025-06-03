// lib/agents/coordinator.ts
import { BaseAgent } from './base-agent';
import { AgentResponse, Platform } from '@/types/agents';
import { FluxModel } from '@/types/agents';


interface CoordinatorInput {
  contextData: string;
  visualBase: string;
  techSpecs: string;
  platformOpts: string;
  targetModel: FluxModel;
  platform: Platform;
}

export class Coordinator extends BaseAgent {
  async process(input: CoordinatorInput): Promise<AgentResponse> {
    const startTime = Date.now();
    
    const prompt = `
Como coordinador final, sintetiza estas respuestas de agentes especializados para crear el prompt optimal:

CONTEXTO ANALIZADO:
${input.contextData}

PROMPT VISUAL BASE:
${input.visualBase}

ESPECIFICACIONES TÉCNICAS:
${input.techSpecs}

OPTIMIZACIÓN DE PLATAFORMA (${input.platform}):
${input.platformOpts}

MODELO OBJETIVO: ${input.targetModel}

Tu tarea:
1. Identifica elementos redundantes y elimínalos
2. Resuelve cualquier conflicto entre especificaciones
3. Mantén los elementos más importantes de cada agente
4. Crea un prompt final coherente y optimizado
5. Asegúrate de que sea apropiado para ${input.targetModel}
6. Optimizado específicamente para ${input.platform}

CRITERIOS DE PRIORIZACIÓN:
- Claridad y coherencia (más importante)
- Relevancia para la plataforma
- Especificaciones técnicas apropiadas
- Elementos de engagement
- Brevedad sin perder detalle importante

Responde SOLO con el prompt final optimizado, sin explicaciones adicionales.
El prompt debe ser directo y listo para usar en ${input.targetModel}.
`;

    try {
      const response = await this.callLLM(prompt, 0.5);
      
      return {
        agent_name: 'Coordinator',
        content: response.trim(),
        confidence: 0.95,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Coordination failed:', error);
      throw new Error('Failed to coordinate final prompt');
    }
  }
}