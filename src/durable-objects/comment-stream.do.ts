import { DurableObject } from "cloudflare:workers";

export class CommentStreamDO extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Broadcast endpoint internal (HTTP POST)
    if (request.method === "POST" && url.pathname.endsWith("/broadcast")) {
      const payload = await request.json();
      this.broadcastPayload(payload);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // WebSocket upgrade endpoint
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);

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

  async webSocketClose(): Promise<void> {}
  async webSocketError(): Promise<void> {}

  private broadcastPayload(payload: any): void {
    const dataStr = JSON.stringify(payload);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(dataStr);
      } catch {
        // Ignore dead sockets
      }
    }
  }
}
