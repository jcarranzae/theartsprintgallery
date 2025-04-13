-- Crear la tabla media_asset_relations
CREATE TABLE IF NOT EXISTS media_asset_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id UUID NOT NULL,
  related_table TEXT NOT NULL,
  related_id INTEGER NOT NULL,
  relation_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agregar la restricción de clave foránea después de crear la tabla
DO $$ BEGIN
  ALTER TABLE media_asset_relations 
  ADD CONSTRAINT media_asset_relations_media_asset_id_fk 
  FOREIGN KEY (media_asset_id) 
  REFERENCES images(id) 
  ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$; 