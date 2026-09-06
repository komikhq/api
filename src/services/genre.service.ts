import { GenreRepository } from "@/repositories/genre.repository";
import { slugify } from "@/utils/slugify";

export interface CreateGenreDto {
  name: string;
  description?: string;
}

export interface UpdateGenreDto {
  name?: string;
  description?: string;
}

export class GenreService {
  private genreRepo: GenreRepository;

  constructor(databaseUrl: string) {
    this.genreRepo = new GenreRepository(databaseUrl);
  }

  async getAllGenres() {
    return this.genreRepo.findAll();
  }

  async createGenre(dto: CreateGenreDto) {
    if (!dto.name || typeof dto.name !== "string" || !dto.name.trim()) {
      throw new Error("Nama genre wajib diisi.");
    }

    const name = dto.name.trim();
    const slug = slugify(name);

    const existing = await this.genreRepo.findBySlug(slug);
    if (existing) {
      throw new Error(`Genre dengan nama atau slug "${name}" sudah ada.`);
    }

    return this.genreRepo.create({
      name,
      slug,
      description: dto.description ? dto.description.trim() : null,
    });
  }

  async updateGenre(id: string, dto: UpdateGenreDto) {
    const existing = await this.genreRepo.findById(id);
    if (!existing) {
      throw new Error("Genre tidak ditemukan.");
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.name && typeof dto.name === "string" && dto.name.trim()) {
      const name = dto.name.trim();
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description ? dto.description.trim() : null;
    }

    return this.genreRepo.update(id, updateData);
  }

  async deleteGenre(id: string) {
    const existing = await this.genreRepo.findById(id);
    if (!existing) {
      throw new Error("Genre tidak ditemukan.");
    }

    await this.genreRepo.delete(id);
    return existing.name;
  }
}
