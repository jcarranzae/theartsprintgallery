import axios from 'axios';
import { API_CONFIG } from '@/config/constants';
import { GenerateImageResponse, ImageResult, KlingAiRequest, ModelType } from '@/types/api';
import { MODELS } from '@/types/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AIML_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Key': process.env.NEXT_PUBLIC_AIML_API_KEY
  },
});

export const videoService = {
  async generateVideo(request: KlingAiRequest, model: ModelType): Promise<GenerateImageResponse> {
   //const zbaseURL= process.env.NEXT_PUBLIC_BFL_BASE_URL
    const endpoint = model === MODELS.KLING_AI_16PRO 
      ? API_CONFIG.KLING_AI_16PRO
      : API_CONFIG.ENDPOINTS.FLUX_PRO_ULTRA;
     // console.log(`🚀 Url destino: ${zbaseURL}:`, request);
   // console.log(`🚀 Iniciando petición a ${endpoint}:`, request);
    const { data } = await api.post(endpoint, request);
    console.log('✅ Respuesta:', data);
    return data;
  },

  async getVideoResult(id: string): Promise<ImageResult> {
    console.log('🔍 Consultando estado de imagen:', id);
    const { data } = await api.get(API_CONFIG.ENDPOINTS.GET_RESULT, {
      params: { id },
    });
    console.log('📊 Estado actual:', data);
    return data;
  },

  async pollImageResult(id: string): Promise<ImageResult> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const result = await this.getImageResult(id);
          console.log('📊 Estado actual:', result);
          
          if (result.status === 'Ready' && result.result?.sample) {
            const imageUrl = result.result.sample;
            console.log('✅ URL de la imagen:', imageUrl);
            
            const finalResult: ImageResult = {
              ...result,
              url: imageUrl
            };
            
            resolve(finalResult);
            return;
          } 
          
          if (result.status === 'error') {
            console.error('❌ Error en la generación');
            reject(new Error('Error en la generación de la imagen'));
            return;
          }
          
          console.log('⏳ Esperando resultado...');
          setTimeout(checkStatus, API_CONFIG.POLLING_INTERVAL);
        } catch (error) {
          console.error('❌ Error en la petición:', error);
          reject(error);
        }
      };
      checkStatus();
    });
  },
}; 