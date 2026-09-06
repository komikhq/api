import { ComicRepository, type ListComicsParams } from "@/repositories/comic.repository";
import { uploadToR2, type StorageEnv } from "@/lib/storage";
import { slugify } from "@/utils/slugify";

export interface CreateComicDto {
  title: string;
  synopsis?: string;
  status?: string;
  accessTier?: string;
  genreIdsRaw?: string;
  creatorName?: string;
  coverFile: File;
  bannerFile?: File | null;
}

export interface UpdateComicDto {
  title?: string;
  synopsis?: string;
  status?: string;
  accessTier?: string;
  genreIdsRaw?: string;
  creatorName?: string;
  coverFile?: File | null;
  bannerFile?: File | null;
}

export class ComicService {
  private comicRepo: ComicRepository;
  private env: any;

  constructor(databaseUrl: string, env: any) {
    this.comicRepo = new ComicRepository(databaseUrl);
    this.env = env;
  }

  async getComicsList(params: ListComicsParams) {
    const { comics, total } = await this.comicRepo.findManyWithPagination(params);
    return {
      comics,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getComicById(id: string) {
    const comicData = await this.comicRepo.findById(id);
    if (!comicData) {
      throw new Error("Komik tidak ditemukan.");
    }
    return comicData;
  }

  async createComic(dto: CreateComicDto) {
    if (!dto.title) {
      throw new Error("Judul komik wajib diisi.");
    }
    if (!dto.coverFile) {
      throw new Error("Gambar cover komik wajib diunggah.");
    }

    const slug = slugify(dto.title) + "-" + Date.now().toString().slice(-4);

    // Upload Cover
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
      throw new Error("Komik tidak ditemukan.");
    }

    const existingComic = existing.comic;
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.title) updateData.title = dto.title;
    if (dto.synopsis !== undefined) updateData.synopsis = dto.synopsis;
    if (dto.status) updateData.status = dto.status;
    if (dto.accessTier) updateData.accessTier = dto.accessTier;

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
      throw new Error("Komik tidak ditemukan.");
    }
    await this.comicRepo.delete(id);
    return existing.comic.title;
  }
}
