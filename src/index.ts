import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { authMiddleware, type AppEnv } from "./middleware/auth";
import { authRoutes } from "./routes/auth";
import { viewRoutes } from "./routes/views";
import { comicRoutes } from "./routes/comics";
import { realtimeRoutes } from "./routes/realtime";
import { userRoutes } from "./routes/user";
import { bookmarkRoutes } from "./routes/bookmarks";
import { historyRoutes } from "./routes/history";
import { commentRoutes } from "./routes/comments";
import { ratingRoutes } from "./routes/ratings";
import { healthRoutes } from "./routes/health";
import { adminRoutes } from "./routes/admin";
import { adminGenreRoutes } from "./routes/admin-genres";
import { adminComicRoutes } from "./routes/admin-comics";
import { adminChapterRoutes } from "./routes/admin-chapters";
import { genreRoutes } from "./routes/genres";
import { processBatchViews } from "./cron/batch-views";

const app = new Hono<AppEnv>();

// Open Public Route (Unconstrained by CORS & Auth)
app.route("/", healthRoutes);

// Global Middlewares
app.use("*", corsMiddleware());
app.use("*", authMiddleware());

// Clean Subdomain Route Mounting (No /api Prefix!)
app.route("/v1/auth", authRoutes);
app.route("/v1/user", userRoutes);
app.route("/v1/admin", adminRoutes);
app.route("/v1/admin", adminGenreRoutes);
app.route("/v1/admin", adminComicRoutes);
app.route("/v1/admin", adminChapterRoutes);
app.route("/v1/genres", genreRoutes);
app.route("/v1/bookmarks", bookmarkRoutes);
app.route("/v1/history", historyRoutes);
app.route("/v1/comments", commentRoutes);
app.route("/v1/ratings", ratingRoutes);
app.route("/v1/view", viewRoutes);
app.route("/v1/comics", comicRoutes);
app.route("/v1/realtime", realtimeRoutes);

import { GlobalPresenceDO } from "./durable-objects/global-presence.do";
import { CommentStreamDO } from "./durable-objects/comment-stream.do";

export { GlobalPresenceDO, CommentStreamDO };

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: AppEnv["Bindings"], ctx: ExecutionContext) {
    ctx.waitUntil(processBatchViews(env));
  },
};
