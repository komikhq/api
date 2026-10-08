import { ComicRepository, type ListComicsParams } from "@/repositories/comic.repository";
import { ChapterRepository } from "@/repositories/chapter.repository";
import { uploadToR2, deleteFromR2, toPublicUrl, toObjectKey, type StorageEnv } from "@/lib/storage";
import { slugify } from "@/utils/slugify";

export interface CreateComicDto {
  title: string;
  synopsis?: string;
  type?: string;
  status?: string;
  accessTier?: string;
  genreIdsRaw?: string;
  creatorName?: string;
  alternateTitles?: string[];
  coverFile: File;
  bannerFile?: File | null;
}

export interface UpdateComicDto {
  title?: string;
  synopsis?: string;
  type?: string;
  status?: string;
  accessTier?: string;
  genreIdsRaw?: string;
  creatorName?: string;
  alternateTitles?: string[];
  coverFile?: File | null;
  bannerFile?: File | null;
}

export class ComicService {
  private comicRepo: ComicRepository;
  private databaseUrl: string;
  private env: any;

  constructor(databaseUrl: string, env: any) {
    this.comicRepo = new ComicRepository(databaseUrl);
    this.databaseUrl = databaseUrl;
    this.env = env;
  }

  /** Resolve relative cover/banner paths to full public URLs */
  private resolveComicUrls<T extends { coverUrl?: string | null; bannerUrl?: string | null }>(comic: T): T {
    return {
      ...comic,
      coverUrl: toPublicUrl(comic.coverUrl, "media", this.env) ?? comic.coverUrl,
      bannerUrl: toPublicUrl(comic.bannerUrl, "media", this.env),
    };
  }

  async getComicsList(params: ListComicsParams) {
    const { comics, total } = await this.comicRepo.findManyWithPagination(params);
    return {
      comics: comics.map((c: any) => this.resolveComicUrls(c)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getTrendingComics(period: "daily" | "weekly" | "popular" = "daily", limit: number = 10) {
    if (this.env?.KV_VIEWS) {
      try {
        const kvKey = period === "popular" ? "ranking:popular_all_time" : `ranking:trending_${period}`;
        const cachedRaw = await this.env.KV_VIEWS.get(kvKey);
        if (cachedRaw) {
          const cachedComics = JSON.parse(cachedRaw);
          if (Array.isArray(cachedComics) && cachedComics.length > 0) {
            const sliced = cachedComics.slice(0, limit);
            return {
              comics: sliced.map((c: any) => this.resolveComicUrls(c)),
              total: sliced.length,
            };
          }
        }
      } catch (err) {
        console.warn("[ComicService] Failed to read trending from KV cache, falling back to DB:", err);
      }
    }

    const result = await this.comicRepo.findTrending(period, limit);
    return {
      ...result,
      comics: result.comics.map((c: any) => this.resolveComicUrls(c)),
    };
  }

  async getComicById(id: string) {
    const comicData = await this.comicRepo.findById(id);
    if (!comicData) {
      throw new Error("Comic not found.");
    }
    return { ...comicData, comic: this.resolveComicUrls(comicData.comic) };
  }

  async getComicBySlug(slug: string) {
    const comicData = await this.comicRepo.findBySlug(slug);
    if (!comicData) {
      throw new Error("Comic not found.");
    }
    return { ...comicData, comic: this.resolveComicUrls(comicData.comic) };
  }

  async createComic(dto: CreateComicDto) {
    if (!dto.title) {
      throw new Error("Comic title is required.");
    }
    if (!dto.coverFile) {
      throw new Error("Comic cover image is required.");
    }

    const slug = slugify(dto.title) + "-" + Date.now().toString().slice(-4);

    // Upload Cover — uploadToR2 now returns the relative object key
    const coverBuffer = await dto.coverFile.arrayBuffer();
    const coverExt = dto.coverFile.name.split(".").pop() || "webp";
    const coverKey = `comics/${slug}/cover-${Date.now()}.${coverExt}`;
    const coverUrl = await uploadToR2(this.env as StorageEnv, "media", coverKey, coverBuffer, {
      contentType: dto.coverFile.type || "image/webp",
    });

    // Upload Banner if provided
    let bannerUrl: string | null = null;
    if (dto.bannerFile && dto.bannerFile.size > 0) {
      const bannerBuffer = await dto.bannerFile.arrayBuffer();
      const bannerExt = dto.bannerFile.name.split(".").pop() || "webp";
      const bannerKey = `comics/${slug}/banner-${Date.now()}.${bannerExt}`;
      bannerUrl = await uploadToR2(this.env as StorageEnv, "media", bannerKey, bannerBuffer, {
        contentType: dto.bannerFile.type || "image/webp",
      });
    }

    const newComic = await this.comicRepo.create({
      title: dto.title,
      slug,
      synopsis: dto.synopsis || "",
      coverUrl,
      bannerUrl,
      alternateTitles: dto.alternateTitles ?? [],
      type: dto.type || "manga",
      status: dto.status || "ongoing",
      accessTier: dto.accessTier || "free",
    });

    // Link Genres
    if (dto.genreIdsRaw) {
      try {
        const genreIds: string[] = JSON.parse(dto.genreIdsRaw);
        if (Array.isArray(genreIds) && genreIds.length > 0) {
          await this.comicRepo.syncGenres(newComic.id, genreIds);
        }
      } catch (e) {
        console.error("[ComicService] Failed to parse/link comic genres:", e);
      }
    }

    // Link Creator
    if (dto.creatorName) {
      await this.comicRepo.syncCreator(newComic.id, dto.creatorName, slugify);
    }

    return newComic;
  }

  async updateComic(id: string, dto: UpdateComicDto) {
    const existing = await this.comicRepo.findById(id);
    if (!existing) {
      throw new Error("Comic not found.");
    }

    const existingComic = existing.comic;
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.title) updateData.title = dto.title;
    if (dto.synopsis !== undefined) updateData.synopsis = dto.synopsis;
    if (dto.type) updateData.type = dto.type;
    if (dto.status) updateData.status = dto.status;
    if (dto.accessTier) updateData.accessTier = dto.accessTier;
    if (dto.alternateTitles !== undefined) {
      updateData.alternateTitles = dto.alternateTitles.map((title) => title.trim()).filter(Boolean);
    }

    if (dto.coverFile && dto.coverFile.size > 0) {
      const coverBuffer = await dto.coverFile.arrayBuffer();
      const coverExt = dto.coverFile.name.split(".").pop() || "webp";
      const coverKey = `comics/${existingComic.slug}/cover-${Date.now()}.${coverExt}`;
      updateData.coverUrl = await uploadToR2(this.env as StorageEnv, "media", coverKey, coverBuffer, {
        contentType: dto.coverFile.type || "image/webp",
      });
    }

    if (dto.bannerFile && dto.bannerFile.size > 0) {
      const bannerBuffer = await dto.bannerFile.arrayBuffer();
      const bannerExt = dto.bannerFile.name.split(".").pop() || "webp";
      const bannerKey = `comics/${existingComic.slug}/banner-${Date.now()}.${bannerExt}`;
      updateData.bannerUrl = await uploadToR2(this.env as StorageEnv, "media", bannerKey, bannerBuffer, {
        contentType: dto.bannerFile.type || "image/webp",
      });
    }

    const updatedComic = await this.comicRepo.update(id, updateData);

    if (dto.genreIdsRaw !== undefined) {
      try {
        const genreIds: string[] = JSON.parse(dto.genreIdsRaw);
        await this.comicRepo.syncGenres(id, Array.isArray(genreIds) ? genreIds : []);
      } catch (e) {
        console.error("[ComicService] Failed to update comic genres:", e);
      }
    }

    if (dto.creatorName !== undefined && dto.creatorName.length > 0) {
      await this.comicRepo.syncCreator(id, dto.creatorName, slugify);
    }

    return updatedComic;
  }

  async deleteComic(id: string) {
    const existing = await this.comicRepo.findById(id);
    if (!existing) {
      throw new Error("Comic not found.");
    }

    // Auto cleanup R2 media (cover, banner, chapter pages)
    const chapterRepo = new ChapterRepository(this.databaseUrl);
    const comicChapters = await chapterRepo.findByComicId(id);

    for (const ch of comicChapters) {
      const chDetail = await chapterRepo.findById(ch.id);
      if (chDetail?.pages) {
        for (const p of chDetail.pages) {
          if (p.imageUrl) {
            await deleteFromR2(this.env as StorageEnv, "media", p.imageUrl).catch(() => {});
          }
        }
      }
    }

    if (existing.comic.coverUrl) {
      await deleteFromR2(this.env as StorageEnv, "media", existing.comic.coverUrl).catch(() => {});
    }

    if (existing.comic.bannerUrl) {
      await deleteFromR2(this.env as StorageEnv, "media", existing.comic.bannerUrl).catch(() => {});
    }

    await this.comicRepo.delete(id);
    return existing.comic.title;
  }
}
