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