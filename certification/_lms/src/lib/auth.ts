import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { Pool } from "pg";
import { isEmailDeliveryConfigured, sendAuthEmail } from "@/lib/mail";
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from "@/lib/auth-versions";

const buildOnlyDatabaseUrl = "postgresql://build:build@127.0.0.1:5432/centaur_lms";
const databaseGlobal = globalThis as typeof globalThis & { lmsAuthPool?: Pool };
const authDatabase = databaseGlobal.lmsAuthPool ?? new Pool({
  connectionString: process.env.DATABASE_URL ?? buildOnlyDatabaseUrl,
  options: "-c search_path=lms,public",
  max: 4,
  connectionTimeoutMillis: 2500,
  idleTimeoutMillis: 10000,
});
databaseGlobal.lmsAuthPool = authDatabase;

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const developmentSecret = "local-only-better-auth-secret-change-before-any-deployment";
const authSecret = process.env.BETTER_AUTH_SECRET ?? developmentSecret;

export function isAuthEnabled() {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.LMS_AUTH_ENABLED === "true"
    && process.env.BETTER_AUTH_SECRET !== undefined
    && process.env.BETTER_AUTH_SECRET.length >= 32
    && baseURL.startsWith("https://")
    && isEmailDeliveryConfigured();
}

export const auth = betterAuth({
  database: authDatabase,
  secret: authSecret,
  baseURL,
  basePath: "/api/auth",
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    minPasswordLength: 15,
    maxPasswordLength: 128,
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your Centaur Learning password",
        text: "A password reset was requested for your Centaur Learning account. If you made this request, use this one-time link within one hour. If you did not request it, you can ignore this message.",
        actionUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    expiresIn: 24 * 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Verify your Centaur Learning email",
        text: "Confirm that this email address belongs to you to activate your learner account. This link expires in 24 hours. If you did not create an account, you can ignore this message.",
        actionUrl: url,
      });
    },
  },
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const consent = user as typeof user & {
            privacyAccepted?: boolean;
            termsAccepted?: boolean;
            privacyNoticeVersion?: string;
            termsVersion?: string;
          };
          if (consent.privacyAccepted !== true || consent.termsAccepted !== true
            || consent.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION || consent.termsVersion !== TERMS_VERSION) {
            throw new APIError("BAD_REQUEST", { message: "Accept the current privacy notice and terms to create an account." });
          }
          const acceptedAt = new Date();
          return { data: { ...user, role: "learner", privacyAcceptedAt: acceptedAt, termsAcceptedAt: acceptedAt } };
        },
        after: async (user) => {
          const client = await authDatabase.connect();
          try {
            await client.query("BEGIN");
            await client.query("SELECT set_config('lms.current_learner_id', $1, true)", [user.id]);
            await client.query("INSERT INTO lms.profiles (user_id, display_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING", [user.id, user.name]);
            await client.query("INSERT INTO lms.user_roles (user_id, role) VALUES ($1, 'learner') ON CONFLICT (user_id, role) DO NOTHING", [user.id]);
            await client.query("COMMIT");
          } catch (error) {
            await client.query("ROLLBACK").catch(() => {});
            console.error(JSON.stringify({ level: "error", event: "auth.user_profile.bootstrap_failed", errorName: error instanceof Error ? error.name : "UnknownError" }));
            throw error;
          } finally {
            client.release();
          }
        },
      },
    },
  },
  session: { expiresIn: 7 * 24 * 60 * 60, updateAge: 60 * 60, disableSessionRefresh: false },
  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "auth_rate_limit",
    window: 60,
    max: 30,
    customRules: {
      "/sign-up/email": { window: 60 * 60, max: 5 },
      "/sign-in/email": { window: 15 * 60, max: 10 },
      "/request-password-reset": { window: 60 * 60, max: 4 },
      "/reset-password": { window: 15 * 60, max: 8 },
      "/send-verification-email": { window: 60 * 60, max: 4 },
    },
  },
  advanced: { database: { generateId: "uuid" } },
});
