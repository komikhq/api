import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getAuth } from "@/lib/auth";
import type { AppEnv } from "@/middleware/auth";
import { getCookie } from "hono/cookie";
import { toPublicUrl } from "@/lib/storage";
import { CommonErrorResponses } from "@/schemas/common";

const AuthResponseSchema = z.unknown();
const authOperations = [
  createRoute({
    method: "get",
    path: "/get-session",
    tags: ["Authentication"],
    operationId: "getAuthSession",
    summary: "Get the current authentication session",
    description: "Returns the current Better Auth session, or null when no session exists.",
    responses: {
      200: {
        description: "The current session.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      500: CommonErrorResponses[500],
    },
  }),
  createRoute({
    method: "post",
    path: "/sign-in/email",
    tags: ["Authentication"],
    operationId: "signInWithEmail",
    summary: "Sign in with email and password",
    description: "Authenticates a user and sets the session cookie.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({
                email: z.string().email(),
                password: z.string(),
                callbackURL: z.string().optional(),
              })
              .passthrough(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "The user was authenticated.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: CommonErrorResponses[400],
      401: CommonErrorResponses[401],
      500: CommonErrorResponses[500],
    },
  }),
  createRoute({
    method: "post",
    path: "/sign-up/email",
    tags: ["Authentication"],
    operationId: "signUpWithEmail",
    summary: "Create an account with email and password",
    description: "Creates a user account and sends email verification when configured.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({
                name: z.string(),
                email: z.string().email(),
                password: z.string(),
                callbackURL: z.string().optional(),
              })
              .passthrough(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "The account was created.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: CommonErrorResponses[400],
      409: CommonErrorResponses[409],
      500: CommonErrorResponses[500],
    },
  }),
  createRoute({
    method: "post",
    path: "/sign-in/social",
    tags: ["Authentication"],
    operationId: "signInWithSocialProvider",
    summary: "Start social sign-in",
    description: "Starts an OAuth sign-in flow. Google is configured as a provider.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({ provider: z.string(), callbackURL: z.string().optional() })
              .passthrough(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "OAuth redirect details.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: CommonErrorResponses[400],
      500: CommonErrorResponses[500],
    },
  }),
  createRoute({
    method: "post",
    path: "/sign-out",
    tags: ["Authentication"],
    operationId: "signOut",
    summary: "Sign out",
    description: "Ends the current session and clears its cached session entry.",
    responses: {
      200: {
        description: "The session was ended.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: CommonErrorResponses[400],
      401: CommonErrorResponses[401],
      500: CommonErrorResponses[500],
    },
  }),
  createRoute({
    method: "post",
    path: "/forget-password",
    tags: ["Authentication"],
    operationId: "requestPasswordReset",
    summary: "Request a password reset",
    description: "Sends a password reset link to an account email address.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({ email: z.string().email(), redirectTo: z.string().optional() })
              .passthrough(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "The password reset request was processed.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: CommonErrorResponses[400],
      500: CommonErrorResponses[500],
    },
  }),
  createRoute({
    method: "post",
    path: "/reset-password",
    tags: ["Authentication"],
    operationId: "resetPassword",
    summary: "Reset a password",
    description: "Sets a new password using a valid reset token.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({ newPassword: z.string(), token: z.string() }).passthrough(),
          },
        },
      },
    },
    responses: {
      200: {
        description: "The password was reset.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: CommonErrorResponses[400],
      500: CommonErrorResponses[500],
    },
  }),
  createRoute({
    method: "get",
    path: "/verify-email",
    tags: ["Authentication"],
    operationId: "verifyEmail",
    summary: "Verify an email address",
    description: "Verifies an email address using a Better Auth verification token.",
    request: { query: z.object({ token: z.string(), callbackURL: z.string().optional() }) },
    responses: {
      200: {
        description: "The email was verified.",
        content: { "application/json": { schema: AuthResponseSchema } },
      },
      400: CommonErrorResponses[400],
      500: CommonErrorResponses[500],
    },
  }),
];

export const authRoutes = new OpenAPIHono<AppEnv>();
for (const operation of authOperations) authRoutes.openAPIRegistry.registerPath(operation);

// Mount Better Auth handler for all /v1/auth/* endpoints (sign-in, sign-up, google oauth, callback, session, logout)
authRoutes.on(["POST", "GET"], "/*", async (c) => {
  const auth = getAuth(c.env);

  // If user calls logout, purge KV session cache
  if (c.req.path.endsWith("/sign-out") || c.req.path.endsWith("/logout")) {
    const token =
      getCookie(c, "komikhq.session_token") ||
      getCookie(c, "better-auth.session_token") ||
      c.req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await c.env.KV_KOMIKHQ.delete(`session:${token}`);
    }
  }

  const response = await auth.handler(c.req.raw);

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      const data: any = await response.json();
      if (data && typeof data === "object") {
        if (data.user && typeof data.user === "object" && data.user.image) {
          data.user.image = toPublicUrl(data.user.image, "users", c.env) ?? data.user.image;
        } else if (data.image && typeof data.image === "string") {
          data.image = toPublicUrl(data.image, "users", c.env) ?? data.image;
        }

        const newHeaders = new Headers(response.headers);
        newHeaders.delete("content-length");

        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    } catch {
      // Fallback to original response on parsing errors
    }
  }

  return response;
});
