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

  async getFormattedCommentById(id: string) {
    return this.repo.findFormattedById(id);
  }

  async postComment(
    userId: string | null,
    data: {
      comicId?: string;
      chapterId?: string;
      parentId?: string;
      content: string;
      guestName?: string;
      guestEmail?: string;
      isSpoiler?: boolean;
      mentionedUserIds?: string[];
    }
  ) {
    if (!data.content || (!data.comicId && !data.chapterId)) {
      throw new Error("Content and target comicId or chapterId required");
    }
    if (!userId && (!data.guestName || !data.guestEmail)) {
      throw new Error("Guest name and email are required for guest comments");
    }

    return this.repo.create({
      userId,
      guestName: data.guestName || null,
      guestEmail: data.guestEmail || null,
      isSpoiler: data.isSpoiler ?? false,
      comicId: data.comicId || null,
      chapterId: data.chapterId || null,
      parentId: data.parentId || null,
      content: data.content,
      mentionedUserIds: data.mentionedUserIds,
    });
  }

  async toggleLike(userId: string, commentId: string) {
    return this.repo.toggleLike(userId, commentId);
  }

  async deleteComment(commentId: string, userId?: string | null, isAdmin?: boolean) {
    return this.repo.softDelete(commentId, userId, isAdmin);
  }

  async reportComment(data: {
    commentId: string;
    reporterUserId?: string | null;
    reporterGuestName?: string | null;
    reporterGuestEmail?: string | null;
    reason: string;
    details?: string | null;
  }) {
    if (!data.reason) throw new Error("Report reason is required");
    return this.repo.createReport(data);
  }
}
