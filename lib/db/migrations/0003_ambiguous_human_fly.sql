CREATE TABLE IF NOT EXISTS "ai_media_asset_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid,
	"related_table" text NOT NULL,
	"related_id" integer NOT NULL,
	"relation_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_in_bytes" bigint,
	"metadata" jsonb,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "media_asset_relations" CASCADE;--> statement-breakpoint
DROP TABLE "media_assets" CASCADE;--> statement-breakpoint
ALTER TABLE "ai_media_asset_relations" ADD CONSTRAINT "ai_media_asset_relations_media_asset_id_ai_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."ai_media_assets"("id") ON DELETE no action ON UPDATE no action;