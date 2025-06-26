// lib/agents/context-analyzer.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse } from '@/types/agents';

export class ContextAnalyzer extends BaseAgent {
  private generateFallbackContext(userInput: string): ContextData {
    // Extract basic info from user input
    const lowerInput = userInput.toLowerCase();

    // Detect content type
    let content_type = 'social_post';
    if (lowerInput.includes('logo') || lowerInput.includes('brand')) content_type = 'logo';
    if (lowerInput.includes('banner') || lowerInput.includes('header')) content_type = 'banner';
    if (lowerInput.includes('avatar') || lowerInput.includes('profile')) content_type = 'avatar';

    // Detect industry
    let industry = 'general';
    if (lowerInput.includes('food') || lowerInput.includes('restaurant')) industry = 'food';
    if (lowerInput.includes('tech') || lowerInput.includes('software')) industry = 'technology';
    if (lowerInput.includes('fashion') || lowerInput.includes('clothing')) industry = 'fashion';
    if (lowerInput.includes('health') || lowerInput.includes('medical')) industry = 'healthcare';

    // Detect objective
    let objective = 'engagement';
    if (lowerInput.includes('professional') || lowerInput.includes('business')) objective = 'branding';
    if (lowerInput.includes('teach') || lowerInput.includes('learn')) objective = 'informative';
    if (lowerInput.includes('sell') || lowerInput.includes('buy')) objective = 'commercial';

    return {
      content_type,
      industry,
      objective,
      audience: 'general audience',
      visual_style: 'modern and clean',
      temporal_context: 'contemporary',
      trending_topics: ['modern design', 'visual appeal', 'social media']
    };
  }

  private fixCommonJsonIssues(response: string): string {
    let fixed = response;

    // Remove any leading/trailing text that isn't JSON
    const jsonMatch = fixed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      fixed = jsonMatch[0];
    }

    // Fix common issues
    fixed = fixed
      .replace(/'/g, '"')  // Single quotes to double quotes
      .replace(/,\s*}/g, '}')  // Remove trailing commas
      .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
      .replace(/(\w+):/g, '"$1":')  // Unquoted keys
      .replace(/:\s*([^",\[\{\}\]]+)(?=\s*[,\}])/g, ': "$1"');  // Unquoted values

    return fixed;
  }

  async process(userInput: string): Promise<AgentResponse> {
    const startTime = Date.now();
    console.log('🔄 ContextAnalyzer v2.0 with fallback system active');

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
      console.log('🔍 Raw LLM response:', response);

      const cleanResponse = response.replace(/```json|```/g, '').trim();
      console.log('🧹 Cleaned response:', cleanResponse);

      // Validate JSON with better error handling
      let parsedData;
      try {
        parsedData = JSON.parse(cleanResponse);
        console.log('✅ Successfully parsed JSON:', parsedData);
      } catch (jsonError) {
        console.error('❌ JSON parsing failed. Response was:', cleanResponse);
        console.error('❌ JSON error:', jsonError);

        // Try to fix common JSON issues
        const fixedResponse = this.fixCommonJsonIssues(cleanResponse);
        try {
          parsedData = JSON.parse(fixedResponse);
          console.log('🔧 Fixed and parsed JSON:', parsedData);
        } catch (secondError) {
          console.error('❌ Could not fix JSON. Final attempt failed:', secondError);
          throw new Error(`Invalid JSON response from LLM: ${cleanResponse.substring(0, 200)}...`);
        }
      }

      // Validate required fields
      const requiredFields = ['content_type', 'industry', 'objective', 'audience', 'visual_style', 'temporal_context', 'trending_topics'];
      const missingFields = requiredFields.filter(field => !parsedData[field]);

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new Error(`Missing required fields in context analysis: ${missingFields.join(', ')}`);
      }

      return {
        agent_name: 'ContextAnalyzer',
        content: JSON.stringify(parsedData),
        confidence: 0.9,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ Context analysis failed:', error);
      console.log('🔄 Using fallback context generation...');

      // Generate fallback context data
      const fallbackData = this.generateFallbackContext(userInput);

      return {
        agent_name: 'ContextAnalyzer',
        content: JSON.stringify(fallbackData),
        confidence: 0.5, // Lower confidence for fallback
        processing_time: Date.now() - startTime
      };
    }
  }
}