// lib/agents/video-coordinator.ts
import { BaseAgent } from './base-agent';
import { AgentResponse } from '@/types/agents';
import { KlingModel, Platform } from '@/types/kling-agents';

interface VideoCoordinatorInput {
    contextData: string;
    visualBase: string;
    motionSpecs: string;
    klingSpecs: string;
    platformOpts: string;
    targetModel: KlingModel;
    platform: Platform;
}

export class VideoCoordinator extends BaseAgent {
    async process(input: VideoCoordinatorInput): Promise<AgentResponse> {
        const startTime = Date.now();

        const prompt = `
As the final video coordinator, synthesize these specialized agent responses to create the optimal video generation prompt:

ANALYZED CONTEXT:
${input.contextData}

BASE VISUAL PROMPT:
${input.visualBase}

MOTION & CINEMATOGRAPHY SPECIFICATIONS:
${input.motionSpecs}

KLING MODEL OPTIMIZATION (${input.targetModel}):
${input.klingSpecs}

PLATFORM OPTIMIZATION (${input.platform}):
${input.platformOpts}

TARGET: ${input.targetModel} for ${input.platform}

Your task:
1. Synthesize all elements into a cohesive video prompt
2. Eliminate redundant elements and resolve conflicts
3. Maintain the most important elements from each agent
4. Ensure optimal structure for ${input.targetModel}
5. Verify platform compatibility for ${input.platform}
6. Create a prompt that maximizes video generation quality

PRIORITIZATION CRITERIA (in order):
- Video generation clarity and coherence (most important)
- Motion and cinematography effectiveness
- Platform engagement optimization
- Kling model technical compliance
- Brevity without losing essential details

FINAL PROMPT REQUIREMENTS:
- Optimized for ${input.targetModel} capabilities
- Formatted for ${input.platform} success
- Includes clear motion and camera specifications
- Maintains narrative coherence
- Ready for immediate use in Kling AI

Respond ONLY with the final optimized video prompt in English, without additional explanations.
The prompt should be direct and ready to use in ${input.targetModel}.
`;

        try {
            const response = await this.callLLM(prompt, 0.5);

            return {
                agent_name: 'VideoCoordinator',
                content: response.trim(),
                confidence: 0.95,
                processing_time: Date.now() - startTime
            };
        } catch (error) {
            console.error('Video coordination failed:', error);
            throw new Error('Failed to coordinate final video prompt');
        }
    }
}