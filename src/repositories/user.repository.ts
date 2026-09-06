import { createDbClient, users, accounts, comics, chapters, comments } from "@/db";
import type { DbClient } from "@/db";
import { eq, like, or, count, desc, and, isNotNull } from "drizzle-orm";

export interface ListUsersParams {
  query?: string;
  page: number;
  limit: number;
}

export class UserRepository {
  private db: DbClient;

  constructor(databaseUrl: string) {
    this.db = createDbClient(databaseUrl);
  }

  async findUsersPaginated(params: ListUsersParams) {
    const { query, page, limit } = params;
    const offset = (page - 1) * limit;

    const searchCondition = query
      ? or(like(users.name, `%${query}%`), like(users.email, `%${query}%`))
      : undefined;

    const [totalRes] = await this.db
      .select({ count: count() })
      .from(users)
      .where(searchCondition);

    const userList = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(searchCondition)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      users: userList,
      total: totalRes?.count || 0,
    };
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async hasCredentialPassword(userId: string) {
    const [credAccount] = await this.db
      .select({ id: accounts.id })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, userId),
          eq(accounts.providerId, "credential"),
          isNotNull(accounts.password)
        )
      );
    return Boolean(credAccount);
  }

  async updateUser(id: string, data: Partial<typeof users.$inferInsert>) {
    await this.db.update(users).set(data).where(eq(users.id, id));
    return this.findById(id);
  }

  async deleteUser(id: string) {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async getSystemStats() {
    const [totalUsersRes] = await this.db.select({ count: count() }).from(users);
    const [totalComicsRes] = await this.db.select({ count: count() }).from(comics);
    const [totalChaptersRes] = await this.db.select({ count: count() }).from(chapters);
    const [totalCommentsRes] = await this.db.select({ count: count() }).from(comments);

    return {
      totalUsers: totalUsersRes?.count || 0,
      totalComics: totalComicsRes?.count || 0,
      totalChapters: totalChaptersRes?.count || 0,
      totalComments: totalCommentsRes?.count || 0,
    };
  }
}
