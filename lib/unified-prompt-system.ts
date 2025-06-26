// lib/unified-prompt-system.ts
import { ContextAnalyzer } from './agents/context-analyzer';
import { VideoContextAnalyzer } from './agents/video-context-analyzer';
import { VisualGenerator } from './agents/visual-generator';
import { VideoMotionAgent } from './agents/video-motion-agent';
import { FluxSpecialist } from './agents/flux-specialist';
import { KlingSpecialist } from './agents/kling-specialist';
import { PlatformOptimizer } from './agents/platform-optimizer';
import { VideoPlatformOptimizer } from './agents/video-platform-optimizer';
import { Coordinator } from './agents/coordinator';
import { VideoCoordinator } from './agents/video-coordinator';
import {
    AgentResponse,
    ContextData,
    Platform as ImagePlatform,
    FluxModel
} from '@/types/agents';
import {
    VideoGenerationRequest,
    VideoPromptGenerationResult,
    VideoContextData,
    KlingModel,
    ContentType,
    Platform as VideoPlatform
} from '@/types/kling-agents';
import { LLM_MODELS } from '@/config/models';

export class UnifiedPromptSystem {
    // Image generation agents
    private contextAnalyzer: ContextAnalyzer;
    private visualGenerator: VisualGenerator;
    private fluxSpecialist: FluxSpecialist;
    private platformOptimizer: PlatformOptimizer;
    private coordinator: Coordinator;

    // Video generation agents
    private videoContextAnalyzer: VideoContextAnalyzer;
    private videoMotionAgent: VideoMotionAgent;
    private klingSpecialist: KlingSpecialist;
    private videoPlatformOptimizer: VideoPlatformOptimizer;
    private videoCoordinator: VideoCoordinator;

    constructor(apiKey: string) {
        // Initialize image agents
        this.contextAnalyzer = new ContextAnalyzer(LLM_MODELS.CONTEXT_ANALYZER, apiKey);
        this.visualGenerator = new VisualGenerator(LLM_MODELS.VISUAL_GENERATOR, apiKey);
        this.fluxSpecialist = new FluxSpecialist(LLM_MODELS.FLUX_SPECIALIST, apiKey);
        this.platformOptimizer = new PlatformOptimizer(LLM_MODELS.PLATFORM_OPTIMIZER, apiKey);
        this.coordinator = new Coordinator(LLM_MODELS.COORDINATOR, apiKey);

        // Initialize video agents
        this.videoContextAnalyzer = new VideoContextAnalyzer(LLM_MODELS.CONTEXT_ANALYZER, apiKey);
        this.videoMotionAgent = new VideoMotionAgent(LLM_MODELS.VISUAL_GENERATOR, apiKey);
        this.klingSpecialist = new KlingSpecialist(LLM_MODELS.FLUX_SPECIALIST, apiKey);
        this.videoPlatformOptimizer = new VideoPlatformOptimizer(LLM_MODELS.PLATFORM_OPTIMIZER, apiKey);
        this.videoCoordinator = new VideoCoordinator(LLM_MODELS.COORDINATOR, apiKey);
    }

    async generatePrompt(request: VideoGenerationRequest): Promise<VideoPromptGenerationResult> {
        const startTime = Date.now();
        const agentResponses: AgentResponse[] = [];

        try {
            if (request.content_type === 'image') {
                return await this.generateImagePrompt(request, agentResponses, startTime);
            } else {
                return await this.generateVideoPrompt(request, agentResponses, startTime);
            }
        } catch (error) {
            console.error('❌ Unified prompt generation failed:', error);
            throw new Error(`Prompt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Helper method to convert Platform types
    private mapPlatformForImage(platform: VideoPlatform): ImagePlatform {
        // Map video platforms to image platforms
        switch (platform) {
            case 'youtube_shorts':
                return 'youtube_thumbnail';
            case 'instagram':
            case 'youtube_thumbnail':
            case 'tiktok':
            case 'twitter':
            case 'linkedin':
                return platform;
            default:
                return 'instagram'; // fallback
        }
    }

    private async generateImagePrompt(
        request: VideoGenerationRequest,
        agentResponses: AgentResponse[],
        startTime: number
    ): Promise<VideoPromptGenerationResult> {
        console.log('🖼️ Generating IMAGE prompt...');

        // Convert video request to image context
        const imageContext: ContextData = {
            content_type: 'image',
            industry: 'general',
            objective: 'image_generation',
            audience: 'general',
            visual_style: 'high_quality',
            temporal_context: 'current',
            trending_topics: ['ai_art', 'digital_creation']
        };

        // Step 1: Image context analysis
        console.log('🔍 Analyzing image context...');
        const contextResponse = await this.contextAnalyzer.process(request.user_input);
        agentResponses.push(contextResponse);

        // Step 2: Visual generation
        console.log('🎨 Generating visual base...');
        const visualResponse = await this.visualGenerator.process(imageContext);
        agentResponses.push(visualResponse);

        // Step 3: Parallel processing of image specialists
        console.log('⚡ Processing Flux and Platform specialists in parallel...');
        const mappedPlatform = this.mapPlatformForImage(request.platform);

        const [fluxResponse, platformResponse] = await Promise.all([
            this.fluxSpecialist.process({
                contextData: imageContext,
                basePrompt: visualResponse.content,
                targetModel: request.target_model as FluxModel || 'flux-dev'
            }),
            this.platformOptimizer.process({
                contextData: imageContext,
                basePrompt: visualResponse.content,
                platform: mappedPlatform
            })
        ]);

        agentResponses.push(fluxResponse, platformResponse);

        // Step 4: Final coordination
        console.log('🎯 Coordinating final image prompt...');
        const finalResponse = await this.coordinator.process({
            contextData: JSON.stringify(imageContext),
            visualBase: visualResponse.content,
            techSpecs: fluxResponse.content,
            platformOpts: platformResponse.content,
            targetModel: request.target_model as FluxModel || 'flux-dev',
            platform: mappedPlatform
        });

        agentResponses.push(finalResponse);

        // Calculate final metrics
        const totalProcessingTime = Date.now() - startTime;
        const avgConfidence = agentResponses.reduce((sum, resp) => sum + resp.confidence, 0) / agentResponses.length;
        const estimatedTokens = Math.ceil(finalResponse.content.length / 4);

        // Create video context data for compatibility
        const videoContextData: VideoContextData = {
            ...imageContext,
            video_style: 'static_image',
            motion_type: 'none',
            camera_movement: 'static',
            duration_preference: 'instant',
            narrative_structure: 'single-frame'
        };

        return {
            final_prompt: finalResponse.content,
            metadata: {
                context_data: videoContextData,
                processing_time: totalProcessingTime,
                agents_used: agentResponses.map(r => r.agent_name),
                confidence_score: avgConfidence,
                target_model: request.target_model as FluxModel || 'flux-dev',
                content_type: 'image',
                estimated_tokens: estimatedTokens
            },
            agent_responses: agentResponses
        };
    }

    private async generateVideoPrompt(
        request: VideoGenerationRequest,
        agentResponses: AgentResponse[],
        startTime: number
    ): Promise<VideoPromptGenerationResult> {
        console.log('🎬 Generating VIDEO prompt...');

        // Step 1: Video context analysis
        console.log('🔍 Analyzing video context...');
        const contextResponse = await this.videoContextAnalyzer.process(request.user_input);
        agentResponses.push(contextResponse);

        const contextData: VideoContextData = JSON.parse(contextResponse.content);

        // Step 2: Visual base generation
        console.log('🎨 Generating visual base...');
        const visualResponse = await this.visualGenerator.process(contextData);
        agentResponses.push(visualResponse);

        // Step 3: Motion specifications
        console.log('🎭 Generating motion and cinematography specs...');
        const motionResponse = await this.videoMotionAgent.process(contextData);
        agentResponses.push(motionResponse);

        // Step 4: Parallel processing of video specialists
        console.log('⚡ Processing Kling and Video Platform specialists in parallel...');
        const [klingResponse, videoPlatformResponse] = await Promise.all([
            this.klingSpecialist.process({
                contextData,
                basePrompt: visualResponse.content,
                motionSpecs: motionResponse.content,
                targetModel: request.target_model as KlingModel || 'kling-2-1'
            }),
            this.videoPlatformOptimizer.process({
                contextData,
                basePrompt: visualResponse.content,
                platform: request.platform
            })
        ]);

        agentResponses.push(klingResponse, videoPlatformResponse);

        // Step 5: Final video coordination
        console.log('🎯 Coordinating final Kling-optimized video prompt...');
        const finalResponse = await this.videoCoordinator.process({
            contextData: contextResponse.content,
            visualBase: visualResponse.content,
            motionSpecs: motionResponse.content,
            klingSpecs: klingResponse.content,
            platformOpts: videoPlatformResponse.content,
            targetModel: request.target_model as KlingModel || 'kling-2-1',
            platform: request.platform
        });

        agentResponses.push(finalResponse);

        // Calculate final metrics with video-specific data
        const totalProcessingTime = Date.now() - startTime;
        const avgConfidence = agentResponses.reduce((sum, resp) => sum + resp.confidence, 0) / agentResponses.length;
        const estimatedTokens = Math.ceil(finalResponse.content.length / 4);

        // Extract video specifications
        const videoSpecs = this.extractVideoSpecs(finalResponse.content, contextData, request.target_model as KlingModel);

        return {
            final_prompt: finalResponse.content,
            metadata: {
                context_data: contextData,
                processing_time: totalProcessingTime,
                agents_used: agentResponses.map(r => r.agent_name),
                confidence_score: avgConfidence,
                target_model: request.target_model as KlingModel || 'kling-2-1',
                content_type: 'video',
                estimated_tokens: estimatedTokens,
                video_specs: videoSpecs
            },
            agent_responses: agentResponses
        };
    }

    private extractVideoSpecs(prompt: string, contextData: VideoContextData, model: KlingModel) {
        // Extract video-specific information from the generated prompt
        const durationMap = {
            'kling-1-0': '5 seconds',
            'kling-1-5': '5-10 seconds',
            'kling-1-6': '10 seconds',
            'kling-2-0': '2-3 minutes',
            'kling-2-1': '3 minutes'
        };

        const cameraMovements = [];
        const motionElements = [];

        // Extract camera movements from prompt
        if (prompt.toLowerCase().includes('tracking')) cameraMovements.push('tracking shot');
        if (prompt.toLowerCase().includes('pan')) cameraMovements.push('pan movement');
        if (prompt.toLowerCase().includes('zoom')) cameraMovements.push('zoom');
        if (prompt.toLowerCase().includes('tilt')) cameraMovements.push('tilt');
        if (prompt.toLowerCase().includes('rotating') || prompt.toLowerCase().includes('orbit')) cameraMovements.push('rotation');
        if (prompt.toLowerCase().includes('handheld')) cameraMovements.push('handheld');

        // Extract motion elements
        if (prompt.toLowerCase().includes('slow motion')) motionElements.push('slow motion');
        if (prompt.toLowerCase().includes('motion blur')) motionElements.push('motion blur');
        if (prompt.toLowerCase().includes('dynamic')) motionElements.push('dynamic action');
        if (prompt.toLowerCase().includes('flowing') || prompt.toLowerCase().includes('smooth')) motionElements.push('smooth movement');

        return {
            duration: durationMap[model] || '10 seconds',
            aspect_ratio: this.getAspectRatioFromContext(contextData),
            camera_movements: cameraMovements.length > 0 ? cameraMovements : ['static shot'],
            motion_elements: motionElements.length > 0 ? motionElements : ['natural movement']
        };
    }

    private getAspectRatioFromContext(contextData: VideoContextData): string {
        // Determine aspect ratio based on context and platform preferences
        if (contextData.visual_style?.includes('vertical') || contextData.video_style?.includes('social')) {
            return '9:16';
        } else if (contextData.visual_style?.includes('square')) {
            return '1:1';
        } else {
            return '16:9';
        }
    }

    // Method to generate multiple variations
    async generateVariations(
        request: VideoGenerationRequest,
        count: number = 3
    ): Promise<VideoPromptGenerationResult[]> {
        const variations: VideoPromptGenerationResult[] = [];

        for (let i = 0; i < count; i++) {
            console.log(`🔄 Generating ${request.content_type} variation ${i + 1}/${count}...`);

            const variationRequest = {
                ...request,
                user_input: `${request.user_input} (Variation ${i + 1}: focus on different creative approach for ${request.content_type})`
            };

            const result = await this.generatePrompt(variationRequest);
            variations.push(result);

            // Small pause between generations to avoid rate limits
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return variations;
    }

    // Method to optimize existing prompt
    async optimizeExistingPrompt(
        existingPrompt: string,
        platform: VideoPlatform,
        contentType: ContentType,
        targetModel: FluxModel | KlingModel
    ): Promise<string> {
        try {
            if (contentType === 'image') {
                return await this.optimizeImagePrompt(existingPrompt, platform, targetModel as FluxModel);
            } else {
                return await this.optimizeVideoPrompt(existingPrompt, platform, targetModel as KlingModel);
            }
        } catch (error) {
            console.error(`❌ ${contentType} prompt optimization failed:`, error);
            throw new Error(`${contentType} prompt optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async optimizeImagePrompt(
        existingPrompt: string,
        platform: VideoPlatform,
        targetModel: FluxModel
    ): Promise<string> {
        // Create synthetic context for existing image prompt
        const syntheticContext: ContextData = {
            content_type: 'existing_image_optimization',
            industry: 'general',
            objective: 'optimization',
            audience: 'general',
            visual_style: 'existing',
            temporal_context: 'current',
            trending_topics: ['optimization']
        };

        const mappedPlatform = this.mapPlatformForImage(platform);

        const [fluxResponse, platformResponse] = await Promise.all([
            this.fluxSpecialist.process({
                contextData: syntheticContext,
                basePrompt: existingPrompt,
                targetModel
            }),
            this.platformOptimizer.process({
                contextData: syntheticContext,
                basePrompt: existingPrompt,
                platform: mappedPlatform
            })
        ]);

        const finalResponse = await this.coordinator.process({
            contextData: JSON.stringify(syntheticContext),
            visualBase: existingPrompt,
            techSpecs: fluxResponse.content,
            platformOpts: platformResponse.content,
            targetModel,
            platform: mappedPlatform
        });

        return finalResponse.content;
    }

    private async optimizeVideoPrompt(
        existingPrompt: string,
        platform: VideoPlatform,
        targetModel: KlingModel
    ): Promise<string> {
        // Create synthetic context for existing video prompt
        const syntheticContext: VideoContextData = {
            content_type: 'existing_video_optimization',
            industry: 'general',
            objective: 'optimization',
            audience: 'general',
            visual_style: 'existing',
            video_style: 'existing',
            motion_type: 'existing',
            camera_movement: 'existing',
            duration_preference: 'medium',
            narrative_structure: 'single-shot',
            temporal_context: 'current',
            trending_topics: ['optimization']
        };

        // Generate motion specs for the existing prompt
        const motionResponse = await this.videoMotionAgent.process(syntheticContext);

        const [klingResponse, videoPlatformResponse] = await Promise.all([
            this.klingSpecialist.process({
                contextData: syntheticContext,
                basePrompt: existingPrompt,
                motionSpecs: motionResponse.content,
                targetModel
            }),
            this.videoPlatformOptimizer.process({
                contextData: syntheticContext,
                basePrompt: existingPrompt,
                platform
            })
        ]);

        const finalResponse = await this.videoCoordinator.process({
            contextData: JSON.stringify(syntheticContext),
            visualBase: existingPrompt,
            motionSpecs: motionResponse.content,
            klingSpecs: klingResponse.content,
            platformOpts: videoPlatformResponse.content,
            targetModel,
            platform
        });

        return finalResponse.content;
    }
}