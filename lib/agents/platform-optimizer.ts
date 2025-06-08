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
CURRENT PROMPT: "${basePrompt}"
PLATFORM: ${platform.toUpperCase()}
CONTEXT: ${JSON.stringify(contextData, null, 2)}

Platform configuration:
- Aspect Ratio: ${platformConfig.aspect_ratio}
- Style trends: ${platformConfig.style_trends.join(', ')}
- Engagement factors: ${platformConfig.engagement_factors.join(', ')}
- Optimal colors: ${platformConfig.optimal_colors.join(', ')}
- Technical specifications: ${platformConfig.technical_specs.join(', ')}

Optimize the prompt to maximize performance on ${platform}:

1. Adjust composition for ${platformConfig.aspect_ratio}
2. Incorporate elements that generate engagement on this platform
3. Suggest colors that work well on ${platform}
4. Add platform-specific technical specifications
5. Consider current ${platform} trends

Respond with the optimized prompt in English, incorporating these elements naturally.
Do not add explanations, just the final prompt.
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