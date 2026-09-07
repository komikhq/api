import { Hono } from "hono";
import type { AppEnv } from "@/middleware/auth";
import { RealtimeService } from "@/services/realtime.service";
import { errorResponse } from "@/utils/response";

export const realtimeRoutes = new Hono<AppEnv>();

realtimeRoutes.post("/auth", async (c) => {
  try {
    const body = await c.req.parseBody();
    const socketId = body.socket_id as string;
    const channelName = body.channel_name as string;

    if (!socketId || !channelName) {
      return errorResponse(c, "socket_id and channel_name are required", 400);
    }

    const user = c.get("user");
    const service = new RealtimeService(c.env);

    const authResponse = service.authorizeChannel({
      socketId,
      channelName,
      user,
    });

    return c.json(authResponse);
  } catch (err: any) {
    return errorResponse(c, err.message || "Failed to authorize channel", 400);
  }
});

realtimeRoutes.get("/ws", async (c) => {
  const channel = c.req.query("channel") || "global_presence";
  const upgradeHeader = c.req.header("Upgrade");

  if (upgradeHeader !== "websocket") {
    return errorResponse(c, "Expected Upgrade: websocket", 400);
  }

  if (channel === "global_presence" && c.env.GLOBAL_PRESENCE_DO) {
    const id = c.env.GLOBAL_PRESENCE_DO.idFromName("global_presence");
    const stub = c.env.GLOBAL_PRESENCE_DO.get(id);
    return stub.fetch(c.req.raw);
  }

  if (channel.startsWith("comment_stream:") && c.env.COMMENT_STREAM_DO) {
    const id = c.env.COMMENT_STREAM_DO.idFromName(channel);
    const stub = c.env.COMMENT_STREAM_DO.get(id);
    return stub.fetch(c.req.raw);
  }

  return errorResponse(c, "Invalid channel or Durable Object binding missing", 400);
});
