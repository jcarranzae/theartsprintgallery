// lib/agents/base-agent.ts
import { AgentResponse } from '@/types/agents';

export abstract class BaseAgent {
  protected model: string;
  protected apiKey: string;

  constructor(model: string, apiKey: string) {
    this.model = model;
    this.apiKey = apiKey;
  }

  protected async callLLM(prompt: string, temperature = 0.7): Promise<string> {
    try {
      console.log(`🤖 Calling ${this.model} with prompt length: ${prompt.length}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 1000
        })
      });

      // Debugging detallado de la respuesta
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Intentar obtener más detalles del error
        let errorDetails = 'No additional details';
        try {
          const errorBody = await response.json();
          errorDetails = JSON.stringify(errorBody, null, 2);
          console.error('❌ OpenAI API Error Details:', errorDetails);
        } catch (parseError) {
          console.error('❌ Could not parse error response');
        }
        
        throw new Error(`API call failed: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI API');
      }
      
      console.log(`✅ ${this.model} response received successfully`);
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error(`❌ Error calling LLM (${this.model}):`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to OpenAI API. Check your internet connection.');
      }
      
      throw error;
    }
  }

  abstract process(input: any): Promise<AgentResponse>;
}