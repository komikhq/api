import { UserRepository } from "@/repositories/user.repository"
import { uploadToR2, toPublicUrl, type StorageEnv } from "@/lib/storage"
import { getAuth } from "@/lib/auth"

export class UserService {
  private userRepo: UserRepository
  private env: any

  constructor(databaseUrl: string, env: any) {
    this.userRepo = new UserRepository(databaseUrl)
    this.env = env
  }

  async getProfile(userId: string) {
    const profile = await this.userRepo.findById(userId)
    if (!profile) {
      throw new Error("User not found")
    }

    const hasPassword = await this.userRepo.hasCredentialPassword(userId)
    return {
      user: {
        ...profile,
        image: toPublicUrl(profile.image, "users", this.env) ?? profile.image,
      },
      hasPassword,
    }
  }

  async updateAvatar(userId: string, file: File) {
    const fileExt = file.name.split(".").pop() || "png"
    const objectKey = `avatars/${userId}-${Date.now()}.${fileExt}`
    const buffer = await file.arrayBuffer()

    // uploadToR2 returns relative object key for DB storage
    const imageKey = await uploadToR2(
      this.env as StorageEnv,
      "users",
      objectKey,
      buffer,
      { contentType: file.type || "image/png" }
    )

    await this.userRepo.updateUser(userId, {
      image: imageKey,
      updatedAt: new Date(),
    })

    // Return full public URL to the client
    return toPublicUrl(imageKey, "users", this.env) ?? imageKey
  }

  async deleteOwnAccount(
    userId: string,
    userEmail: string,
    body: { password?: string; email?: string },
    rawHeaders: Headers
  ) {
    const hasPassword = await this.userRepo.hasCredentialPassword(userId)

    if (hasPassword) {
      if (!body.password) {
        throw new Error("Confirmation password is required.")
      }

      try {
        const auth = getAuth(this.env)
        const isValid = await auth.api.verifyPassword({
          body: { password: body.password },
          headers: rawHeaders,
        })

        if (!isValid) {
          throw new Error("Incorrect confirmation password.")
        }
      } catch (e: any) {
        throw new Error(e.message || "Invalid password entered.")
      }
    } else {
      if (
        !body.email ||
        body.email.toLowerCase().trim() !== userEmail.toLowerCase().trim()
      ) {
        throw new Error("Confirmation email does not match.")
      }
    }

    await this.userRepo.deleteUser(userId)
  }
}
