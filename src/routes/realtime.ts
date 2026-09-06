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
