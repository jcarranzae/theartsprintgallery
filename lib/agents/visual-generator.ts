// lib/agents/visual-generator.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse } from '@/types/agents';

export class VisualGenerator extends BaseAgent {
  async process(contextData: ContextData): Promise<AgentResponse> {
    const startTime = Date.now();
    
    const prompt = `
Based on these metadata about the requested image:
${JSON.stringify(contextData, null, 2)}

Generate a base visual prompt for image generation that includes:

1. MAIN SUBJECT: Clear description of the central element
2. ACTION/POSE: What they're doing or how they're positioned
3. ENVIRONMENT: Description of the setting or background
4. MOOD/ATMOSPHERE: Feeling or emotion it should convey
5. COMPOSITION: Arrangement of elements in the image
6. COLOR PALETTE: Suggested dominant colors

Response format:
"[SUBJECT] [ACTION] [ENVIRONMENT], [ATMOSPHERE], [COMPOSITION], [COLORS]"

Example: "A confident young woman laughing while holding a coffee cup in a modern café, warm and inviting atmosphere, rule of thirds composition with natural lighting, warm browns and soft creams"

Keep the prompt concise but descriptive, optimized for ${contextData.visual_style} style.
Generate the prompt in English only.
`;

    try {
      const response = await this.callLLM(prompt, 0.8);
      
      return {
        agent_name: 'VisualGenerator',
        content: response.trim(),
        confidence: 0.85,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Visual generation failed:', error);
      throw new Error('Failed to generate visual prompt');
    }
  }
}