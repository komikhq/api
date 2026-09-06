export class ViewService {
  private env: any;

  constructor(env: any) {
    this.env = env;
  }

  async recordView(comicId: string, chapterId: string) {
    if (!comicId || !chapterId) {
      throw new Error("comicId and chapterId are required");
    }

    const key = `view:${comicId}:${chapterId}`;
    const currentStr = await this.env.KV_KOMIKHQ.get(key);
    const current = parseInt(currentStr || "0", 10);
    const nextVal = current + 1;
    await this.env.KV_KOMIKHQ.put(key, nextVal.toString());

    return { bufferedViews: nextVal };
  }
}
