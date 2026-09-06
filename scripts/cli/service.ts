import fs from "node:fs";
import path from "node:path";
import { createDbClient, users } from "../../src/db/index.js";
import { eq, like, or, desc } from "drizzle-orm";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
    if (fs.existsSync(devVarsPath)) {
      const content = fs.readFileSync(devVarsPath, "utf-8");
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (e) {}

  return "postgres://postgres:postgres@localhost:5432/komikhq";
}

const DATABASE_URL = getDatabaseUrl();

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
}

export function createUsersCliService() {
  const db = createDbClient(DATABASE_URL);

  return {
    async fetchUsers(searchQuery: string): Promise<UserItem[]> {
      const condition = searchQuery
        ? or(like(users.name, `%${searchQuery}%`), like(users.email, `%${searchQuery}%`))
        : undefined;

      const res = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(condition)
        .orderBy(desc(users.createdAt))
        .limit(20);

      return res as UserItem[];
    },

    async updateName(userId: string, name: string): Promise<void> {
      await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, userId));
    },

    async updateEmail(userId: string, email: string): Promise<void> {
      await db.update(users).set({ email, updatedAt: new Date() }).where(eq(users.id, userId));
    },

    async toggleRole(userId: string, currentRole: string): Promise<string> {
      const newRole = currentRole === "admin" ? "user" : "admin";
      await db.update(users).set({ role: newRole, updatedAt: new Date() }).where(eq(users.id, userId));
      return newRole;
    },

    async deleteUser(userId: string): Promise<void> {
      await db.delete(users).where(eq(users.id, userId));
    },
  };
}
