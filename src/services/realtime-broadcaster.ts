import { getPusherClient } from "@/lib/pusher";

export interface RealtimeEnv {
  REALTIME_PROVIDER?: string;
  GLOBAL_PRESENCE_DO?: DurableObjectNamespace;
  COMMENT_STREAM_DO?: DurableObjectNamespace;
  PUSHER_APP_ID?: string;
  PUSHER_KEY?: string;
  PUSHER_SECRET?: string;
  PUSHER_CLUSTER?: string;
}

export class RealtimeBroadcaster {
  private env: RealtimeEnv;

  constructor(env: RealtimeEnv) {
    this.env = env;
  }

  async broadcastComment(channel: string, commentData: any): Promise<void> {
    const provider = this.env.REALTIME_PROVIDER || "durable_object";

    if (provider === "durable_object" && this.env.COMMENT_STREAM_DO) {
      const id = this.env.COMMENT_STREAM_DO.idFromName(channel);
      const stub = this.env.COMMENT_STREAM_DO.get(id);
      await stub.fetch("http://do/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_comment",
          comment: commentData,
        }),
      });
      return;
    }

    // Pusher Fallback
    if (this.env.PUSHER_APP_ID && this.env.PUSHER_KEY) {
      const pusher = getPusherClient(this.env as any);
      await pusher.trigger(channel, "new_comment", commentData);
    }
  }
}
