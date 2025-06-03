// lib/agents/visual-generator.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse } from '@/types/agents';

export class VisualGenerator extends BaseAgent {
  async process(contextData: ContextData): Promise<AgentResponse> {
    const startTime = Date.now();
    
    const prompt = `
Basándote en estos metadatos sobre la imagen solicitada:
${JSON.stringify(contextData, null, 2)}

Genera un prompt visual base para generación de imágenes que incluya:

1. SUJETO PRINCIPAL: Descripción clara del elemento central
2. ACCIÓN/POSE: Lo que está haciendo o cómo está posicionado
3. ENTORNO: Descripción del setting o fondo
4. MOOD/ATMÓSFERA: Sensación o emoción que debe transmitir
5. COMPOSICIÓN: Disposición de elementos en la imagen
6. PALETA DE COLORES: Colores dominantes sugeridos

Formato de respuesta:
"[SUJETO] [ACCIÓN] [ENTORNO], [ATMÓSFERA], [COMPOSICIÓN], [COLORES]"

Ejemplo: "A confident young woman laughing while holding a coffee cup in a modern café, warm and inviting atmosphere, rule of thirds composition with natural lighting, warm browns and soft creams"

Mantén el prompt conciso pero descriptivo, optimizado para ${contextData.estilo_visual}.
`;

    try {
      const response = await this.callLLM(prompt, 0.8);
      
      return {
        agent_name: 'VisualGenerator',
        content: response.trim(),
        confidence: 0.85,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Visual generation failed:', error);
      throw new Error('Failed to generate visual prompt');
    }
  }
}

