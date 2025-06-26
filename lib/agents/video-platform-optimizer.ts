// lib/agents/video-platform-optimizer.ts
import { BaseAgent } from './base-agent';
import { VideoContextData, Platform } from '@/types/kling-agents';
import { AgentResponse } from '@/types/agents';
import { VIDEO_PLATFORM_CONFIGS } from '@/config/video-platforms';

export class VideoPlatformOptimizer extends BaseAgent {
    async process(input: {
        contextData: VideoContextData;
        basePrompt: string;
        platform: Platform
    }): Promise<AgentResponse> {
        const { contextData, basePrompt, platform } = input;
        const startTime = Date.now();
        const platformConfig = VIDEO_PLATFORM_CONFIGS[platform];

        const prompt = `
CURRENT VIDEO PROMPT: "${basePrompt}"
PLATFORM: ${platform.toUpperCase()}
CONTEXT: ${JSON.stringify(contextData, null, 2)}

Platform video specifications:
- Aspect Ratios: ${platformConfig.aspect_ratios.join(', ')}
- Optimal Duration: ${platformConfig.optimal_duration}
- Max Duration: ${platformConfig.max_duration}
- Video Trends: ${platformConfig.video_trends.join(', ')}
- Engagement Factors: ${platformConfig.engagement_factors.join(', ')}
- Technical Specs: ${platformConfig.technical_specs.join(', ')}
- Camera Recommendations: ${platformConfig.camera_recommendations.join(', ')}

Optimize the video prompt to maximize performance on ${platform}:

1. **Duration Optimization**: Adjust pacing and content for optimal ${platform} duration
2. **Aspect Ratio**: Optimize composition for ${platformConfig.aspect_ratios[0]} (primary)
3. **Platform Trends**: Incorporate relevant ${platform} video trends naturally
4. **Engagement**: Add elements that drive ${platform} engagement
5. **Technical Compliance**: Ensure compatibility with platform technical requirements
6. **Camera Work**: Apply platform-specific camera recommendations
7. **Content Style**: Match ${platform}'s content preferences and audience expectations

For ${platform} specifically:
- Hook viewers within the first 3 seconds
- Ensure content works well in ${platformConfig.aspect_ratios[0]} format
- Include elements that encourage ${platform}-style engagement
- Optimize for ${platformConfig.optimal_duration} viewing time

Respond with the platform-optimized video prompt in English, incorporating these elements naturally.
Do not add explanations, just the final optimized prompt.
`;

        try {
            const response = await this.callLLM(prompt, 0.7);

            return {
                agent_name: 'VideoPlatformOptimizer',
                content: response.trim(),
                confidence: 0.88,
                processing_time: Date.now() - startTime
            };
        } catch (error) {
            console.error('Video platform optimization failed:', error);
            throw new Error('Failed to optimize for video platform');
        }
    }
}