import { BookmarkRepository } from "@/repositories/bookmark.repository";

export class BookmarkService {
  private repo: BookmarkRepository;

  constructor(databaseUrl: string) {
    this.repo = new BookmarkRepository(databaseUrl);
  }

  async getUserBookmarks(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async saveBookmark(userId: string, comicId: string, status?: string) {
    if (!comicId) {
      throw new Error("comicId is required");
    }
    return this.repo.upsert(userId, comicId, status);
  }

  async removeBookmark(userId: string, comicId: string) {
    return this.repo.delete(userId, comicId);
  }
}
