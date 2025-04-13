import { MediaService } from '@/lib/services/mediaService';
import { signToken } from '@/lib/auth/session';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testMusicGeneration() {
  try {
    const testData = {
      prompt: "Una canción relajante con piano y violín",
      model: "stable-audio",
      duration: 30, // duración en segundos
      num_samples: 1 // número de muestras a generar
    };

    const apiKey = process.env.NEXT_PUBLIC_AIML_API_KEY;
    console.log('API Key length:', apiKey?.length);
    console.log('API Key starts with:', apiKey?.substring(0, 4));
    
    if (!apiKey) {
      throw new Error('API key no encontrada');
    }

    const response = await fetch('https://api.aimlapi.com/v2/generate/audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error en la API: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Música generada exitosamente:', result);

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testMusicGeneration(); 