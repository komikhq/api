import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { authMiddleware, type AppEnv } from "./middleware/auth";
import { authRoutes } from "./routes/auth";
import { viewRoutes } from "./routes/views";
import { comicRoutes } from "./routes/comics";
import { realtimeRoutes } from "./routes/realtime";
import { processBatchViews } from "./cron/batch-views";

const app = new Hono<AppEnv>();

// Global Middlewares
app.use("*", corsMiddleware());
app.use("*", authMiddleware());

// Health Check
app.get("/", (c) => c.text("KomikHQ API Worker - Online"));

// Clean Subdomain Route Mounting (No /api Prefix!)
app.route("/v1/auth", authRoutes);
app.route("/v1/view", viewRoutes);
app.route("/v1/comics", comicRoutes);
app.route("/v1/realtime", realtimeRoutes);

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: AppEnv["Bindings"], ctx: ExecutionContext) {
    ctx.waitUntil(processBatchViews(env));
  },
};
