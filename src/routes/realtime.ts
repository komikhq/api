import { Hono } from "hono";
import Pusher from "pusher";
import type { AppEnv } from "../middleware/auth";

export const realtimeRoutes = new Hono<AppEnv>();

realtimeRoutes.post("/auth", async (c) => {
  const body = await c.req.parseBody();
  const socketId = body.socket_id as string;
  const channelName = body.channel_name as string;

  const pusher = new Pusher({
    appId: c.env.PUSHER_APP_ID || "2191952",
    key: c.env.PUSHER_KEY || "7157057bb5292c898900",
    secret: c.env.PUSHER_SECRET || "f5e13d58f87d17f51b00",
    cluster: c.env.PUSHER_CLUSTER || "ap1",
    useTLS: true,
  });

  const user = c.get("user");
  const presenceData = {
    user_id: user?.userId || `anon_${crypto.randomUUID().slice(0, 8)}`,
    user_info: {
      name: user?.name || "Anonymous Reader",
    },
  };

  const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
  return c.json(authResponse);
});
