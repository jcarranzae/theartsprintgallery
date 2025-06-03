// lib/agents/platform-optimizer.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse, Platform } from '@/types/agents';
import { PLATFORM_CONFIGS } from '@/config/platforms';

export class PlatformOptimizer extends BaseAgent {
  async process(input: { contextData: ContextData; basePrompt: string; platform: Platform }): Promise<AgentResponse> {
    const { contextData, basePrompt, platform } = input;
    const startTime = Date.now();
    const platformConfig = PLATFORM_CONFIGS[platform];
    
    const prompt = `
PROMPT ACTUAL: "${basePrompt}"
PLATAFORMA: ${platform.toUpperCase()}
CONTEXTO: ${JSON.stringify(contextData, null, 2)}

Configuración de la plataforma:
- Aspect Ratio: ${platformConfig.aspect_ratio}
- Tendencias de estilo: ${platformConfig.style_trends.join(', ')}
- Factores de engagement: ${platformConfig.engagement_factors.join(', ')}
- Colores óptimos: ${platformConfig.optimal_colors.join(', ')}
- Especificaciones técnicas: ${platformConfig.technical_specs.join(', ')}

Optimiza el prompt para maximizar el rendimiento en ${platform}:

1. Ajusta la composición para ${platformConfig.aspect_ratio}
2. Incorpora elementos que generen engagement en esta plataforma
3. Sugiere colores que funcionen bien en ${platform}
4. Añade especificaciones técnicas específicas para esta plataforma
5. Considera las tendencias actuales de ${platform}

Responde con el prompt optimizado, incorporando estos elementos de manera natural.
No agregues explicaciones, solo el prompt final.
`;

    try {
      const response = await this.callLLM(prompt, 0.7);
      
      return {
        agent_name: 'PlatformOptimizer',
        content: response.trim(),
        confidence: 0.88,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Platform optimization failed:', error);
      throw new Error('Failed to optimize for platform');
    }
  }
}

