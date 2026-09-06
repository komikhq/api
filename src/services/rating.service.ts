import { RatingRepository } from "@/repositories/rating.repository";

export class RatingService {
  private repo: RatingRepository;

  constructor(databaseUrl: string) {
    this.repo = new RatingRepository(databaseUrl);
  }

  async submitRating(userId: string, comicId: string, score: number) {
    if (!comicId || typeof score !== "number" || score < 1 || score > 5) {
      throw new Error("comicId and score between 1 and 5 are required");
    }
    return this.repo.upsert(userId, comicId, score);
  }
}
