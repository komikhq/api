import { ChapterRepository } from "@/repositories/chapter.repository";
import { ComicRepository } from "@/repositories/comic.repository";
import { uploadToR2, deleteFromR2, getPublicStorageUrl, type StorageEnv } from "@/lib/storage";

export interface CreateChapterDto {
  comicId: string;
  chapterNumberStr?: string;
  title?: string;
  accessTier?: string;
  isEarlyAccess?: boolean;
  validPages: File[];
}

export interface UpdateChapterDto {
  title?: string;
  chapterNumber?: number | string;
  accessTier?: string;
  isEarlyAccess?: boolean;
}

export class ChapterService {
  private chapterRepo: ChapterRepository;
  private comicRepo: ComicRepository;
  private env: any;

  constructor(databaseUrl: string, env: any) {
    this.chapterRepo = new ChapterRepository(databaseUrl);
    this.comicRepo = new ComicRepository(databaseUrl);
    this.env = env;
  }

  async getChaptersByComicId(comicId: string) {
    return this.chapterRepo.findByComicId(comicId);
  }

  async getChapterById(chapterId: string) {
    const data = await this.chapterRepo.findById(chapterId);
    if (!data) {
      throw new Error("Chapter tidak ditemukan.");
    }
    return data;
  }

  async getPublicChapterBySlugs(comicSlug: string, chapterSlug: string) {
    const data = await this.chapterRepo.findByComicSlugAndChapterSlug(comicSlug, chapterSlug);
    if (!data) {
      throw new Error("Chapter tidak ditemukan.");
    }
    return data;
  }

  async initChapter(dto: {
    comicId: string;
    chapterNumberStr?: string;
    title?: string;
    accessTier?: string;
    isEarlyAccess?: boolean;
    totalPages?: number;
  }) {
    const comicData = await this.comicRepo.findById(dto.comicId);
    if (!comicData) {
      throw new Error("Komik tidak ditemukan.");
    }

    if (!dto.chapterNumberStr) {
      throw new Error("Nomor chapter wajib diisi.");
    }

    const chapterNumber = parseFloat(dto.chapterNumberStr);
    const chapterSlug = `ch-${dto.chapterNumberStr}`;

    const newChapter = await this.chapterRepo.createChapter({
      comicId: dto.comicId,
      chapterNumber: chapterNumber.toString(),
      title: dto.title || `Chapter ${dto.chapterNumberStr}`,
      slug: chapterSlug,
      totalPages: dto.totalPages || 0,
      accessTier: dto.accessTier || "free",
      isEarlyAccess: dto.isEarlyAccess || false,
    });

    return {
      chapter: newChapter,
      comicSlug: comicData.comic.slug,
    };
  }

  async uploadSinglePage(chapterId: string, pageNumber: number, file: File) {
    const existing = await this.chapterRepo.findById(chapterId);
    if (!existing) {
      throw new Error("Chapter tidak ditemukan.");
    }

    const comicData = await this.comicRepo.findById(existing.chapter.comicId);
    if (!comicData) {
      throw new Error("Komik tidak ditemukan.");
    }

    const ext = file.name.split(".").pop() || "webp";
    const objectKey = `comics/${comicData.comic.slug}/ch-${existing.chapter.chapterNumber}/page-${pageNumber}-${Date.now()}.${ext}`;

    const buffer = await file.arrayBuffer();
    const imageUrl = await uploadToR2(this.env as StorageEnv, "media", objectKey, buffer, {
      contentType: file.type || "image/webp",
    });

    try {
      const pageRecord = await this.chapterRepo.createPageRecord(chapterId, pageNumber, imageUrl);
      return pageRecord;
    } catch (dbErr: any) {
      await deleteFromR2(this.env as StorageEnv, "media", objectKey).catch(() => {});
      throw dbErr;
    }
  }

  async purgeOrphanImages() {
    const activeUrls = await this.chapterRepo.getAllActiveImageUrls();
    const bucket = this.env.MEDIA_BUCKET as R2Bucket;

    if (!bucket) {
      throw new Error("R2 Bucket binding MEDIA_BUCKET tidak ditemukan.");
    }

    let truncated = true;
    let cursor: string | undefined = undefined;
    let purgedCount = 0;
    let totalSizeBytes = 0;

    const oneHourAgo = Date.now() - 3600 * 1000;

    while (truncated) {
      const listRes: R2Objects = await bucket.list({ prefix: "comics/", cursor });
      truncated = listRes.truncated;
      cursor = listRes.truncated ? listRes.cursor : undefined;

      for (const obj of listRes.objects) {
        if (obj.uploaded.getTime() > oneHourAgo) {
          continue;
        }

        const publicUrl = getPublicStorageUrl("media", obj.key, this.env as StorageEnv);
        if (!activeUrls.has(publicUrl)) {
          await bucket.delete(obj.key);
          purgedCount++;
          totalSizeBytes += obj.size;
        }
      }
    }

    return {
      purgedCount,
      totalSizeBytes,
      totalSizeMB: (totalSizeBytes / (1024 * 1024)).toFixed(2),
    };
  }

  async finalizeChapter(comicId: string, chapterId: string, totalPages: number) {
    const existing = await this.chapterRepo.findById(chapterId);
    if (!existing) {
      throw new Error("Chapter tidak ditemukan.");
    }

    const updated = await this.chapterRepo.update(chapterId, {
      totalPages,
      updatedAt: new Date(),
    });

    await this.chapterRepo.updateComicTotalChapters(comicId);
    return updated;
  }

  async createChapter(dto: CreateChapterDto) {
    const comicData = await this.comicRepo.findById(dto.comicId);
    if (!comicData) {
      throw new Error("Komik tidak ditemukan.");
    }

    if (!dto.chapterNumberStr) {
      throw new Error("Nomor chapter wajib diisi.");
    }

    const chapterNumber = parseFloat(dto.chapterNumberStr);
    const chapterSlug = `ch-${dto.chapterNumberStr}`;

    const newChapter = await this.chapterRepo.createChapter({
      comicId: dto.comicId,
      chapterNumber: chapterNumber.toString(),
      title: dto.title || `Chapter ${dto.chapterNumberStr}`,
      slug: chapterSlug,
      totalPages: dto.validPages.length,
      accessTier: dto.accessTier || "free",
      isEarlyAccess: dto.isEarlyAccess || false,
    });

    const insertedPages = [];
    for (let i = 0; i < dto.validPages.length; i++) {
      const file = dto.validPages[i];
      const ext = file.name.split(".").pop() || "webp";
      const pageNum = i + 1;
      const objectKey = `comics/${comicData.comic.slug}/ch-${dto.chapterNumberStr}/page-${pageNum}-${Date.now()}.${ext}`;

      const buffer = await file.arrayBuffer();
      const imageUrl = await uploadToR2(this.env as StorageEnv, "media", objectKey, buffer, {
        contentType: file.type || "image/webp",
      });

      const pageRecord = await this.chapterRepo.createPageRecord(newChapter.id, pageNum, imageUrl);
      insertedPages.push(pageRecord);
    }

    await this.chapterRepo.updateComicTotalChapters(dto.comicId);

    return {
      chapter: newChapter,
      pages: insertedPages,
    };
  }

  async updateChapter(chapterId: string, dto: UpdateChapterDto) {
    const existing = await this.chapterRepo.findById(chapterId);
    if (!existing) {
      throw new Error("Chapter tidak ditemukan.");
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.chapterNumber !== undefined) updateData.chapterNumber = dto.chapterNumber.toString();
    if (dto.accessTier !== undefined) updateData.accessTier = dto.accessTier;
    if (dto.isEarlyAccess !== undefined) updateData.isEarlyAccess = Boolean(dto.isEarlyAccess);

    return this.chapterRepo.update(chapterId, updateData);
  }

  async deleteChapter(comicId: string, chapterId: string) {
    const existing = await this.chapterRepo.findById(chapterId);
    if (!existing) {
      throw new Error("Chapter tidak ditemukan.");
    }

    await this.chapterRepo.delete(chapterId);
    await this.chapterRepo.updateComicTotalChapters(comicId);

    return existing.chapter.chapterNumber;
  }
}
