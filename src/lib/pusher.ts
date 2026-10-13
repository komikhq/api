import Pusher from "pusher";

export interface PusherEnv {
  PUSHER_APP_ID?: string;
  PUSHER_KEY?: string;
  PUSHER_SECRET?: string;
  PUSHER_CLUSTER?: string;
}

export function getPusherClient(env: PusherEnv): Pusher {
  return new Pusher({
    appId: env.PUSHER_APP_ID || "",
    key: env.PUSHER_KEY || "",
    secret: env.PUSHER_SECRET || "",
    cluster: env.PUSHER_CLUSTER || "",
    useTLS: true,
  });
}
