import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDbClient } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail, type EmailBindings } from "./email";
import { renderVerificationEmailTemplate } from "./email/templates/verification";
import { renderResetPasswordEmailTemplate } from "./email/templates/reset-password";
import { uploadToR2, type StorageEnv } from "./storage";

export interface AuthEnv extends EmailBindings, Partial<StorageEnv> {
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
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          input: false,
        },
        username: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
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
      crossSubDomainCookies: {
        enabled: true,
        domain: env.BETTER_AUTH_URL?.includes("localhost") ? undefined : ".komikhq.com",
      },
      defaultCookieAttributes: {
        domain: env.BETTER_AUTH_URL?.includes("localhost") ? undefined : ".komikhq.com",
        sameSite: "lax",
        secure: true,
        httpOnly: true,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.image) return;

            const isExternalAvatar =
              /googleusercontent\.com|ggpht\.com|google\.com/i.test(user.image) ||
              (user.image.startsWith("http") &&
                Boolean(env.USERS_BUCKET_URL) &&
                !user.image.includes(env.USERS_BUCKET_URL!));

            if (isExternalAvatar && env.USERS_BUCKET) {
              try {
                const res = await fetch(user.image);
                if (res.ok) {
                  const contentType = res.headers.get("content-type") || "image/jpeg";
                  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
                  const arrayBuffer = await res.arrayBuffer();
                  const objectKey = `avatars/google-${user.id || Date.now()}.${ext}`;

                  const publicUrl = await uploadToR2(
                    env as StorageEnv,
                    "users",
                    objectKey,
                    arrayBuffer,
                    { contentType }
                  );

                  return {
                    data: {
                      ...user,
                      image: publicUrl,
                    },
                  };
                }
              } catch (e) {
                console.error("[Auth] Failed to mirror external Google avatar to R2:", e);
              }
            }
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
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
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }: { user: { name?: string | null; email: string }; url: string }) => {
        try {
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
          console.log(`[Auth] Verification email successfully sent to ${user.email}`);
        } catch (err) {
          console.error(`[Auth Error] Failed to send verification email to ${user.email}:`, err);
          throw err;
        }
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || "",
        clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        enabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
        prompt: "select_account consent",
        accessType: "offline",
        scope: ["openid", "profile", "email"],
        mapProfileToUser: async (profile) => {
          return {
            image: profile.picture || (profile as any).avatar_url || null,
          };
        },
      },
    },
  });
}
