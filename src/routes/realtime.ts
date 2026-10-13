import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "@/middleware/auth";
import { RealtimeService } from "@/services/realtime.service";
import { successResponse } from "@/utils/response";
import { CommonErrorResponses } from "@/schemas/common";

const RealtimeAuthRoute = createRoute({
  method: "post",
  path: "/auth",
  tags: ["Realtime"],
  operationId: "authorizeRealtimeChannel",
  summary: "Authorize a realtime channel",
  description: "Authorizes a Pusher channel subscription using the current optional user session.",
  request: {
    body: {
      content: {
        "application/x-www-form-urlencoded": {
          schema: z.object({ socket_id: z.string(), channel_name: z.string() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pusher channel authorization response.",
      content: { "application/json": { schema: z.unknown() } },
    },
    400: CommonErrorResponses[400],
    401: CommonErrorResponses[401],
    403: CommonErrorResponses[403],
    404: CommonErrorResponses[404],
    409: CommonErrorResponses[409],
    500: CommonErrorResponses[500],
  },
});
const RealtimeWebSocketRoute = createRoute({
  method: "get",
  path: "/ws",
  tags: ["Realtime"],
  operationId: "connectRealtimeWebSocket",
  summary: "Connect to a realtime WebSocket",
  description: "Upgrades the request to a WebSocket for global presence or a comment stream.",
  request: {
    query: z.object({ channel: z.string().optional() }),
    headers: z.object({ Upgrade: z.string().optional() }),
  },
  responses: {
    101: { description: "The request was upgraded to a WebSocket connection." },
    400: CommonErrorResponses[400],
  },
});

export const realtimeRoutes = new OpenAPIHono<AppEnv>();

realtimeRoutes.openapi(RealtimeAuthRoute, async (c) => {
  try {
    const { socket_id: socketId, channel_name: channelName } = c.req.valid("form");

    if (!socketId || !channelName) {
      return c.json({ error: "socket_id and channel_name are required" }, 400);
    }

    const user = c.get("user");
    const service = new RealtimeService(c.env);

    const authResponse = service.authorizeChannel({
      socketId,
      channelName,
      user,
    });

    return successResponse(c, authResponse);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to authorize channel" }, 400);
  }
});

realtimeRoutes.openapi(RealtimeWebSocketRoute, async (c) => {
  const { channel: requestedChannel } = c.req.valid("query");
  const channel = requestedChannel || "global_presence";
  const upgradeHeader = c.req.header("Upgrade");

  if (upgradeHeader !== "websocket") {
    return c.json({ error: "Expected Upgrade: websocket" }, 400);
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

  return c.json({ error: "Invalid channel or Durable Object binding missing" }, 400);
});
