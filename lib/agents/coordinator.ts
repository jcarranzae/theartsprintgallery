// lib/agents/coordinator.ts
import { BaseAgent } from './base-agent';
import { AgentResponse, Platform } from '@/types/agents';
import { FluxModel } from '@/types/agents';

interface CoordinatorInput {
  contextData: string;
  visualBase: string;
  techSpecs: string;
  platformOpts: string;
  targetModel: FluxModel;
  platform: Platform;
}

export class Coordinator extends BaseAgent {
  async process(input: CoordinatorInput): Promise<AgentResponse> {
    const startTime = Date.now();
    
    const prompt = `
As the final coordinator, synthesize these specialized agent responses to create the optimal prompt:

ANALYZED CONTEXT:
${input.contextData}

BASE VISUAL PROMPT:
${input.visualBase}

TECHNICAL SPECIFICATIONS:
${input.techSpecs}

PLATFORM OPTIMIZATION (${input.platform}):
${input.platformOpts}

TARGET MODEL: ${input.targetModel}

Your task:
1. Identify redundant elements and eliminate them
2. Resolve any conflicts between specifications
3. Keep the most important elements from each agent
4. Create a coherent and optimized final prompt
5. Ensure it's appropriate for ${input.targetModel}
6. Specifically optimized for ${input.platform}

PRIORITIZATION CRITERIA:
- Clarity and coherence (most important)
- Platform relevance
- Appropriate technical specifications
- Engagement elements
- Brevity without losing important detail

Respond ONLY with the final optimized prompt in English, without additional explanations.
The prompt should be direct and ready to use in ${input.targetModel}.
`;

    try {
      const response = await this.callLLM(prompt, 0.5);
      
      return {
        agent_name: 'Coordinator',
        content: response.trim(),
        confidence: 0.95,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Coordination failed:', error);
      throw new Error('Failed to coordinate final prompt');
    }
  }
}