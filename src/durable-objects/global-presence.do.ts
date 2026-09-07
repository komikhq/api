import { DurableObject } from "cloudflare:workers";

export class GlobalPresenceDO extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.ctx.acceptWebSocket(server);
    this.broadcastOnlineCount();

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // Ping / Pong handling
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
    const count = sockets.length;
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
