// lib/agents/kling-specialist.ts
import { BaseAgent } from './base-agent';
import { VideoContextData, KlingModel } from '@/types/kling-agents';
import { AgentResponse } from '@/types/agents';
import { KLING_MODELS } from '@/config/kling-models';
import { KLING_PROMPT_PATTERNS } from '@/config/video-prompt-patterns';

export class KlingSpecialist extends BaseAgent {
    async process(input: {
        contextData: VideoContextData;
        basePrompt: string;
        motionSpecs: string;
        targetModel?: KlingModel
    }): Promise<AgentResponse> {
        const { contextData, basePrompt, motionSpecs, targetModel = 'kling-2-1' } = input;
        const startTime = Date.now();
        const klingConfig = KLING_MODELS[targetModel];
        const promptPattern = KLING_PROMPT_PATTERNS[targetModel];

        const prompt = `
YOU ARE A KLING AI VIDEO GENERATION SPECIALIST.

BASE PROMPT: "${basePrompt}"
MOTION SPECIFICATIONS: "${motionSpecs}"
CONTEXT: ${JSON.stringify(contextData, null, 2)}
TARGET KLING MODEL: ${targetModel.toUpperCase()}

${targetModel.toUpperCase()} MODEL CONFIGURATION:
- Description: ${klingConfig.description}
- Optimal style: ${klingConfig.optimal_prompt_style}
- Max tokens: ${klingConfig.max_tokens}
- Max duration: ${klingConfig.max_duration}
- Resolution: ${klingConfig.resolution}
- Strengths: ${klingConfig.strengths.join(', ')}

SPECIFIC GUIDELINES FOR ${targetModel.toUpperCase()}:
${klingConfig.prompt_guidelines.map((guideline: string) => `- ${guideline}`).join('\n')}

RECOMMENDED STRUCTURE:
${promptPattern.structure}

REFERENCE EXAMPLE:
${promptPattern.example}

OPTIMIZE the base prompt and motion specs for ${targetModel} following these rules:

1. **MODEL ADHERENCE**: Adjust writing style to ${klingConfig.optimal_prompt_style}
2. **LENGTH**: Keep prompt within approximately ${klingConfig.max_tokens} tokens
3. **STRENGTHS**: Leverage specific strengths: ${klingConfig.strengths.join(', ')}
4. **STRUCTURE**: Follow the recommended structure for ${targetModel}
5. **VIDEO QUALITY**: Optimize for Kling's unique video generation capabilities
6. **MOTION INTEGRATION**: Seamlessly blend the motion specifications with visual elements

IMPORTANT KLING AI OPTIMIZATIONS:
- Kling excels at realistic physics and natural motion
- Use specific action verbs and motion descriptors
- Include camera movement and cinematography terms
- Specify temporal elements (duration, pacing, transitions)
- For longer models (2.0+): structure narrative progression
- For newer models (1.6+): leverage Elements feature for consistency

Respond only with the optimized video prompt for ${targetModel} in English, without additional explanations.
`;

        try {
            const response = await this.callLLM(prompt, 0.6);

            return {
                agent_name: 'KlingSpecialist',
                content: response.trim(),
                confidence: 0.91,
                processing_time: Date.now() - startTime
            };
        } catch (error) {
            console.error('Kling optimization failed:', error);
            throw new Error('Failed to optimize for Kling model');
        }
    }
}