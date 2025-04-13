import axios, { AxiosError } from 'axios';
import { FinetuneRequest, FinetuneResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Primero, veamos si las variables de entorno se están cargando
console.log('API_BASE_URL:', API_BASE_URL);
console.log('API_KEY:', process.env.NEXT_PUBLIC_API_KEY);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Key': `${process.env.NEXT_PUBLIC_API_KEY}`
  }
});

// Interceptor más simple para debugging
api.interceptors.request.use(
  (config) => {
    console.log('Realizando petición a:', config.url);
    console.log('Con headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Error en la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.data);
    return response;
  },
  (error) => {
    console.error('Error en la respuesta:', error.response?.data);
    return Promise.reject(error);
  }
);

export class BFLApi {
  constructor() {
    // Ya no necesitamos el constructor que recibe apiKey
  }

  async requestFinetuning(zipFile: File, params: Partial<FinetuneRequest>): Promise<FinetuneResponse> {
    try {
      const fileData = await this.fileToBase64(zipFile);
      
      const payload: FinetuneRequest = {
        finetune_comment: params.finetune_comment || '',
        trigger_word: params.trigger_word || 'TOK',
        file_data: fileData,
        iterations: params.iterations || 300,
        mode: params.mode || 'general',
        learning_rate: params.learning_rate || 0.00001,
        captioning: params.captioning ?? true,
        priority: params.priority || 'quality',
        lora_rank: params.lora_rank || 32,
        finetune_type: params.finetune_type || 'full',
      };

      console.log('Enviando solicitud:', payload);
      const response = await api.post('/finetune', payload);
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error en la solicitud:', error.response?.data || error);
      } else {
        console.error('Error desconocido:', error);
      }
      throw error;
    }
  }

  async getFinetuneProgress(finetuneId: string): Promise<FinetuneResponse> {
    try {
      const response = await api.get('/get_result', {
        params: { id: finetuneId },
      });
      console.log('Progreso del finetune:', response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error al obtener progreso:', error.response?.data || error);
      } else {
        console.error('Error desconocido:', error);
      }
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });
  }
} 