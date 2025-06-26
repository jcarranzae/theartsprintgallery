// lib/agents/visual-generator.ts
import { BaseAgent } from './base-agent';
import { ContextData, AgentResponse } from '@/types/agents';

export class VisualGenerator extends BaseAgent {
  private generateFallbackVisual(contextData: ContextData): string {
    const { content_type, industry, objective, audience, visual_style, temporal_context } = contextData;

    // Generate basic visual elements based on context
    let subject = 'person';
    let action = 'standing confidently';
    let environment = 'modern setting';
    let atmosphere = 'professional and engaging';
    let composition = 'centered composition';
    let colors = 'balanced color palette';

    // Customize based on content type
    if (content_type === 'logo') {
      subject = 'clean minimalist design element';
      action = 'featuring geometric shapes';
      environment = 'on transparent background';
      atmosphere = 'modern and professional';
      composition = 'centered and balanced';
    } else if (content_type === 'banner') {
      subject = 'key visual element';
      action = 'prominently displayed';
      environment = 'with supporting graphics';
      atmosphere = 'attention-grabbing';
      composition = 'wide format layout';
    } else if (content_type === 'avatar') {
      subject = 'person or character';
      action = 'facing forward with confident expression';
      environment = 'clean background';
      atmosphere = 'approachable and friendly';
      composition = 'portrait orientation';
    }

    // Customize based on industry
    if (industry === 'food') {
      environment = 'modern kitchen or restaurant';
      colors = 'warm appetizing colors';
    } else if (industry === 'technology') {
      environment = 'sleek tech environment';
      colors = 'blue and white tech palette';
    } else if (industry === 'fashion') {
      environment = 'stylish contemporary setting';
      colors = 'trendy fashion colors';
    }

    // Apply visual style
    if (visual_style.includes('professional')) {
      atmosphere = 'clean and professional';
      colors = 'sophisticated color scheme';
    } else if (visual_style.includes('modern')) {
      atmosphere = 'contemporary and fresh';
      composition = 'dynamic modern composition';
    }

    return `${subject} ${action} ${environment}, ${atmosphere}, ${composition}, ${colors}`;
  }

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
      console.log('🎨 VisualGenerator v2.0 with fallback system active');
      const response = await this.callLLM(prompt, 0.8);

      return {
        agent_name: 'VisualGenerator',
        content: response.trim(),
        confidence: 0.85,
        processing_time: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ Visual generation failed:', error);
      console.log('🔄 Using fallback visual generation...');

      // Generate fallback visual prompt
      const fallbackPrompt = this.generateFallbackVisual(contextData);

      return {
        agent_name: 'VisualGenerator',
        content: fallbackPrompt,
        confidence: 0.5, // Lower confidence for fallback
        processing_time: Date.now() - startTime
      };
    }
  }
}