import { betterAuth } from "better-auth";
import { Pool } from "pg";

// CLI-only mirror of the persistent Better Auth schema configuration.
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL,
    options: "-c search_path=lms,public",
  }),
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "learner", input: false },
      privacyAccepted: { type: "boolean", required: true },
      termsAccepted: { type: "boolean", required: true },
      privacyNoticeVersion: { type: "string", required: true },
      termsVersion: { type: "string", required: true },
      privacyAcceptedAt: { type: "date", required: false, input: false },
      termsAcceptedAt: { type: "date", required: false, input: false },
    },
  },
  rateLimit: { enabled: true, storage: "database", modelName: "auth_rate_limit" },
  advanced: { database: { generateId: "uuid" } },
});
