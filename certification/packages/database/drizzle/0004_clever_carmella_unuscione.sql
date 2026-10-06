CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"kind" varchar(16) NOT NULL,
	"status" varchar(16) DEFAULT 'uploading' NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"source_key" varchar(512) NOT NULL,
	"upload_id" varchar(512),
	"source_size_bytes" bigint NOT NULL,
	"output_prefix" varchar(512),
	"output_size_bytes" bigint,
	"duration_seconds" integer,
	"width" integer,
	"height" integer,
	"poster_key" varchar(512),
	"error_code" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "media_assets_kind_valid" CHECK ("media_assets"."kind" IN ('VIDEO', 'PDF')),
	CONSTRAINT "media_assets_status_valid" CHECK ("media_assets"."status" IN ('uploading', 'processing', 'ready', 'failed', 'aborted')),
	CONSTRAINT "media_assets_size_valid" CHECK ("media_assets"."source_size_bytes" > 0)
);
--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_assets_lesson_created_idx" ON "media_assets" USING btree ("lesson_id","created_at");--> statement-breakpoint
CREATE INDEX "media_assets_status_updated_idx" ON "media_assets" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_source_key_unique" ON "media_assets" USING btree ("source_key");