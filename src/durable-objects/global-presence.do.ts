import { DurableObject } from "cloudflare:workers";

export class GlobalPresenceDO extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const visitorId = url.searchParams.get("visitorId") || `visitor_${Date.now()}_${crypto.randomUUID()}`;

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server, [visitorId]);
    this.broadcastOnlineCount();

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (message === "ping") {
      ws.send("pong");
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    this.broadcastOnlineCount();
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    this.broadcastOnlineCount();
  }

  private broadcastOnlineCount(): void {
    const sockets = this.ctx.getWebSockets();
    const uniqueVisitorIds = new Set<string>();

    for (const ws of sockets) {
      const tags = this.ctx.getTags(ws);
      if (tags && tags.length > 0 && tags[0]) {
        uniqueVisitorIds.add(tags[0]);
      } else {
        // Fallback for sockets without tags
        uniqueVisitorIds.add(Math.random().toString());
      }
    }

    const count = uniqueVisitorIds.size;
    const payload = JSON.stringify({ event: "online_count", count });

    for (const ws of sockets) {
      try {
        ws.send(payload);
      } catch {
        // Ignore dead sockets
      }
    }
  }
}
