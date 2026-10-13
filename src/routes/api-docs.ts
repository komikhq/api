import { swaggerUI } from "@hono/swagger-ui";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";

export function registerApiDocs(app: OpenAPIHono<AppEnv>) {
  app.openAPIRegistry.registerComponent("securitySchemes", "SessionCookie", {
    type: "apiKey",
    in: "cookie",
    name: "komikhq.session_token",
    description: "KomikHQ session cookie. The Better Auth session cookie is also accepted.",
  });
  app.openAPIRegistry.registerComponent("securitySchemes", "BearerToken", {
    type: "http",
    scheme: "bearer",
    description: "A valid KomikHQ session token.",
  });
  app.get("/", swaggerUI({ url: "/openapi.json" }));
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "KomikHQ API",
      version: "1.0.0",
      description:
        "The KomikHQ platform API. Request and response contracts are defined alongside their route handlers.",
    },
    tags: [
      { name: "Authentication", description: "Account authentication and session management." },
      { name: "Administration", description: "Administrative platform management." },
      { name: "Bookmarks", description: "User comic bookmarks." },
      { name: "Chapters", description: "Comic chapter and reader data." },
      { name: "Comments", description: "Comic and chapter comments." },
      { name: "Comics", description: "Comic catalog and discovery." },
      { name: "Genres", description: "Comic genre catalog." },
      { name: "Health", description: "Service health status." },
      { name: "Moderation", description: "Moderation reports and actions." },
      { name: "Reading History", description: "User reading history and progress." },
      { name: "Ratings", description: "Comic ratings." },
      { name: "Realtime", description: "Realtime authorization and WebSocket connections." },
      { name: "Search", description: "Comic search and suggestions." },
      { name: "Sitemaps", description: "XML sitemaps and sitemap data feeds." },
      { name: "Users", description: "User profile and account management." },
      { name: "Views", description: "Comic and chapter view tracking." },
    ],
  });
}
