import { pgTable, uuid, text, timestamp, bigint, jsonb, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const mediaTypes = ['IMAGE', 'VIDEO', 'AUDIO'] as const;

export const images = pgTable('images', {
  id: uuid('id').defaultRandom().primaryKey(),
  bucketPath: text('bucket_path').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type', { enum: mediaTypes }).notNull(),
  mimeType: text('mime_type').notNull(),
  sizeInBytes: bigint('size_in_bytes', { mode: 'number' }),
  metadata: jsonb('metadata'),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const mediaAssetRelations = pgTable('media_asset_relations', {
  id: uuid('id').defaultRandom().primaryKey(),
  mediaAssetId: uuid('media_asset_id').notNull(),
  relatedTable: text('related_table').notNull(),
  relatedId: integer('related_id').notNull(),
  relationType: text('relation_type').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
