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
      // Paso 1: Análisis de contexto
      console.log('🔍 Analyzing context...');
      const contextResponse = await this.contextAnalyzer.process(request.user_input);
      agentResponses.push(contextResponse);
      
      const contextData: ContextData = JSON.parse(contextResponse.content);

      // Paso 2: Generación visual base
      console.log('🎨 Generating visual base...');
      const visualResponse = await this.visualGenerator.process(contextData);
      agentResponses.push(visualResponse);

      // Paso 3: Procesamiento paralelo de especialistas
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

      // Paso 4: Coordinación final
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

      // Calcular métricas finales
      const totalProcessingTime = Date.now() - startTime;
      const avgConfidence = agentResponses.reduce((sum, resp) => sum + resp.confidence, 0) / agentResponses.length;
      const estimatedTokens = Math.ceil(finalResponse.content.length / 4); // Estimación aproximada

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

  // Método para generar múltiples variaciones
  async generateVariations(
    request: PromptGenerationRequest, 
    count: number = 3
  ): Promise<PromptGenerationResult[]> {
    const variations: PromptGenerationResult[] = [];
    
    for (let i = 0; i < count; i++) {
      console.log(`🔄 Generating variation ${i + 1}/${count}...`);
      
      // Añadir variación al request original
      const variationRequest = {
        ...request,
        user_input: `${request.user_input} (Variation ${i + 1}: focus on different creative approach)`
      };
      
      const result = await this.generatePrompt(variationRequest);
      variations.push(result);
      
      // Pequeña pausa entre generaciones para evitar rate limits
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return variations;
  }

  // Método para optimizar un prompt existente
  async optimizeExistingPrompt(
    existingPrompt: string,
    platform: Platform,
    targetModel: FluxModel = 'flux-pro'
  ): Promise<string> {
    try {
      // Crear contexto sintético del prompt existente
      const syntheticContext: ContextData = {
        tipo_contenido: 'existing_prompt_optimization',
        industria: 'general',
        objetivo: 'optimization',
        audiencia: 'general',
        estilo_visual: 'existing',
        contexto_temporal: 'current',
        trending_topics: ['optimization']
      };

      // Aplicar especializaciones Flux
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

      // Coordinar resultado final
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