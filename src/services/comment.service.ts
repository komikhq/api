import { CommentRepository } from "@/repositories/comment.repository";
import { toPublicUrl } from "@/lib/storage";

export class CommentService {
  private repo: CommentRepository;
  private env: any;

  constructor(databaseUrl: string, env?: any) {
    this.repo = new CommentRepository(databaseUrl);
    this.env = env;
  }

  private formatComment(comment: any) {
    if (!comment) return comment;
    return {
      ...comment,
      author: comment.author
        ? {
            ...comment.author,
            image: toPublicUrl(comment.author.image, "users", this.env) ?? comment.author.image,
          }
        : comment.author,
    };
  }

  async getComments(comicId?: string, chapterId?: string) {
    if (!comicId && !chapterId) {
      throw new Error("comicId or chapterId is required");
    }
    const comments = await this.repo.findByTarget(comicId, chapterId);
    return comments.map((c) => this.formatComment(c));
  }

  async getFormattedCommentById(id: string) {
    const comment = await this.repo.findFormattedById(id);
    return this.formatComment(comment);
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
