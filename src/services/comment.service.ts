import { CommentRepository } from "@/repositories/comment.repository";

export class CommentService {
  private repo: CommentRepository;

  constructor(databaseUrl: string) {
    this.repo = new CommentRepository(databaseUrl);
  }

  async getComments(comicId?: string, chapterId?: string) {
    if (!comicId && !chapterId) {
      throw new Error("comicId or chapterId is required");
    }
    return this.repo.findByTarget(comicId, chapterId);
  }

  async postComment(userId: string, data: { comicId?: string; chapterId?: string; parentId?: string; content: string }) {
    if (!data.content || (!data.comicId && !data.chapterId)) {
      throw new Error("Content and target comicId or chapterId required");
    }
    return this.repo.create({
      userId,
      comicId: data.comicId || null,
      chapterId: data.chapterId || null,
      parentId: data.parentId || null,
      content: data.content,
    });
  }

  async toggleLike(userId: string, commentId: string) {
    return this.repo.toggleLike(userId, commentId);
  }
}
