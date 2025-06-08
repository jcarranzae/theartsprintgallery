// lib/agents/context-analyzer.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse } from '@/types/agents';

export class ContextAnalyzer extends BaseAgent {
  async process(userInput: string): Promise<AgentResponse> {
    const startTime = Date.now();
    
    const prompt = `
Analyze this image request and extract structured metadata in JSON format:

INPUT: "${userInput}"

Respond ONLY with valid JSON containing:
{
  "content_type": "content type (e.g: social_post, banner, avatar, etc.)",
  "industry": "industry or sector",
  "objective": "main objective (engagement, branding, informative, etc.)",
  "audience": "target audience",
  "visual_style": "preferred visual style",
  "temporal_context": "temporal context or era",
  "trending_topics": ["array", "of", "trending", "topics"]
}

Be specific and relevant for social media platforms.
All values should be in English.
`;

    try {
      const response = await this.callLLM(prompt, 0.3);
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      
      // Validate JSON
      JSON.parse(cleanResponse);
      
      return {
        agent_name: 'ContextAnalyzer',
        content: cleanResponse,
        confidence: 0.9,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('Context analysis failed:', error);
      throw new Error('Failed to analyze context');
    }
  }
}