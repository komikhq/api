import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDbClient } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail, type EmailBindings } from "./email";
import { renderVerificationEmailTemplate } from "./email/templates/verification";
import { renderResetPasswordEmailTemplate } from "./email/templates/reset-password";

export interface AuthEnv extends EmailBindings {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

export function getAuth(env: AuthEnv) {
  const db = createDbClient(env.DATABASE_URL);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || "https://api.komikhq.com",
    basePath: "/v1/auth",
    trustedOrigins: [
      "https://komikhq.com",
      "https://www.komikhq.com",
      "http://localhost:4321",
      "http://localhost:3000",
    ],
    advanced: {
      cookiePrefix: "komikhq",
      useSecureCookies: false,
      defaultCookieAttributes: {
        domain: env.BETTER_AUTH_URL?.includes("localhost") ? undefined : ".komikhq.com",
        sameSite: "lax",
        secure: true,
        httpOnly: true,
      },
    },
    emailAndPassword: {
      enabled: true,
      sendVerificationEmail: async ({ user, url }: { user: { name?: string | null; email: string }; url: string }) => {
        const { subject, html, text } = renderVerificationEmailTemplate({
          userName: user.name || "Pembaca KomikHQ",
          verificationUrl: url,
        });
        await sendEmail(env, {
          to: user.email,
          subject,
          html,
          text,
        });
      },
      sendResetPassword: async ({ user, url }: { user: { name?: string | null; email: string }; url: string }) => {
        const { subject, html, text } = renderResetPasswordEmailTemplate({
          userName: user.name || "Pembaca KomikHQ",
          resetUrl: url,
        });
        await sendEmail(env, {
          to: user.email,
          subject,
          html,
          text,
        });
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || "",
        clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        enabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
        prompt: "select_account consent",
        accessType: "offline",
      },
    },
  });
}
