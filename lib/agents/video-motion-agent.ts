// lib/agents/video-motion-agent.ts
import { BaseAgent } from './base-agent';
import { VideoContextData, AgentResponse } from '@/types/agents';

export class VideoMotionAgent extends BaseAgent {
    async process(contextData: VideoContextData): Promise<AgentResponse> {
        const startTime = Date.now();

        const prompt = `
Based on this video context, generate motion and cinematography specifications:

CONTEXT: ${JSON.stringify(contextData, null, 2)}

Create a motion-focused prompt that includes:

1. **Subject Movement**: Specific actions, gestures, and physical movements
2. **Camera Dynamics**: Camera movements, angles, and shot progressions
3. **Motion Physics**: Speed, acceleration, gravity effects, motion blur
4. **Temporal Elements**: Timing, pacing, transitions between movements
5. **Cinematic Techniques**: Professional camera language and effects

Focus on creating engaging motion that works well for video generation.
Structure the response as a cohesive motion description that can be integrated into a larger prompt.

Respond with the motion and cinematography description in English.
Do not include subject details or environment - focus ONLY on movement and camera work.
`;

        try {
            const response = await this.callLLM(prompt, 0.8);

            return {
                agent_name: 'VideoMotionAgent',
                content: response.trim(),
                confidence: 0.87,
                processing_time: Date.now() - startTime
            };
        } catch (error) {
            console.error('Video motion generation failed:', error);
            throw new Error('Failed to generate video motion specifications');
        }
    }
}