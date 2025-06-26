// lib/agents/video-context-analyzer.ts
import { BaseAgent } from './base-agent';
import { VideoContextData } from '@/types/kling-agents';
import { AgentResponse } from '@/types/agents';

export class VideoContextAnalyzer extends BaseAgent {
    private generateFallbackVideoContext(userInput: string): VideoContextData {
        // Extract basic info from user input
        const lowerInput = userInput.toLowerCase();

        // Detect content type
        let content_type = 'social_video';
        if (lowerInput.includes('commercial') || lowerInput.includes('ad')) content_type = 'commercial';
        if (lowerInput.includes('tutorial') || lowerInput.includes('how to')) content_type = 'tutorial';
        if (lowerInput.includes('story') || lowerInput.includes('narrative')) content_type = 'narrative';

        // Detect industry
        let industry = 'general';
        if (lowerInput.includes('food') || lowerInput.includes('restaurant')) industry = 'food';
        if (lowerInput.includes('tech') || lowerInput.includes('software')) industry = 'technology';
        if (lowerInput.includes('fashion') || lowerInput.includes('clothing')) industry = 'fashion';
        if (lowerInput.includes('health') || lowerInput.includes('medical')) industry = 'healthcare';

        // Detect motion type
        let motion_type = 'dynamic';
        if (lowerInput.includes('calm') || lowerInput.includes('peaceful')) motion_type = 'subtle';
        if (lowerInput.includes('action') || lowerInput.includes('fast')) motion_type = 'energetic';
        if (lowerInput.includes('smooth') || lowerInput.includes('flowing')) motion_type = 'flowing';

        // Base context from ContextData
        const baseContext = {
            content_type,
            industry,
            objective: 'engagement',
            audience: 'general audience',
            visual_style: 'modern and clean',
            temporal_context: 'contemporary',
            trending_topics: ['dynamic motion', 'engaging visuals', 'social media content']
        };

        // Video-specific additions
        return {
            ...baseContext,
            video_style: 'social media',
            motion_type,
            camera_movement: 'smooth',
            duration_preference: 'short',
            narrative_structure: 'single-shot'
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

        const prompt = `
Analyze this video request and extract structured metadata in JSON format:

INPUT: "${userInput}"

Respond ONLY with valid JSON containing:
{
  "content_type": "type of video content (e.g: social_video, commercial, tutorial, narrative, etc.)",
  "industry": "industry or sector",
  "objective": "main objective (engagement, education, entertainment, branding, etc.)",
  "audience": "target audience",
  "visual_style": "preferred visual style (cinematic, casual, professional, artistic, etc.)",
  "video_style": "video aesthetic (documentary, commercial, social media, artistic, etc.)",
  "motion_type": "type of movement (dynamic, subtle, static, energetic, flowing, etc.)",
  "camera_movement": "preferred camera work (static, tracking, handheld, smooth, dramatic, etc.)",
  "duration_preference": "preferred video length (short, medium, long, varies)",
  "narrative_structure": "story structure (single-shot, sequence, montage, linear, non-linear)",
  "temporal_context": "temporal context or era",
  "trending_topics": ["array", "of", "relevant", "video", "trends"]
}

Be specific and relevant for video platforms and motion.
All values should be in English.
`;

        try {
            const response = await this.callLLM(prompt, 0.3);
            console.log('🎬 Raw LLM response:', response);

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

            // Validate required fields for video context
            const requiredFields = ['content_type', 'industry', 'objective', 'audience', 'visual_style', 'video_style', 'motion_type', 'camera_movement', 'duration_preference', 'narrative_structure', 'temporal_context', 'trending_topics'];
            const missingFields = requiredFields.filter(field => !parsedData[field]);

            if (missingFields.length > 0) {
                console.error('❌ Missing required fields:', missingFields);
                throw new Error(`Missing required fields in video context analysis: ${missingFields.join(', ')}`);
            }

            return {
                agent_name: 'VideoContextAnalyzer',
                content: JSON.stringify(parsedData),
                confidence: 0.9,
                processing_time: Date.now() - startTime
            };
        } catch (error) {
            console.error('❌ Video context analysis failed:', error);
            console.log('🔄 Using fallback video context generation...');

            // Generate fallback video context data
            const fallbackData = this.generateFallbackVideoContext(userInput);

            return {
                agent_name: 'VideoContextAnalyzer',
                content: JSON.stringify(fallbackData),
                confidence: 0.5, // Lower confidence for fallback
                processing_time: Date.now() - startTime
            };
        }
    }
}
