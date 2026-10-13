import { getPusherClient, type PusherEnv } from "@/lib/pusher";

export interface AuthorizeChannelParams {
  socketId: string;
  channelName: string;
  user?: {
    userId?: string;
    name?: string;
  } | null;
}

export class RealtimeService {
  private env: PusherEnv;

  constructor(env: PusherEnv) {
    this.env = env;
  }

  authorizeChannel(params: AuthorizeChannelParams) {
    const { socketId, channelName, user } = params;
    const pusher = getPusherClient(this.env);

    const presenceData = {
      user_id: user?.userId || `anon_${crypto.randomUUID().slice(0, 8)}`,
      user_info: {
        name: user?.name || "Anonymous Reader",
      },
    };

    return pusher.authorizeChannel(socketId, channelName, presenceData);
  }
}
