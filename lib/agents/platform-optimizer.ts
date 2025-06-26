// lib/agents/platform-optimizer.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse, Platform } from '@/types/agents';
import { PLATFORM_CONFIGS } from '@/config/platforms';

export class PlatformOptimizer extends BaseAgent {
  private generateFallbackPlatformOptimization(contextData: ContextData, basePrompt: string, platform: Platform): string {
    let optimizedPrompt = basePrompt;

    // Add platform-specific optimizations
    if (platform === 'instagram') {
      optimizedPrompt += ', vibrant colors, eye-catching composition, Instagram-ready, high engagement potential, square or vertical format';
    } else if (platform === 'youtube_thumbnail') {
      optimizedPrompt += ', bold visual elements, clear focal point, thumbnail-optimized, clickable design, 16:9 aspect ratio';
    } else if (platform === 'tiktok') {
      optimizedPrompt += ', trendy aesthetic, Gen Z appeal, mobile-optimized, viral potential, vertical 9:16 format';
    } else if (platform === 'twitter') {
      optimizedPrompt += ', clean professional look, Twitter-compatible, social media ready, optimized for timeline';
    } else if (platform === 'linkedin') {
      optimizedPrompt += ', professional corporate style, business-appropriate, LinkedIn-optimized, professional quality';
    }

    // Add general social media optimizations
    optimizedPrompt += ', high quality, engaging composition, social media optimized';

    return optimizedPrompt;
  }

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
      console.log('📱 PlatformOptimizer v2.0 with fallback system active');
      const response = await this.callLLM(prompt, 0.7);

      return {
        agent_name: 'PlatformOptimizer',
        content: response.trim(),
        confidence: 0.88,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ Platform optimization failed:', error);
      console.log('🔄 Using fallback platform optimization...');

      // Generate fallback platform optimization
      const fallbackPrompt = this.generateFallbackPlatformOptimization(contextData, basePrompt, platform);

      return {
        agent_name: 'PlatformOptimizer',
        content: fallbackPrompt,
        confidence: 0.6, // Lower confidence for fallback
        processing_time: Date.now() - startTime
      };
    }
  }
}