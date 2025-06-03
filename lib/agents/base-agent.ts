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
  
        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }
  
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error(`Error calling LLM: ${error}`);
        throw error;
      }
    }
  
    abstract process(input: any): Promise<AgentResponse>;
  }
  
  