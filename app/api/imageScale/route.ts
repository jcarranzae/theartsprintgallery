import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { imageUrl, scale } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Se requiere una URL de imagen' },
        { status: 400 }
      );
    }

    // Iniciar la predicción con Replicate
    const prediction = await replicate.predictions.create({
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      input: {
        img: imageUrl,
        upscale: scale || 2,
        face_enhance: true,
        model_type: "PHOTO"
      }
    });

    // Esperar a que la predicción se complete
    let result = await replicate.wait(prediction);

    // Asegurarnos de que tenemos una URL válida
    if (!result || !result.output) {
      console.error('Respuesta inesperada de Replicate:', result);
      return NextResponse.json(
        { error: 'Respuesta inválida del servicio de escalado' },
        { status: 500 }
      );
    }
   
    return NextResponse.json({ output: result.output });
  } catch (error: any) {
    console.error('Error en imageScale:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la imagen' },
      { status: 500 }
    );
  }
} 