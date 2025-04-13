import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db/drizzle';
import { aiMediaAssets, aiMediaAssetRelations } from '@/db/schema/ai';
import { eq } from 'drizzle-orm';

export class MediaService {
  private supabase;
  private readonly BUCKET_NAME = 'ai-generated-media';

  constructor() {
    // Usar service_role_key para bypass RLS
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );
  }

  async uploadAudioFromUrl({
    audioUrl,
    userId,
    metadata,
    relatedTable,
    relatedId
  }: {
    audioUrl: string;
    userId: number;
    metadata: Record<string, any>;
    relatedTable: string;
    relatedId: number;
  }) {
    try {
      if (!audioUrl) {
        throw new Error('URL de audio no proporcionada');
      }

      console.log('📥 Descargando audio de:', audioUrl);
      
      // Descargar el audio de la URL
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Error al descargar el audio: ${response.statusText}`);
      }
      
      const audioBuffer = await response.arrayBuffer();
      console.log('✅ Audio descargado correctamente');

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
      const filePath = `${userId}/${fileName}`;

      // Subir a Supabase
      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = this.supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Primero crear el asset
      const [asset] = await db.insert(aiMediaAssets).values({
        bucketPath: data.path,
        fileName,
        fileType: 'AUDIO',
        mimeType: 'audio/mpeg',
        sizeInBytes: audioBuffer.byteLength,
        metadata,
        userId
      }).returning();

      // Luego crear la relación
      const [relation] = await db.insert(aiMediaAssetRelations).values({
        mediaAssetId: asset.id,
        relatedTable,
        relatedId,
        relationType: 'GENERATED_BY_AI'
      }).returning();

      return {
        ...asset,
        relation,
        publicUrl
      };
    } catch (error) {
      console.error('❌ Error en uploadAudioFromUrl:', error);
      throw error;
    }
  }

  getPublicUrl(bucketPath: string) {
    const { data } = this.supabase
      .storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(bucketPath);
    
    return data.publicUrl;
  }

  async deleteMedia(mediaId: string) {
    try {
      // Primero obtener el asset para saber el bucketPath
      const [asset] = await db
        .select()
        .from(aiMediaAssets)
        .where(eq(aiMediaAssets.id, mediaId));

      if (asset) {
        // Eliminar archivo de Storage
        await this.supabase
          .storage
          .from(this.BUCKET_NAME)
          .remove([asset.bucketPath]);

        // Eliminar relaciones
        await db.delete(aiMediaAssetRelations)
          .where(eq(aiMediaAssetRelations.mediaAssetId, mediaId));

        // Eliminar asset
        await db.delete(aiMediaAssets)
          .where(eq(aiMediaAssets.id, mediaId));
      }

      return true;
    } catch (error) {
      console.error('Error en deleteMedia:', error);
      throw error;
    }
  }
}
