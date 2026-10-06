CREATE INDEX "certificate_audit_created_idx" ON "certificate_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "enrollments_last_accessed_at_idx" ON "enrollments" USING btree ("last_accessed_at");--> statement-breakpoint
CREATE INDEX "enrollments_enrolled_at_idx" ON "enrollments" USING btree ("enrolled_at");--> statement-breakpoint
CREATE INDEX "quiz_attempts_submitted_at_idx" ON "quiz_attempts" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");