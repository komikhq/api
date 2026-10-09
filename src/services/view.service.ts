import type { AppEnv } from "@/middleware/auth"

export class ViewService {
  private env: AppEnv["Bindings"]

  constructor(env: AppEnv["Bindings"]) {
    this.env = env
  }

  async recordView(
    comicId: string,
    chapterId: string,
    _userId?: string | null
  ) {
    if (!comicId || !chapterId) {
      throw new Error("comicId and chapterId are required")
    }

    const timestamp = new Date().toISOString()

    if (this.env.AE_COMIC_VIEWS) {
      this.env.AE_COMIC_VIEWS.writeDataPoint({
        indexes: [comicId],
        blobs: [comicId, chapterId],
        doubles: [1],
      })
    }

    return { buffered: true, timestamp }
  }
}
