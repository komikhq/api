export class ViewService {
  private env: any;

  constructor(env: any) {
    this.env = env;
  }

  async recordView(comicId: string, chapterId: string, userId?: string | null) {
    if (!comicId || !chapterId) {
      throw new Error("comicId and chapterId are required");
    }

    const timestamp = new Date().toISOString();
    const key = `view_log:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
    const payload = JSON.stringify({
      comicId,
      chapterId,
      userId: userId || null,
      viewedAt: timestamp,
    });

    // Store in KV with 24-hour TTL expiration fallback
    await this.env.KV_KOMIKHQ.put(key, payload, { expirationTtl: 86400 });

    return { buffered: true, timestamp };
  }
}

