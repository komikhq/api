import { HistoryRepository } from "@/repositories/history.repository";

export class HistoryService {
  private repo: HistoryRepository;

  constructor(databaseUrl: string) {
    this.repo = new HistoryRepository(databaseUrl);
  }

  async getUserHistory(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async recordHistory(userId: string, comicId: string, chapterId: string, lastReadPage: number = 1, snapshotTotalPages: number = 1, kv?: KVNamespace) {
    if (!comicId || !chapterId) {
      throw new Error("comicId and chapterId are required");
    }

    if (kv) {
      const bufferKey = `history_buffer:${userId}:${comicId}`;
      const payload = JSON.stringify({
        userId,
        comicId,
        chapterId,
        lastReadPage,
        snapshotTotalPages,
        updatedAt: new Date().toISOString(),
      });
      await kv.put(bufferKey, payload, { expirationTtl: 86400 });
    }

    return this.repo.upsert(userId, comicId, chapterId, lastReadPage, snapshotTotalPages);
  }
}

