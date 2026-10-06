CREATE TABLE "course_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(180) NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"certificate_enabled" boolean DEFAULT false NOT NULL,
	"quiz_enabled" boolean DEFAULT false NOT NULL,
	"quiz_required" boolean DEFAULT false NOT NULL,
	"quiz_pass_percent" integer DEFAULT 70 NOT NULL,
	"created_by" uuid NOT NULL,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_status_valid" CHECK ("courses"."status" IN ('draft', 'published', 'archived')),
	CONSTRAINT "courses_quiz_config_valid" CHECK (NOT "courses"."quiz_required" OR "courses"."quiz_enabled"),
	CONSTRAINT "courses_quiz_pass_percent_valid" CHECK ("courses"."quiz_pass_percent" BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text,
	"type" varchar(16) NOT NULL,
	"content" text,
	"required" boolean DEFAULT true NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lessons_type_valid" CHECK ("lessons"."type" IN ('VIDEO', 'PDF', 'TEXT'))
);
--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_modules_course_order_unique" ON "course_modules" USING btree ("course_id","sort_order");--> statement-breakpoint
CREATE INDEX "course_modules_course_idx" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_slug_unique" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "courses_status_idx" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_module_order_unique" ON "lessons" USING btree ("module_id","sort_order");--> statement-breakpoint
CREATE INDEX "lessons_module_idx" ON "lessons" USING btree ("module_id");--> statement-breakpoint
INSERT INTO "permissions" ("code", "description") VALUES
  ('admin:courses:manage', 'Create and manage courses')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."code" = 'SUPER_ADMIN' AND p."code" = 'admin:courses:manage'
ON CONFLICT DO NOTHING;
