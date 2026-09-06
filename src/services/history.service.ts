import { HistoryRepository } from "@/repositories/history.repository";

export class HistoryService {
  private repo: HistoryRepository;

  constructor(databaseUrl: string) {
    this.repo = new HistoryRepository(databaseUrl);
  }

  async getUserHistory(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async recordHistory(userId: string, comicId: string, chapterId: string, lastReadPage?: number, snapshotTotalPages?: number) {
    if (!comicId || !chapterId) {
      throw new Error("comicId and chapterId are required");
    }
    return this.repo.upsert(userId, comicId, chapterId, lastReadPage, snapshotTotalPages);
  }
}
