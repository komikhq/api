import { UserRepository, type ListUsersParams } from "@/repositories/user.repository";
import { getAuth } from "@/lib/auth";
import type { UserSessionPayload } from "@/middleware/auth";

export class AdminService {
  private userRepo: UserRepository;
  private env: any;

  constructor(databaseUrl: string, env: any) {
    this.userRepo = new UserRepository(databaseUrl);
    this.env = env;
  }

  async listUsers(params: ListUsersParams) {
    const { users, total } = await this.userRepo.findUsersPaginated(params);
    return {
      users,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async createUser(data: { name: string; email: string; password?: string; role?: string }) {
    if (!data.name || !data.email || !data.password) {
      throw new Error("Name, email, and password are required.");
    }

    const auth = getAuth(this.env);
    const newUser = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    if (!newUser) {
      throw new Error("Failed to create user via auth engine.");
    }

    const role = data.role || "user";
    if (role !== "user") {
      await this.userRepo.updateUser(newUser.user.id, { role });
    }

    return { ...newUser.user, role };
  }

  async updateUser(userId: string, data: { name?: string; email?: string; role?: string; password?: string }, rawHeaders: Headers) {
    const existingUser = await this.userRepo.findById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updateData: any = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;

    await this.userRepo.updateUser(userId, updateData);

    // Invalidate KV Session
    try {
      if (this.env.KV_KOMIKHQ) {
        const list = await this.env.KV_KOMIKHQ.list({ prefix: "session:" });
        for (const key of list.keys) {
          const sess = (await this.env.KV_KOMIKHQ.get(key.name, "json")) as UserSessionPayload | null;
          if (sess && sess.userId === userId) {
            await this.env.KV_KOMIKHQ.delete(key.name);
          }
        }
      }
    } catch (e) {
      console.error("[AdminService] Failed to purge KV session:", e);
    }

    if (data.password && data.password.trim().length > 0) {
      const auth = getAuth(this.env);
      try {
        const hasCred = await this.userRepo.hasCredentialPassword(userId);
        if (hasCred) {
          await auth.api.setPassword({
            body: { newPassword: data.password },
            headers: rawHeaders,
          });
        }
      } catch (e) {
        console.error("[AdminService] Failed to reset password:", e);
      }
    }

    return this.userRepo.findById(userId);
  }

  async deleteUser(userId: string, currentUserId?: string) {
    if (userId === currentUserId) {
      throw new Error("Anda tidak dapat menghapus akun Anda sendiri dari admin panel.");
    }

    const existingUser = await this.userRepo.findById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Purge KV Sessions
    try {
      if (this.env.KV_KOMIKHQ) {
        const list = await this.env.KV_KOMIKHQ.list({ prefix: "session:" });
        for (const key of list.keys) {
          const sess = (await this.env.KV_KOMIKHQ.get(key.name, "json")) as UserSessionPayload | null;
          if (sess && sess.userId === userId) {
            await this.env.KV_KOMIKHQ.delete(key.name);
          }
        }
      }
    } catch (e) {
      console.error("[AdminService] Failed to purge KV sessions for deleted user:", e);
    }

    // Delete R2 Avatar
    if (existingUser.image && this.env.USERS_BUCKET) {
      try {
        const url = new URL(existingUser.image);
        const objectKey = url.pathname.replace(/^\//, "");
        if (objectKey.startsWith("avatars/")) {
          await this.env.USERS_BUCKET.delete(objectKey);
        }
      } catch (e) {
        console.error("[AdminService] Failed to delete R2 avatar:", e);
      }
    }

    await this.userRepo.deleteUser(userId);
    return existingUser;
  }

  async getStats() {
    return this.userRepo.getSystemStats();
  }
}
