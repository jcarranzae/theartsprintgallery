// lib/prompt-agent-system.ts
import { ContextAnalyzer } from './agents/context-analyzer';
import { VisualGenerator } from './agents/visual-generator';
import { FluxSpecialist } from './agents/flux-specialist';
import { PlatformOptimizer } from './agents/platform-optimizer';
import { Coordinator } from './agents/coordinator';
import { 
  PromptGenerationRequest, 
  AgentResponse, 
  ContextData,
  Platform,
  FluxModel 
} from '@/types/agents';
import { LLM_MODELS } from '@/config/models';

export interface PromptGenerationResult {
  final_prompt: string;
  metadata: {
    context_data: ContextData;
    processing_time: number;
    agents_used: string[];
    confidence_score: number;
    flux_model: FluxModel;
    estimated_tokens: number;
  };
  agent_responses: AgentResponse[];
}

export class PromptAgentSystem {
  private contextAnalyzer: ContextAnalyzer;
  private visualGenerator: VisualGenerator;
  private fluxSpecialist: FluxSpecialist;
  private platformOptimizer: PlatformOptimizer;
  private coordinator: Coordinator;

  constructor(apiKey: string) {
    this.contextAnalyzer = new ContextAnalyzer(LLM_MODELS.CONTEXT_ANALYZER, apiKey);
    this.visualGenerator = new VisualGenerator(LLM_MODELS.VISUAL_GENERATOR, apiKey);
    this.fluxSpecialist = new FluxSpecialist(LLM_MODELS.FLUX_SPECIALIST, apiKey);
    this.platformOptimizer = new PlatformOptimizer(LLM_MODELS.PLATFORM_OPTIMIZER, apiKey);
    this.coordinator = new Coordinator(LLM_MODELS.COORDINATOR, apiKey);
  }

  async generatePrompt(request: PromptGenerationRequest): Promise<PromptGenerationResult> {
    const startTime = Date.now();
    const agentResponses: AgentResponse[] = [];

    try {
      // Step 1: Context analysis
      console.log('🔍 Analyzing context...');
      const contextResponse = await this.contextAnalyzer.process(request.user_input);
      agentResponses.push(contextResponse);
      
      const contextData: ContextData = JSON.parse(contextResponse.content);

      // Step 2: Base visual generation
      console.log('🎨 Generating visual base...');
      const visualResponse = await this.visualGenerator.process(contextData);
      agentResponses.push(visualResponse);

      // Step 3: Parallel processing of specialists
      console.log('⚡ Processing Flux and Platform specialists in parallel...');
      const [fluxResponse, platformResponse] = await Promise.all([
        this.fluxSpecialist.process({
          contextData,
          basePrompt: visualResponse.content,
          targetModel: request.target_model || 'flux-pro'
        }),
        this.platformOptimizer.process({
          contextData,
          basePrompt: visualResponse.content,
          platform: request.platform
        })
      ]);

      agentResponses.push(fluxResponse, platformResponse);

      // Step 4: Final coordination
      console.log('🎯 Coordinating final Flux-optimized prompt...');
      const finalResponse = await this.coordinator.process({
        contextData: contextResponse.content,
        visualBase: visualResponse.content,
        techSpecs: fluxResponse.content,
        platformOpts: platformResponse.content,
        targetModel: request.target_model || 'flux-pro',
        platform: request.platform
      });

      agentResponses.push(finalResponse);

      // Calculate final metrics
      const totalProcessingTime = Date.now() - startTime;
      const avgConfidence = agentResponses.reduce((sum, resp) => sum + resp.confidence, 0) / agentResponses.length;
      const estimatedTokens = Math.ceil(finalResponse.content.length / 4); // Rough estimation

      return {
        final_prompt: finalResponse.content,
        metadata: {
          context_data: contextData,
          processing_time: totalProcessingTime,
          agents_used: agentResponses.map(r => r.agent_name),
          confidence_score: avgConfidence,
          flux_model: request.target_model || 'flux-pro',
          estimated_tokens: estimatedTokens
        },
        agent_responses: agentResponses
      };

    } catch (error) {
      console.error('❌ Prompt generation failed:', error);
      throw new Error(`Prompt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Method to generate multiple variations
  async generateVariations(
    request: PromptGenerationRequest, 
    count: number = 3
  ): Promise<PromptGenerationResult[]> {
    const variations: PromptGenerationResult[] = [];
    
    for (let i = 0; i < count; i++) {
      console.log(`🔄 Generating variation ${i + 1}/${count}...`);
      
      // Add variation to original request
      const variationRequest = {
        ...request,
        user_input: `${request.user_input} (Variation ${i + 1}: focus on different creative approach)`
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
    platform: Platform,
    targetModel: FluxModel = 'flux-pro'
  ): Promise<string> {
    try {
      // Create synthetic context from existing prompt
      const syntheticContext: ContextData = {
        content_type: 'existing_prompt_optimization',
        industry: 'general',
        objective: 'optimization',
        audience: 'general',
        visual_style: 'existing',
        temporal_context: 'current',
        trending_topics: ['optimization']
      };

      // Apply Flux specializations
      const [fluxResponse, platformResponse] = await Promise.all([
        this.fluxSpecialist.process({
          contextData: syntheticContext,
          basePrompt: existingPrompt,
          targetModel
        }),
        this.platformOptimizer.process({
          contextData: syntheticContext,
          basePrompt: existingPrompt,
          platform
        })
      ]);

      // Coordinate final result
      const finalResponse = await this.coordinator.process({
        contextData: JSON.stringify(syntheticContext),
        visualBase: existingPrompt,
        techSpecs: fluxResponse.content,
        platformOpts: platformResponse.content,
        targetModel,
        platform
      });

      return finalResponse.content;
    } catch (error) {
      console.error('❌ Flux prompt optimization failed:', error);
      throw new Error(`Flux prompt optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}