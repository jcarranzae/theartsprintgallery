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
  private generateFallbackCoordination(input: CoordinatorInput): string {
    // Parse context data for basic info
    let contextData;
    try {
      contextData = JSON.parse(input.contextData);
    } catch {
      contextData = { content_type: 'social_post', industry: 'general', visual_style: 'modern' };
    }

    // Combine all inputs into a coherent prompt
    let finalPrompt = input.visualBase;

    // Add platform-specific elements from platformOpts
    if (input.platformOpts.includes('Instagram')) {
      finalPrompt += ', Instagram-optimized, high engagement potential';
    } else if (input.platformOpts.includes('YouTube')) {
      finalPrompt += ', YouTube thumbnail style, clickable design';
    } else if (input.platformOpts.includes('TikTok')) {
      finalPrompt += ', TikTok-style, viral potential';
    } else if (input.platformOpts.includes('LinkedIn')) {
      finalPrompt += ', professional business style';
    } else if (input.platformOpts.includes('Twitter')) {
      finalPrompt += ', social media optimized';
    }

    // Add technical specifications for the target model
    if (input.targetModel === 'flux-pro') {
      finalPrompt += ', professional photography, high resolution, ultra-realistic';
    } else if (input.targetModel === 'flux-dev') {
      finalPrompt += ', high quality, detailed, professional style';
    } else if (input.targetModel === 'flux-schnell') {
      finalPrompt += ', clean style, good quality';
    }

    // Add visual style from context
    if (contextData.visual_style) {
      finalPrompt += `, ${contextData.visual_style} style`;
    }

    // Clean up the prompt
    finalPrompt = finalPrompt.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

    return finalPrompt;
  }

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
      console.log('🎯 Coordinator v2.0 with fallback system active');
      const response = await this.callLLM(prompt, 0.5);

      return {
        agent_name: 'Coordinator',
        content: response.trim(),
        confidence: 0.95,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ Coordination failed:', error);
      console.log('🔄 Using fallback coordination...');

      // Generate fallback coordination
      const fallbackPrompt = this.generateFallbackCoordination(input);

      return {
        agent_name: 'Coordinator',
        content: fallbackPrompt,
        confidence: 0.7, // Lower confidence for fallback
        processing_time: Date.now() - startTime
      };
    }
  }
}