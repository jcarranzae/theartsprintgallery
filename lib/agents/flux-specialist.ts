// lib/agents/flux-specialist.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse, FluxModel } from '@/types/agents';
import { FLUX_MODELS } from '@/config/flux-models';
import { FLUX_PROMPT_PATTERNS } from '@/config/models';

export class FluxSpecialist extends BaseAgent {
  private generateFallbackFluxPrompt(contextData: ContextData, basePrompt: string, targetModel: FluxModel): string {
    const fluxConfig = FLUX_MODELS[targetModel];
    const promptPattern = FLUX_PROMPT_PATTERNS[targetModel];

    // Basic optimization based on Flux model capabilities
    let optimizedPrompt = basePrompt;

    // Apply model-specific optimizations
    if (targetModel === 'flux-pro') {
      optimizedPrompt = `${basePrompt}, professional photography, high resolution, detailed lighting, cinematic quality, ultra-realistic`;
    } else if (targetModel === 'flux-dev') {
      optimizedPrompt = `${basePrompt}, high quality, professional style, detailed, good lighting`;
    } else if (targetModel === 'flux-schnell') {
      optimizedPrompt = `${basePrompt}, clean style, good quality`;
    }

    // Add visual style considerations
    if (contextData.visual_style.includes('professional')) {
      optimizedPrompt += ', corporate professional style';
    }
    if (contextData.visual_style.includes('modern')) {
      optimizedPrompt += ', contemporary modern aesthetic';
    }

    // Add industry-specific elements
    if (contextData.industry === 'technology') {
      optimizedPrompt += ', sleek tech aesthetic';
    } else if (contextData.industry === 'food') {
      optimizedPrompt += ', appetizing food photography';
    }

    return optimizedPrompt;
  }

  async process(input: { contextData: ContextData; basePrompt: string; targetModel?: FluxModel }): Promise<AgentResponse> {
    const { contextData, basePrompt, targetModel = 'flux-pro' } = input;
    const startTime = Date.now();
    const fluxConfig = FLUX_MODELS[targetModel];
    const promptPattern = FLUX_PROMPT_PATTERNS[targetModel];

    const prompt = `
YOU ARE A FLUX MODELS SPECIALIST FROM BLACK FOREST LABS.

BASE PROMPT: "${basePrompt}"
CONTEXT: ${JSON.stringify(contextData, null, 2)}
TARGET FLUX MODEL: ${targetModel.toUpperCase()}

${targetModel.toUpperCase()} MODEL CONFIGURATION:
- Description: ${fluxConfig.description}
- Optimal style: ${fluxConfig.optimal_prompt_style}
- Max tokens: ${fluxConfig.max_tokens}
- Strengths: ${fluxConfig.strengths.join(', ')}

SPECIFIC GUIDELINES FOR ${targetModel.toUpperCase()}:
${fluxConfig.prompt_guidelines.map((guideline: string) => `- ${guideline}`).join('\n')}

RECOMMENDED STRUCTURE:
${promptPattern.structure}

REFERENCE EXAMPLE:
${promptPattern.example}

OPTIMIZE the base prompt for ${targetModel} following these rules:

1. **MODEL ADHERENCE**: Adjust writing style to ${fluxConfig.optimal_prompt_style}
2. **LENGTH**: Keep prompt within approximately ${fluxConfig.max_tokens} tokens
3. **STRENGTHS**: Leverage specific strengths: ${fluxConfig.strengths.join(', ')}
4. **STRUCTURE**: Follow the recommended structure for ${targetModel}
5. **FLUX QUALITY**: Optimize for unique Flux model capabilities

IMPORTANT: 
- Flux models respond better to natural descriptions than technical camera parameters
- Focus on visual description, lighting, and atmosphere
- For Flux Pro: Maximum detail and quality
- For Flux Dev: Balance between detail and versatility  
- For Flux Schnell: Conciseness and clarity

Respond only with the optimized prompt for ${targetModel} in English, without additional explanations.
`;

    try {
      console.log('⚡ FluxSpecialist v2.0 with fallback system active');
      const response = await this.callLLM(prompt, 0.6);

      return {
        agent_name: 'FluxSpecialist',
        content: response.trim(),
        confidence: 0.9,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ Flux optimization failed:', error);
      console.log('🔄 Using fallback Flux optimization...');

      // Generate fallback Flux optimization
      const fallbackPrompt = this.generateFallbackFluxPrompt(contextData, basePrompt, targetModel);

      return {
        agent_name: 'FluxSpecialist',
        content: fallbackPrompt,
        confidence: 0.6, // Lower confidence for fallback
        processing_time: Date.now() - startTime
      };
    }
  }
}