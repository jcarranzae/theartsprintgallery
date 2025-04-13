CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(100),
	"prompt" varchar(2055) NOT NULL,
	"original_name" text NOT NULL,
	"image_id" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"likes" integer
);
