CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" varchar(16) DEFAULT 'not_started' NOT NULL,
	"last_position_seconds" integer DEFAULT 0 NOT NULL,
	"watched_ranges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_heartbeat_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_status_valid" CHECK ("lesson_progress"."status" IN ('not_started', 'in_progress', 'completed')),
	CONSTRAINT "lesson_progress_position_valid" CHECK ("lesson_progress"."last_position_seconds" >= 0)
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "video_completion_percent" integer DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "text_completion_mode" varchar(16) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_user_lesson_unique" ON "lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_lesson_idx" ON "lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_video_completion_percent_valid" CHECK ("courses"."video_completion_percent" BETWEEN 50 AND 100);--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_text_completion_mode_valid" CHECK ("courses"."text_completion_mode" IN ('manual', 'on_open'));