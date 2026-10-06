CREATE TABLE "certificate_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(24) NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificate_audit_action_valid" CHECK ("certificate_audit_logs"."action" IN ('issued', 'revoked', 'generation_failed'))
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"completion_id" uuid NOT NULL,
	"public_certificate_id" varchar(64) NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"object_key" varchar(512) NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_by" uuid,
	"revocation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_status_valid" CHECK ("certificates"."status" IN ('pending', 'processing', 'ready', 'failed', 'revoked')),
	CONSTRAINT "certificates_revocation_valid" CHECK (("certificates"."status" <> 'revoked') OR ("certificates"."revoked_at" IS NOT NULL AND "certificates"."revocation_reason" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "course_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"learner_name_snapshot" varchar(120) NOT NULL,
	"course_title_snapshot" varchar(160) NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certificate_audit_logs" ADD CONSTRAINT "certificate_audit_logs_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_audit_logs" ADD CONSTRAINT "certificate_audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_completion_id_course_completions_id_fk" FOREIGN KEY ("completion_id") REFERENCES "public"."course_completions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_revoked_by_users_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_completions" ADD CONSTRAINT "course_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_completions" ADD CONSTRAINT "course_completions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_completions" ADD CONSTRAINT "course_completions_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "certificate_audit_certificate_created_idx" ON "certificate_audit_logs" USING btree ("certificate_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_completion_unique" ON "certificates" USING btree ("completion_id");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_public_id_unique" ON "certificates" USING btree ("public_certificate_id");--> statement-breakpoint
CREATE INDEX "certificates_status_issued_idx" ON "certificates" USING btree ("status","issued_at");--> statement-breakpoint
CREATE UNIQUE INDEX "course_completions_enrollment_unique" ON "course_completions" USING btree ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_completions_user_course_unique" ON "course_completions" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "course_completions_completed_idx" ON "course_completions" USING btree ("completed_at");