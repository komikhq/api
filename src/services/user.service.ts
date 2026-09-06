import { UserRepository } from "@/repositories/user.repository";
import { uploadToR2 } from "@/lib/storage";
import { getAuth } from "@/lib/auth";

export class UserService {
  private userRepo: UserRepository;
  private env: any;

  constructor(databaseUrl: string, env: any) {
    this.userRepo = new UserRepository(databaseUrl);
    this.env = env;
  }

  async getProfile(userId: string) {
    const profile = await this.userRepo.findById(userId);
    if (!profile) {
      throw new Error("User not found");
    }

    const hasPassword = await this.userRepo.hasCredentialPassword(userId);
    return {
      user: profile,
      hasPassword,
    };
  }

  async updateAvatar(userId: string, file: File) {
    const fileExt = file.name.split(".").pop() || "png";
    const objectKey = `avatars/${userId}-${Date.now()}.${fileExt}`;
    const buffer = await file.arrayBuffer();

    const publicUrl = await uploadToR2(
      this.env,
      "users",
      objectKey,
      buffer,
      { contentType: file.type || "image/png" }
    );

    await this.userRepo.updateUser(userId, {
      image: publicUrl,
      updatedAt: new Date(),
    });

    return publicUrl;
  }

  async deleteOwnAccount(userId: string, userEmail: string, body: { password?: string; email?: string }, rawHeaders: Headers) {
    const hasPassword = await this.userRepo.hasCredentialPassword(userId);

    if (hasPassword) {
      if (!body.password) {
        throw new Error("Kata sandi konfirmasi wajib diisi.");
      }

      try {
        const auth = getAuth(this.env);
        const isValid = await auth.api.verifyPassword({
          body: { password: body.password },
          headers: rawHeaders,
        });

        if (!isValid) {
          throw new Error("Kata sandi konfirmasi tidak sesuai.");
        }
      } catch (e: any) {
        throw new Error(e.message || "Kata sandi yang Anda masukkan tidak valid.");
      }
    } else {
      if (!body.email || body.email.toLowerCase().trim() !== userEmail.toLowerCase().trim()) {
        throw new Error("Alamat email konfirmasi tidak sesuai.");
      }
    }

    await this.userRepo.deleteUser(userId);
  }
}
